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

export const maxDuration = 60;

const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const ASPECTS = ["16:9", "9:16", "3:4", "4:3"] as const;

const ASPECT_PROMPTS: Record<(typeof ASPECTS)[number], string> = {
  "16:9": "16:9 widescreen landscape composition",
  "9:16": "9:16 vertical portrait composition, framed for phone viewing",
  "3:4": "3:4 vertical portrait composition",
  "4:3": "4:3 landscape composition",
};

// Gemini image models, in preference order. Rotate on failure.
const IMAGE_MODELS = [
  "gemini-2.5-flash-image",
  "gemini-2.0-flash-preview-image-generation",
];

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

interface ReferenceImage { data: string; mimeType: string }

async function loadReferenceImage(url?: string): Promise<ReferenceImage | undefined> {
  if (!url) return undefined;
  const allowedPrefix = `${SUPABASE_URL.replace(/\/$/, "")}/storage/v1/object/public/${STORYBOARD_BUCKET}/`;
  if (!url.startsWith(allowedPrefix)) throw new Error("Reference image must come from the LumiAI storyboard bucket");
  const response = await fetch(url);
  if (!response.ok) throw new Error("Could not load the storyboard identity reference");
  const mimeType = response.headers.get("content-type")?.split(";")[0] || "image/png";
  if (!["image/png", "image/jpeg", "image/webp"].includes(mimeType)) throw new Error("Unsupported reference image format");
  const buffer = Buffer.from(await response.arrayBuffer());
  if (buffer.byteLength > 10 * 1024 * 1024) throw new Error("Reference image exceeds 10 MB");
  return { data: buffer.toString("base64"), mimeType };
}

function buildImagePrompt(body: {
  description: string;
  shot_angle: string;
  lighting: string;
  mood?: string;
  aspect: string;
  creator_profile?: string;
  has_reference?: boolean;
  refinement_note?: string;
  refinement_scope?: string;
}): string {
  const mood = body.mood ? ` Overall mood: ${body.mood}.` : "";
  const creator = body.creator_profile ? ` Creator identity specified by the user: ${body.creator_profile}.` : " Use one adult creator throughout this storyboard; do not introduce extra people unless explicitly requested.";
  const identityReference = body.has_reference
    ? " The attached reference image is the identity lock. Reproduce the exact same creator: same gender presentation, facial structure, skin tone, hairstyle, hair colour, apparent age, body characteristics and clothing, unless the user explicitly requests a wardrobe change. If the reference is a photograph, transfer only the creator's identity into the storyboard sketch; do not copy the photograph's background, framing or colour treatment. Change only the camera angle, pose and action required by this scene. Never cast a new person."
    : "";
  const refinement = body.refinement_note
    ? ` Revision requested (${body.refinement_scope || "full"} scene scope): ${body.refinement_note}. Preserve every creator, product, location, lighting and style detail not explicitly requested to change.`
    : "";
  return [
    "A professional realistic editorial storyboard sketch for a social media video shoot.",
    `Shot and camera composition: ${body.shot_angle}.`,
    `Scene: ${body.description}.`,
    `Lighting: ${body.lighting}.${mood}${creator}${identityReference}`,
    "Use clean confident pencil linework, recognizable facial features, anatomically sound hands, subtle grayscale shading and enough spatial detail to make the camera angle unmistakable.",
    "Keep the same creator identity, product shape, room and visual language as the rest of the storyboard. Show the shot as a usable filming plan, not a polished advertisement.",
    "Leave calm negative space suitable for a later semi-transparent text overlay. Do not draw a text box and do not add any lettering.",
    `${ASPECT_PROMPTS[body.aspect as keyof typeof ASPECT_PROMPTS] ?? ASPECT_PROMPTS["16:9"]}.`,
    `${refinement} No text, no watermark, no borders, no colour.`,
  ].join(" ");
}

async function generateImage(prompt: string, aspect: string, reference?: ReferenceImage): Promise<string> {
  if (!GEMINI_API_KEY) throw new Error("GEMINI_API_KEY is not configured");
  const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
  const parts: ({ text: string } | { inlineData: ReferenceImage })[] = [{ text: prompt }];
  if (reference) parts.push({ inlineData: reference });
  const contents = [{ role: "user" as const, parts }];
  const config = { imageConfig: { aspectRatio: aspect } };
  let lastErr: unknown = new Error("no image model succeeded");
  for (const model of IMAGE_MODELS) {
    try {
      const res = await ai.models.generateContent({ model, contents, config });
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
          const res2 = await ai.models.generateContent({ model, contents, config });
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
    aspect?: string;
    creator_profile?: string;
    reference_image_url?: string;
    refinement_note?: string;
    refinement_scope?: string;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  if (!body.description || !body.shot_angle || !body.lighting) {
    return NextResponse.json({ error: "Missing scene fields" }, { status: 400 });
  }
  const aspect = ASPECTS.includes(body.aspect as (typeof ASPECTS)[number])
    ? (body.aspect as (typeof ASPECTS)[number])
    : "16:9";
  const refinementNote = typeof body.refinement_note === "string" ? body.refinement_note.trim().slice(0, 1200) : "";
  const refinementScope = ["image", "action", "full"].includes(body.refinement_scope || "") ? body.refinement_scope : undefined;
  const creatorProfile = typeof body.creator_profile === "string" ? body.creator_profile.trim().slice(0, 800) : "";

  let imageBytes: string;
  try {
    const reference = await loadReferenceImage(body.reference_image_url);
    imageBytes = await generateImage(
      buildImagePrompt({
        description: body.description,
        shot_angle: body.shot_angle,
        lighting: body.lighting,
        mood: body.mood,
        aspect,
        creator_profile: creatorProfile,
        has_reference: Boolean(reference),
        refinement_note: refinementNote,
        refinement_scope: refinementScope,
      }),
      aspect,
      reference
    );
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
  try {
    await ensureStoryboardBucket(admin);
  } catch (err) {
    console.error("[scene-image] bucket setup failed:", err);
    return NextResponse.json(
      { error: "Storage setup failed", detail: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
  const path = `${user.id}/${Date.now()}-s${Number(body.scene_number ?? 0)}.png`;
  const { error: uploadError } = await admin.storage
    .from(STORYBOARD_BUCKET)
    .upload(path, Buffer.from(imageBytes, "base64"), { contentType: "image/png" });
  if (uploadError) {
    console.error("[scene-image] upload failed:", uploadError.message);
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
      type: "storyboard-visual",
      prompt: JSON.stringify(body),
      result: JSON.stringify({ url: publicUrl, scene_number: body.scene_number ?? null }),
    });
    if (insertError) console.error("[scene-image] record failed:", insertError.message);
  }

  return NextResponse.json({ url: publicUrl });
}
