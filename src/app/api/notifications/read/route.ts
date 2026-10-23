import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest, jsonError } from "@/lib/server/auth";

export async function POST(req: NextRequest) {
  const auth = await authenticateRequest(req);
  if (auth instanceof NextResponse) return auth;
  const { userId, admin } = auth;

  let body: { id?: string; all?: boolean };
  try {
    body = await req.json();
  } catch {
    return jsonError(400, "Invalid request body");
  }

  if (body.all) {
    const { error } = await admin
      .from("notifications")
      .update({ read: true })
      .eq("user_id", userId)
      .eq("read", false);
    if (error) return jsonError(500, "Update failed", error.message);
    return NextResponse.json({ result: { ok: true } });
  }

  if (!body.id) {
    return jsonError(400, "id or all=true is required");
  }
  const { error } = await admin
    .from("notifications")
    .update({ read: true })
    .eq("id", body.id)
    .eq("user_id", userId);
  if (error) return jsonError(500, "Update failed", error.message);
  return NextResponse.json({ result: { ok: true } });
}
