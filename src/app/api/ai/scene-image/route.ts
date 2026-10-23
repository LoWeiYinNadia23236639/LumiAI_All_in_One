import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { createClient } from "@supabase/supabase-js";
import {
  authenticateRequest,
  verifyToken,
  geminiErrorKind,
  SUPABASE_URL,
  GEMINI_API_KEY,
} from "@/lib/ai/server";

export const maxDuration = 60;

const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const STORAGE_BUCKET = "storyboard-media";

// Gemini image models, in preference order. Rotate on failure.
const IMAGE_MODELS = [
  "gemini-2.5-flash-image",
  "gemini-2.0-flash-preview-image-generation",
];

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function buildImagePrompt(body: {
  description: string;
  shot_angle: string;
  lighting: string;
  mood?: string;
}): string {
  const mood = body.mood ? ` Overall mood: ${body.mood}.` : "";
  return [
    "Cinematic storyboard frame for a social media video shoot.",
    `Shot: ${body.shot_angle}.`,
    `Scene: ${body.description}.`,
    `Lighting: ${body.lighting}.${mood}`,
    "Photorealistic, shallow depth of field, professional colour grading,",
    "16:9 widescreen composition. No text, no watermark, no borders.",
  ].join(" ");
}

async function generateImage(prompt: string): Promise<string> {
  if (!GEMINI_API_KEY) throw new Error("GEMINI_API_KEY is not configured");
  const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
  const contents = [{ role: "user" as const, parts: [{ text: prompt }] }];
  let lastErr: unknown = new Error("no image model succeeded");
  for (const model of IMAGE_MODELS) {
    try {
      const res = await ai.models.generateContent({ model, contents });
      const parts = res.candidates?.[0]?.content?.parts ?? [];
      for (const part of parts) {
        if (part.inlineData?.data) return part.inlineData.data;
      }
      lastErr = new Error(`${model} returned no image`);
    } catch (err) {
      lastErr = err;
      const kind = geminiErrorKind(err);
      if (kind === "quota") throw err; // fail fast, don't burn quota
      if (kind === "retryable") {
        await sleep(1200);
        try {
          const res2 = await ai.models.generateContent({ model, contents });
          const parts2 = res2.candidates?.[0]?.content?.parts ?? [];
          for (const part of parts2) {
            if (part.inlineData?.data) return part.inlineData.data;
          }
        } catch (err2) {
          lastErr = err2;
          if (geminiErrorKind(err2) === "quota") throw err2;
        }
      }
      // fatal → rotate to next image model
    }
  }
  throw lastErr;
}

export async function POST(req: NextRequest) {
  const auth = authenticateRequest(req);
  if (!auth.ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const user = await verifyToken(auth);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: {
    scene_number?: number;
    description?: string;
    shot_angle?: string;
    lighting?: string;
    mood?: string;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  if (!body.description || !body.shot_angle || !body.lighting) {
    return NextResponse.json({ error: "Missing scene fields" }, { status: 400 });
  }

  let imageBytes: string;
  try {
    imageBytes = await generateImage(buildImagePrompt(body as never));
  } catch (err) {
    console.error("[scene-image] generation failed:", err);
    return NextResponse.json(
      { error: "Image generation failed", detail: err instanceof Error ? err.message : String(err) },
      { status: 502 }
    );
  }

  // Upload via service role (server-side), then serve via the public bucket URL.
  const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const path = `${user.id}/${Date.now()}-s${Number(body.scene_number ?? 0)}.png`;
  const { error: uploadError } = await admin.storage
    .from(STORAGE_BUCKET)
    .upload(path, Buffer.from(imageBytes, "base64"), { contentType: "image/png" });
  if (uploadError) {
    console.error("[scene-image] upload failed:", uploadError.message);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
  const {
    data: { publicUrl },
  } = admin.storage.from(STORAGE_BUCKET).getPublicUrl(path);

  // Record (non-fatal). RLS: inserted as the calling user.
  const { error: insertError } = await auth.userClient.from("generations").insert({
    user_id: user.id,
    type: "storyboard-visual",
    prompt: JSON.stringify(body),
    result: JSON.stringify({ url: publicUrl, scene_number: body.scene_number ?? null }),
  });
  if (insertError) console.error("[scene-image] record failed:", insertError.message);

  return NextResponse.json({ url: publicUrl });
}
