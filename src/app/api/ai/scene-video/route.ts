import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { createClient } from "@supabase/supabase-js";
import {
  authenticateRequest,
  verifyToken,
  geminiErrorKind,
  SUPABASE_URL,
  GEMINI_API_KEY,
  STORYBOARD_BUCKET,
  ensureStoryboardBucket,
} from "@/lib/ai/server";

// Video generation is synchronous (~30-60s per clip) — keep within Vercel's cap.
export const maxDuration = 60;

const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Video clips come from gemini-omni-1.1-flash via the Interactions API
// (Veo is not available on this API key; omni is GA and synchronous).
// Pricing: ~$17.50 / 1M video output tokens ≈ $0.10 per second at 720p.
const VIDEO_MODEL = "gemini-omni-1.1-flash";

interface OmniVideoBlock {
  type?: string;
  data?: string;
  uri?: string;
  mime_type?: string;
}

function findVideoBlock(node: unknown): OmniVideoBlock | null {
  if (!node || typeof node !== "object") return null;
  const obj = node as Record<string, unknown>;
  if (obj.type === "video" && (typeof obj.data === "string" || typeof obj.uri === "string")) {
    return obj as unknown as OmniVideoBlock;
  }
  for (const value of Object.values(obj)) {
    if (Array.isArray(value)) {
      for (const item of value) {
        const found = findVideoBlock(item);
        if (found) return found;
      }
    } else if (value && typeof value === "object") {
      const found = findVideoBlock(value);
      if (found) return found;
    }
  }
  return null;
}

function buildMotionPrompt(body: {
  description: string;
  shot_angle: string;
  mood?: string;
}): string {
  const mood = body.mood ? ` Mood: ${body.mood}.` : "";
  return [
    `Generate a video from this image.`,
    `Scene: ${body.description}.`,
    `Camera: ${body.shot_angle}.${mood}`,
    "Subtle continuous cinematic camera movement, natural motion,",
    "photorealistic film look. No text, no subtitles, no watermark.",
  ].join(" ");
}

export async function POST(req: NextRequest) {
  const auth = authenticateRequest(req);
  if (!auth.ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const user = await verifyToken(auth);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!GEMINI_API_KEY) {
    return NextResponse.json({ error: "GEMINI_API_KEY is not configured" }, { status: 500 });
  }

  let body: {
    scene_number?: number;
    description?: string;
    shot_angle?: string;
    mood?: string;
    image_url?: string;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  if (!body.description || !body.shot_angle || !body.image_url) {
    return NextResponse.json({ error: "Missing scene fields" }, { status: 400 });
  }

  // Fetch the storyboard frame (public bucket URL).
  let imageBytes: string;
  let imageMime = "image/png";
  try {
    const res = await fetch(body.image_url);
    if (!res.ok) throw new Error(`Image download failed (HTTP ${res.status})`);
    const ct = res.headers.get("content-type");
    if (ct?.includes("jpeg") || ct?.includes("jpg")) imageMime = "image/jpeg";
    else if (ct?.includes("webp")) imageMime = "image/webp";
    imageBytes = Buffer.from(await res.arrayBuffer()).toString("base64");
  } catch (err) {
    return NextResponse.json(
      { error: "Image fetch failed", detail: err instanceof Error ? err.message : String(err) },
      { status: 400 }
    );
  }

  // Synchronous image-to-video via the Interactions API.
  let videoBase64: string | undefined;
  let videoUri: string | undefined;
  try {
    const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
    const interaction = (await ai.interactions.create({
      model: VIDEO_MODEL,
      input: [
        { type: "text", text: buildMotionPrompt(body as never) },
        { type: "image", data: imageBytes, mime_type: imageMime },
      ],
      store: false,
    })) as unknown as Record<string, unknown>;
    const block = findVideoBlock(interaction.output_video) ?? findVideoBlock(interaction.steps);
    videoBase64 = block?.data;
    videoUri = block?.uri;
    if (!videoBase64 && !videoUri) {
      throw new Error("Response contained no video block");
    }
  } catch (err) {
    console.error("[scene-video] generation failed:", err);
    const kind = geminiErrorKind(err);
    return NextResponse.json(
      {
        error: "Video generation failed",
        detail: err instanceof Error ? err.message.slice(0, 300) : String(err),
      },
      { status: kind === "quota" ? 429 : 502 }
    );
  }

  // Resolve the clip bytes.
  let mp4: Buffer;
  try {
    if (videoBase64) {
      mp4 = Buffer.from(videoBase64, "base64");
    } else {
      const res = await fetch(videoUri!);
      if (!res.ok) throw new Error(`Video download failed (HTTP ${res.status})`);
      mp4 = Buffer.from(await res.arrayBuffer());
    }
  } catch (err) {
    return NextResponse.json(
      { error: "Video download failed", detail: err instanceof Error ? err.message : String(err) },
      { status: 502 }
    );
  }

  // Upload via service role (server-side), then serve via the public bucket URL.
  const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  try {
    await ensureStoryboardBucket(admin);
  } catch (err) {
    return NextResponse.json(
      { error: "Storage setup failed", detail: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
  const path = `${user.id}/${Date.now()}-scene${Number(body.scene_number ?? 0)}.mp4`;
  const { error: uploadError } = await admin.storage
    .from(STORYBOARD_BUCKET)
    .upload(path, mp4, { contentType: "video/mp4" });
  if (uploadError) {
    return NextResponse.json(
      { error: "Upload failed", detail: uploadError.message },
      { status: 500 }
    );
  }
  const {
    data: { publicUrl },
  } = admin.storage.from(STORYBOARD_BUCKET).getPublicUrl(path);

  // Record only signed-in activity; guest demos do not enter private history.
  if (!user.isGuest) {
    const { error: insertError } = await auth.userClient.from("generations").insert({
      user_id: user.id,
      type: "storyboard-scene-video",
      prompt: buildMotionPrompt(body as never).slice(0, 500),
      result: JSON.stringify({ url: publicUrl, model: VIDEO_MODEL }),
    });
    if (insertError) console.error("[scene-video] record failed:", insertError.message);
  }

  return NextResponse.json({ url: publicUrl });
}
