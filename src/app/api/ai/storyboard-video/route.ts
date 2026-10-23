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
  STORYBOARD_BUCKET,
  ensureStoryboardBucket,
} from "@/lib/ai/server";

export const maxDuration = 60;
export const runtime = "nodejs";

const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const FPS = 24;

// Output dimensions per aspect (width x height).
const OUTPUT_DIMS: Record<string, { w: number; h: number }> = {
  "16:9": { w: 1280, h: 720 },
  "9:16": { w: 720, h: 1280 },
  "3:4": { w: 960, h: 1280 },
  "4:3": { w: 1280, h: 960 },
};

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

// Curated cinematic transitions for the "random mix" style between AI clips.
const TRANSITIONS = [
  "fade",
  "dissolve",
  "circleopen",
  "wipeleft",
  "slideright",
  "smoothleft",
  "radial",
  "pixelize",
];
const TRANSITION_DURATION = 0.5; // seconds

/** Read total duration from an mp4's mvhd atom (ffprobe is not available). */
function mp4DurationSeconds(buf: Buffer): number {
  const idx = buf.indexOf(Buffer.from("mvhd"));
  if (idx < 0) throw new Error("mvhd atom not found — not a valid mp4");
  const version = buf.readUInt8(idx + 4);
  if (version === 1) {
    const timescale = buf.readUInt32BE(idx + 24);
    const duration = Number(buf.readBigUInt64BE(idx + 28));
    return duration / timescale;
  }
  const timescale = buf.readUInt32BE(idx + 16);
  const duration = buf.readUInt32BE(idx + 20);
  return duration / timescale;
}

const pick = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];

