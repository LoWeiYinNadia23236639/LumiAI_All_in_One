import { NextRequest, NextResponse } from "next/server";
import {
  authenticateRequest,
  jsonError,
} from "@/lib/server/auth";
import { notify } from "@/lib/notifications/server";

export async function POST(req: NextRequest) {
  const auth = await authenticateRequest(req);
  if (auth instanceof NextResponse) return auth;
  const { userId, admin } = auth;

  let body: { campaign_id?: string };
  try {
    body = await req.json();
  } catch {
    return jsonError(400, "Invalid request body");
  }
  if (!body.campaign_id) {
    return jsonError(400, "campaign_id is required");
  }

  const { data: campaign } = await admin
    .from("campaigns")
    .select(
      "id, title, brand_id, status, campaign_type, budget, product_value, retainer_fee"
    )
    .eq("id", body.campaign_id)
    .single();
  if (!campaign) {
    return jsonError(404, "Campaign not found");
  }
  if (campaign.brand_id !== userId) {
    return jsonError(403, "Only the campaign brand can mark the campaign as completed");
  }
  if (campaign.status !== "active") {
    return jsonError(400, "Campaign is already completed");
  }

  const { data: acceptedApps } = await admin
    .from("applications")
    .select("creator_id")
    .eq("campaign_id", body.campaign_id)
    .eq("status", "accepted");
  if (!acceptedApps || acceptedApps.length === 0) {
    return jsonError(400, "No accepted creator for this campaign yet");
  }

  const { data: pendingSubs } = await admin
    .from("submissions")
    .select("id")
    .eq("campaign_id", body.campaign_id)
    .eq("status", "submitted");
  if (pendingSubs && pendingSubs.length > 0) {
    return jsonError(400, "There are submissions waiting for review");
  }

  const { error } = await admin
    .from("campaigns")
    .update({ status: "completed" })
    .eq("id", body.campaign_id);
  if (error) {
    return jsonError(500, "Update failed", error?.message);
  }

  await admin
    .from("contracts")
    .update({ status: "completed" })
    .eq("campaign_id", body.campaign_id)
    .eq("status", "agreed");

  // Auto-create payment records by campaign type (idempotent — skip if a
  // pending record for the same campaign+kind+creator already exists)
  const paymentByType: {
    kind: string;
    amount: number;
    note: string | null;
  } | null =
    campaign.campaign_type === "paid"
      ? { kind: "campaign_fee", amount: campaign.budget, note: null }
      : campaign.campaign_type === "barter"
        ? { kind: "barter_value", amount: campaign.product_value, note: null }
        : campaign.campaign_type === "ambassador"
          ? { kind: "retainer", amount: campaign.retainer_fee ?? 0, note: "首月代言費" }
          : null;

  if (paymentByType && paymentByType.amount > 0) {
    for (const app of acceptedApps) {
      const { data: existing } = await admin
        .from("payments")
        .select("id")
        .eq("campaign_id", campaign.id)
        .eq("creator_id", app.creator_id)
        .eq("kind", paymentByType.kind)
        .eq("status", "pending")
        .maybeSingle();
      if (existing) continue;
      const { error: payError } = await admin.from("payments").insert({
        campaign_id: campaign.id,
        creator_id: app.creator_id,
        amount: paymentByType.amount,
        kind: paymentByType.kind,
        status: "pending",
        note: paymentByType.note ?? "",
      });
      if (payError) {
        console.error("[campaigns/complete] payment insert failed:", payError.message);
      }
      void notify(app.creator_id, "payment_recorded", {
        campaign_title: campaign.title,
        amount: paymentByType.amount,
        link: `/marketplace/campaigns/${campaign.id}`,
      });
    }
  }

  for (const app of acceptedApps) {
    void notify(app.creator_id, "campaign_completed", {
      campaign_title: campaign.title,
      link: `/marketplace/campaigns/${campaign.id}`,
    });
  }

  return NextResponse.json({ result: { id: campaign.id, status: "completed" } });
}
