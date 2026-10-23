import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest, jsonError } from "@/lib/server/auth";

export async function POST(req: NextRequest) {
  const auth = await authenticateRequest(req);
  if (auth instanceof NextResponse) return auth;
  const { userId, admin } = auth;

  let body: { conversation_id?: string };
  try {
    body = await req.json();
  } catch {
    return jsonError(400, "Invalid request body");
  }
  if (!body.conversation_id) {
    return jsonError(400, "conversation_id is required");
  }

  const { data: conversation } = await admin
    .from("conversations")
    .select("id, brand_id, creator_id")
    .eq("id", body.conversation_id)
    .single();
  if (!conversation) {
    return jsonError(404, "Conversation not found");
  }
  if (conversation.brand_id !== userId && conversation.creator_id !== userId) {
    return jsonError(403, "You are not a participant in this conversation");
  }

  const { error } = await admin
    .from("messages")
    .update({ read: true })
    .eq("conversation_id", body.conversation_id)
    .neq("sender_id", userId)
    .eq("read", false);
  if (error) {
    return jsonError(500, "Update failed", error.message);
  }
  return NextResponse.json({ result: { ok: true } });
}
