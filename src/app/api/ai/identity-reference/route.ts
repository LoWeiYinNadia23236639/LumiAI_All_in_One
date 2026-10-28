import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import {
  authenticateRequest,
  verifyToken,
  enforceGuestRateLimit,
  SUPABASE_URL,
  STORYBOARD_BUCKET,
  ensureStoryboardBucket,
} from "@/lib/ai/server";

export const maxDuration = 30;

const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const MAX_PHOTO_BYTES = 8 * 1024 * 1024;
const PHOTO_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export async function POST(req: NextRequest) {
  const auth = authenticateRequest(req);
  if (!auth.ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const user = await verifyToken(auth);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: "Invalid upload" }, { status: 400 });
  }
  const photo = form.get("photo");
  if (!(photo instanceof File)) return NextResponse.json({ error: "Choose a photo to upload" }, { status: 400 });
  const extension = PHOTO_TYPES[photo.type];
  if (!extension) return NextResponse.json({ error: "Use a JPG, PNG or WebP image" }, { status: 415 });
  if (photo.size <= 0 || photo.size > MAX_PHOTO_BYTES) {
    return NextResponse.json({ error: "Photo must be smaller than 8 MB" }, { status: 413 });
  }
  if (user.isGuest) {
    const guestLimit = enforceGuestRateLimit(req, "identity");
    if (guestLimit) return guestLimit;
  }

  const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  try {
    await ensureStoryboardBucket(admin);
    const path = `${user.id}/identity-${Date.now()}.${extension}`;
    const { error: uploadError } = await admin.storage
      .from(STORYBOARD_BUCKET)
      .upload(path, Buffer.from(await photo.arrayBuffer()), {
        contentType: photo.type,
        cacheControl: "3600",
      });
    if (uploadError) {
      console.error("[identity-reference] upload failed:", uploadError.message);
      return NextResponse.json({ error: "Upload failed" }, { status: 500 });
    }
    const { data: { publicUrl } } = admin.storage.from(STORYBOARD_BUCKET).getPublicUrl(path);
    return NextResponse.json({ url: publicUrl });
  } catch (error) {
    console.error("[identity-reference] storage failed:", error);
    return NextResponse.json({ error: "Could not prepare photo storage" }, { status: 500 });
  }
}
