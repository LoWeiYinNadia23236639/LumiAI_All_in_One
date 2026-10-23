import { NextRequest, NextResponse } from "next/server";
import { spawn } from "child_process";
import { promises as fs } from "fs";
import os from "os";
import path from "path";
import ffmpegPath from "ffmpeg-static";
import { createClient } from "@supabase/supabase-js";
import {
  authenticateRequest,
  verifyToken,
  SUPABASE_URL,
} from "@/lib/ai/server";

export const maxDuration = 60;
export const runtime = "nodejs";

const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const STORAGE_BUCKET = "storyboard-media";
const FRAMES_PER_SCENE = 60; // 2.5s @ 24fps

function runFfmpeg(args: string[]): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!ffmpegPath) return reject(new Error("ffmpeg binary not available"));
    const proc = spawn(ffmpegPath, args, { stdio: ["ignore", "ignore", "pipe"] });
    let stderr = "";
    proc.stderr.on("data", (d) => (stderr += d.toString()));
    proc.on("error", reject);
    proc.on("close", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`ffmpeg exited ${code}: ${stderr.slice(-500)}`));
    });
  });
}

/** Alternate slow zoom-in / zoom-out to mimic basic camera moves per scene. */
function zoomExpr(index: number): string {
  return index % 2 === 0
    ? "min(zoom+0.0022,1.55)"
    : "if(eq(on,1),1.55,max(zoom-0.0022,1.0))";
}

export async function POST(req: NextRequest) {
  const auth = authenticateRequest(req);
  if (!auth.ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const user = await verifyToken(auth);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: { images?: { url?: string }[] };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  const images = (body.images ?? []).map((i) => i?.url).filter(Boolean) as string[];
  if (images.length < 2 || images.length > 10) {
    return NextResponse.json({ error: "Provide between 2 and 10 image URLs" }, { status: 400 });
  }

  const tmp = os.tmpdir();
  const dir = path.join(tmp, `sb-${Date.now()}`);
  await fs.mkdir(dir, { recursive: true });

  try {
    // 1. Download images
    const localFiles: string[] = [];
    for (let i = 0; i < images.length; i++) {
      const res = await fetch(images[i]);
      if (!res.ok) throw new Error(`Failed to download image ${i + 1} (HTTP ${res.status})`);
      const buf = Buffer.from(await res.arrayBuffer());
      const ext = res.headers.get("content-type")?.includes("png") ? "png" : "jpg";
      const file = path.join(dir, `scene-${i}.${ext}`);
      await fs.writeFile(file, buf);
      localFiles.push(file);
    }

    // 2. Build ffmpeg filter graph: Ken Burns per scene + concat.
    // NOTE: still inputs must NOT use `-loop 1` — combined with zoompan's `d=`
    // it multiplies frames per looped input frame and never terminates.
    const args: string[] = ["-y"];
    for (const f of localFiles) args.push("-i", f);
    const parts: string[] = [];
    const labels: string[] = [];
    for (let i = 0; i < localFiles.length; i++) {
      parts.push(
        `[${i}:v]scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080,` +
          `zoompan=z='${zoomExpr(i)}':d=${FRAMES_PER_SCENE}:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':` +
          `s=1280x720:fps=24,format=yuv420p[v${i}]`
      );
      labels.push(`[v${i}]`);
    }
    parts.push(`${labels.join("")}concat=n=${localFiles.length}:v=1:a=0[outv]`);
    args.push("-filter_complex", parts.join(";"), "-map", "[outv]");
    args.push("-c:v", "libx264", "-preset", "veryfast", "-crf", "26");
    args.push("-movflags", "+faststart", "-pix_fmt", "yuv420p");
    const outFile = path.join(dir, "animatic.mp4");
    args.push(outFile);

    await runFfmpeg(args);

    // 3. Upload to Supabase Storage
    const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
    const storagePath = `${user.id}/${Date.now()}-animatic.mp4`;
    const mp4 = await fs.readFile(outFile);
    const { error: uploadError } = await admin.storage
      .from(STORAGE_BUCKET)
      .upload(storagePath, mp4, { contentType: "video/mp4" });
    if (uploadError) {
      console.error("[storyboard-video] upload failed:", uploadError.message);
      return NextResponse.json({ error: "Upload failed" }, { status: 500 });
    }
    const {
      data: { publicUrl },
    } = admin.storage.from(STORAGE_BUCKET).getPublicUrl(storagePath);

    // 4. Record (non-fatal)
    const { error: insertError } = await auth.userClient.from("generations").insert({
      user_id: user.id,
      type: "storyboard-video",
      prompt: JSON.stringify({ images }),
      result: JSON.stringify({ url: publicUrl }),
    });
    if (insertError) console.error("[storyboard-video] record failed:", insertError.message);

    return NextResponse.json({ url: publicUrl });
  } catch (err) {
    console.error("[storyboard-video] failed:", err);
    return NextResponse.json(
      { error: "Video assembly failed", detail: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  } finally {
    await fs.rm(dir, { recursive: true, force: true }).catch(() => {});
  }
}