export async function POST(req: NextRequest) {
  const auth = authenticateRequest(req);
  if (!auth.ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const user = await verifyToken(auth);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: {
    images?: { url?: string }[];
    clips?: string[];
    mode?: string;
    transitions?: boolean;
    aspect?: string;
    seconds_per_scene?: number;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  const clipMode = body.mode === "clips";
  const inputs = (
    clipMode ? body.clips ?? [] : (body.images ?? []).map((i) => i?.url)
  ).filter((u): u is string => Boolean(u));
  if (inputs.length < 2 || inputs.length > 10) {
    return NextResponse.json({ error: "Provide between 2 and 10 media URLs" }, { status: 400 });
  }
  const dims = OUTPUT_DIMS[body.aspect ?? ""] ?? OUTPUT_DIMS["16:9"];
  const secondsPerScene = Math.min(6, Math.max(1, Number(body.seconds_per_scene) || 2.5));
  const framesPerScene = Math.round(secondsPerScene * FPS);
  const useTransitions = clipMode && body.transitions !== false;

  const tmp = os.tmpdir();
  const dir = path.join(tmp, `sb-${Date.now()}`);
  await fs.mkdir(dir, { recursive: true });

  try {
    // 1. Download media (images or AI clips)
    const localFiles: string[] = [];
    const clipDurations: number[] = [];
    for (let i = 0; i < inputs.length; i++) {
      const res = await fetch(inputs[i]);
      if (!res.ok) throw new Error(`Failed to download media ${i + 1} (HTTP ${res.status})`);
      const buf = Buffer.from(await res.arrayBuffer());
      const ext = clipMode
        ? "mp4"
        : res.headers.get("content-type")?.includes("png")
          ? "png"
          : "jpg";
      const file = path.join(dir, `scene-${i}.${ext}`);
      await fs.writeFile(file, buf);
      localFiles.push(file);
      if (clipMode) clipDurations.push(mp4DurationSeconds(buf));
    }

    const { w, h } = dims;
    const outFile = path.join(dir, "animatic.mp4");

    if (!clipMode) {
      // 2a. Free animatic: Ken Burns per still, joined with the same random
      // xfade transitions as the AI mode (no more hard cuts).
      const segSeconds = framesPerScene / FPS;
      const args: string[] = ["-y"];
      for (const f of localFiles) args.push("-i", f);
      const parts: string[] = [];
      for (let i = 0; i < localFiles.length; i++) {
        parts.push(
          `[${i}:v]scale=${w}:${h}:force_original_aspect_ratio=increase,crop=${w}:${h},` +
            `zoompan=z='${zoomExpr(i)}':d=${framesPerScene}:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':` +
            `s=${w}x${h}:fps=${FPS},format=yuv420p[v${i}]`
        );
      }
      let prevV = "[v0]";
      for (let k = 1; k < localFiles.length; k++) {
        const outV = `[x${k}]`;
        const offset = k * segSeconds - k * TRANSITION_DURATION;
        parts.push(
          `${prevV}[v${k}]xfade=transition=${pick(TRANSITIONS)}:duration=${TRANSITION_DURATION}:offset=${offset.toFixed(3)}${outV}`
        );
        prevV = outV;
      }
      const lastV = prevV.replace(/[[\]]/g, "");
      args.push("-filter_complex", parts.join(";"), "-map", `[${lastV}]`);
      args.push("-c:v", "libx264", "-preset", "veryfast", "-crf", "26");
      args.push("-movflags", "+faststart", "-pix_fmt", "yuv420p");
      args.push(outFile);
      await runFfmpeg(args);
    } else {
      // 2b. AI clips: normalize, then join with random xfade transitions.
      // Audio: try to keep Veo's audio tracks with acrossfade; fall back to
      // silent if any clip has no audio stream (ffmpeg graph would fail).
      const render = (withAudio: boolean): Promise<void> => {
        const args: string[] = ["-y"];
        for (const f of localFiles) args.push("-i", f);
        const d = TRANSITION_DURATION;
        const parts: string[] = [];
        const vLabels: string[] = [];
        const aLabels: string[] = [];
        for (let i = 0; i < localFiles.length; i++) {
          parts.push(
            `[${i}:v]scale=${w}:${h}:force_original_aspect_ratio=increase,crop=${w}:${h},` +
              `fps=${FPS},setsar=1,trim=duration=${clipDurations[i].toFixed(3)},` +
              `setpts=PTS-STARTPTS,format=yuv420p[v${i}]`
          );
          vLabels.push(`[v${i}]`);
          if (withAudio) {
            parts.push(
              `[${i}:a]aformat=sample_rates=48000:channel_layouts=stereo,` +
                `atrim=0:${clipDurations[i].toFixed(3)},asetpts=PTS-STARTPTS[a${i}]`
            );
            aLabels.push(`[a${i}]`);
          }
        }
        // xfade chain with per-join random transition (or plain concat)
        let prevV: string;
        let prevA = "";
        if (useTransitions) {
          prevV = vLabels[0];
          if (withAudio) prevA = aLabels[0];
          for (let k = 1; k < localFiles.length; k++) {
            const outV = `[x${k}v]`;
            // offset: start of the k-th clip minus one transition per previous join
            const offset =
              clipDurations.slice(0, k).reduce((a, b) => a + b, 0) - k * d;
            parts.push(
              `${prevV}${vLabels[k]}xfade=transition=${pick(TRANSITIONS)}:duration=${d}:offset=${offset.toFixed(3)}${outV}`
            );
            prevV = outV;
            if (withAudio) {
              const outA = `[x${k}a]`;
              parts.push(`${prevA}${aLabels[k]}acrossfade=d=${d}:c1=tri:c2=tri${outA}`);
              prevA = outA;
            }
          }
        } else {
          parts.push(`${vLabels.join("")}concat=n=${localFiles.length}:v=1${withAudio ? ":a=1" : ":a=0"}[outc]`);
          if (withAudio) {
            parts.push(`${aLabels.join("")}concat=n=${localFiles.length}:v=0:a=1[outa]`);
            prevA = "[outa]";
          }
          prevV = "[outc]";
        }
        const lastV = prevV.replace(/[[\]]/g, "");
        args.push("-filter_complex", parts.join(";"), "-map", `[${lastV}]`);
        if (withAudio) {
          const lastA = prevA.replace(/[[\]]/g, "");
          args.push("-map", `[${lastA}]`);
          args.push("-c:a", "aac", "-b:a", "128k");
        }
        args.push("-c:v", "libx264", "-preset", "veryfast", "-crf", "23");
        args.push("-movflags", "+faststart", "-pix_fmt", "yuv420p");
        args.push(outFile);
        return runFfmpeg(args);
      };

      try {
        await render(useTransitions);
      } catch (err) {
        if (!useTransitions) throw err; // plain concat path failed — nothing to fall back to
        console.error("[storyboard-video] transition render failed, retrying without audio:", err);
        await render(false);
      }
    }

    // 3. Upload to Supabase Storage
    const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
    await ensureStoryboardBucket(admin);
    const storagePath = `${user.id}/${Date.now()}-animatic.mp4`;
    const mp4 = await fs.readFile(outFile);
    const { error: uploadError } = await admin.storage
      .from(STORYBOARD_BUCKET)
      .upload(storagePath, mp4, { contentType: "video/mp4" });
    if (uploadError) {
      console.error("[storyboard-video] upload failed:", uploadError.message);
      return NextResponse.json(
        { error: "Upload failed", detail: uploadError.message },
        { status: 500 }
      );
    }
    const {
      data: { publicUrl },
    } = admin.storage.from(STORYBOARD_BUCKET).getPublicUrl(storagePath);

    // 4. Record (non-fatal)
    const { error: insertError } = await auth.userClient.from("generations").insert({
      user_id: user.id,
      type: "storyboard-video",
      prompt: JSON.stringify({ mode: clipMode ? "clips" : "images", inputs }),
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
