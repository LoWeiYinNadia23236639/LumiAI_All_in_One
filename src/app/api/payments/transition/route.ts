import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest, jsonError } from "@/lib/server/auth";
import { notify } from "@/lib/notifications/server";

export async function POST(req: NextRequest) {
  const auth = await authenticateRequest(req);
  if (auth instanceof NextResponse) return auth;
  const { userId, admin } = auth;

  let body: { payment_id?: string; action?: string };
  try {
    body = await req.json();
  } catch {
    return jsonError(400, "Invalid request body");
  }
  if (!body.payment_id) {
    return jsonError(400, "payment_id is required");
  }
  if (body.action !== "mark_paid" && body.action !== "confirm") {
    return jsonError(400, "action must be 'mark_paid' or 'confirm'");
  }

  const { data: payment } = await admin
    .from("payments")
    .select("id, campaign_id, creator_id, amount, kind, status, note, campaigns(title, brand_id)")
    .eq("id", body.payment_id)
    .single();
  if (!payment) {
    return jsonError(404, "Payment not found");
  }
  const campaign = payment.campaigns as unknown as {
    title: string;
    brand_id: string;
  } | null;

  if (body.action === "mark_paid") {
    if (!campaign || campaign.brand_id !== userId) {
      return jsonError(403, "Only the campaign brand can mark this payment as paid");
    }
    if (payment.status !== "pending") {
      return jsonError(400, "Only pending payments can be marked as paid");
    }
    const { data: updated, error } = await admin
      .from("payments")
      .update({ status: "paid", paid_at: new Date().toISOString() })
      .eq("id", body.payment_id)
      .select()
      .single();
    if (error || !updated) {
      return jsonError(500, "Update failed", error?.message);
    }
    void notify(payment.creator_id, "payment_paid", {
      campaign_title: campaign.title,
      amount: payment.amount,
      link: `/earnings`,
    });
    return NextResponse.json({ result: updated });
  }

  // confirm
  if (payment.creator_id !== userId) {
    return jsonError(403, "Only the payee creator can confirm this payment");
  }
  if (payment.status !== "paid") {
    return jsonError(400, "Only paid payments can be confirmed");
  }
  const { data: updated, error } = await admin
    .from("payments")
    .update({ status: "confirmed", confirmed_at: new Date().toISOString() })
    .eq("id", body.payment_id)
    .select()
    .single();
  if (error || !updated) {
    return jsonError(500, "Update failed", error?.message);
  }
  const title = campaign?.title ?? "";
  void notify(payment.creator_id, "payment_confirmed", {
    campaign_title: title,
    amount: payment.amount,
    link: `/earnings`,
  });
  if (campaign) {
    void notify(campaign.brand_id, "payment_confirmed", {
      campaign_title: title,
      amount: payment.amount,
      link: `/marketplace/campaigns/${payment.campaign_id}`,
    });
  }
  return NextResponse.json({ result: updated });
}
