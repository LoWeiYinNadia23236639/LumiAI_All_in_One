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

  let body: { campaign_id?: string; post_url?: string; note?: string };
  try {
    body = await req.json();
  } catch {
    return jsonError(400, "Invalid request body");
  }
  if (!body.campaign_id) {
    return jsonError(400, "campaign_id is required");
  }
  const postUrl = body.post_url?.trim() ?? "";
  if (!postUrl) {
    return jsonError(400, "post_url is required");
  }

  const { data: application } = await admin
    .from("applications")
    .select("id, status, campaigns(id, title, brand_id, status)")
    .eq("campaign_id", body.campaign_id)
    .eq("creator_id", userId)
    .eq("status", "accepted")
    .maybeSingle();
  if (!application) {
    return jsonError(403, "Only the accepted creator can submit work");
  }
  const campaign = application.campaigns as unknown as {
    id: string;
    title: string;
    brand_id: string;
    status: string;
  } | null;
  if (!campaign) {
    return jsonError(404, "Campaign not found");
  }
  if (campaign.status !== "active") {
    return jsonError(400, "Campaign is not active");
  }

  const { data: contract } = await admin
    .from("contracts")
    .select("id, status")
    .eq("campaign_id", body.campaign_id)
    .eq("creator_id", userId)
    .maybeSingle();
  if (!contract || contract.status !== "agreed") {
    return jsonError(
      400,
      "The contract must be agreed by both parties before submitting work"
    );
  }

  const { data: inserted, error } = await admin
    .from("submissions")
    .insert({
      campaign_id: body.campaign_id,
      creator_id: userId,
      post_url: postUrl,
      note: body.note?.trim() || "",
      status: "submitted",
    })
    .select()
    .single();
  if (error || !inserted) {
    return jsonError(500, "Insert failed", error?.message);
  }

  void notify(campaign.brand_id, "submission_received", {
    campaign_title: campaign.title,
    link: `/marketplace/campaigns/${campaign.id}`,
  });

  return NextResponse.json({ result: inserted });
}
