import { NextRequest, NextResponse } from "next/server";
import {
  authenticateRequest,
  getProfile,
  isBrandProfile,
  jsonError,
} from "@/lib/server/auth";
import { notify } from "@/lib/notifications/server";

const ALLOWED_KINDS = ["campaign_fee", "retainer", "commission", "barter_value"];

export async function POST(req: NextRequest) {
  const auth = await authenticateRequest(req);
  if (auth instanceof NextResponse) return auth;
  const { userId, admin } = auth;

  const profile = await getProfile(admin, userId);
  if (!profile || !isBrandProfile(profile)) {
    return jsonError(403, "Only brands can record payments");
  }

  let body: {
    campaign_id?: string;
    creator_id?: string;
    amount?: number;
    kind?: string;
    note?: string;
  };
  try {
    body = await req.json();
  } catch {
    return jsonError(400, "Invalid request body");
  }
  if (!body.campaign_id || !body.creator_id) {
    return jsonError(400, "campaign_id and creator_id are required");
  }
  if (
    typeof body.amount !== "number" ||
    Number.isNaN(body.amount) ||
    body.amount <= 0
  ) {
    return jsonError(400, "amount must be a number greater than 0");
  }
  if (!body.kind || !ALLOWED_KINDS.includes(body.kind)) {
    return jsonError(400, `kind must be one of: ${ALLOWED_KINDS.join(", ")}`);
  }

  const { data: campaign } = await admin
    .from("campaigns")
    .select("id, title, brand_id")
    .eq("id", body.campaign_id)
    .single();
  if (!campaign) {
    return jsonError(404, "Campaign not found");
  }
  if (campaign.brand_id !== userId) {
    return jsonError(403, "You do not own this campaign");
  }

  const { data: application } = await admin
    .from("applications")
    .select("id")
    .eq("campaign_id", body.campaign_id)
    .eq("creator_id", body.creator_id)
    .eq("status", "accepted")
    .maybeSingle();
  if (!application) {
    return jsonError(400, "This creator has no accepted application for this campaign");
  }

  const { data: inserted, error } = await admin
    .from("payments")
    .insert({
      campaign_id: body.campaign_id,
      creator_id: body.creator_id,
      amount: body.amount,
      kind: body.kind,
      status: "pending",
      note: body.note?.trim() || "",
    })
    .select()
    .single();
  if (error || !inserted) {
    return jsonError(500, "Insert failed", error?.message);
  }

  void notify(body.creator_id, "payment_recorded", {
    campaign_title: campaign.title,
    amount: body.amount,
    link: `/marketplace/campaigns/${campaign.id}`,
  });

  return NextResponse.json({ result: inserted });
}
