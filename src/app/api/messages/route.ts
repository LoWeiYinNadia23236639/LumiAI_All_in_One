import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest, jsonError } from "@/lib/server/auth";
import { notify } from "@/lib/notifications/server";

export async function POST(req: NextRequest) {
  const auth = await authenticateRequest(req);
  if (auth instanceof NextResponse) return auth;
  const { userId, admin } = auth;

  let body: { conversation_id?: string; body?: string };
  try {
    body = await req.json();
  } catch {
    return jsonError(400, "Invalid request body");
  }
  if (!body.conversation_id) {
    return jsonError(400, "conversation_id is required");
  }
  const text = body.body?.trim() ?? "";
  if (!text) {
    return jsonError(400, "body is required");
  }
  if (text.length > 2000) {
    return jsonError(400, "Message is too long (max 2000 characters)");
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

  const { data: inserted, error } = await admin
    .from("messages")
    .insert({
      conversation_id: body.conversation_id,
      sender_id: userId,
      body: text,
    })
    .select()
    .single();
  if (error || !inserted) {
    return jsonError(500, "Insert failed", error?.message);
  }

  const recipientId =
    conversation.brand_id === userId
      ? conversation.creator_id
      : conversation.brand_id;
  void notify(recipientId, "message", {
    link: `/messages?conversation=${body.conversation_id}`,
  });

  return NextResponse.json({ result: inserted });
}
