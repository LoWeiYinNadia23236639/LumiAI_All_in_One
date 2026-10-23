import { NextRequest, NextResponse } from "next/server";
import {
  authenticateRequest,
  getProfile,
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
    .select("id, title, brand_id, terms")
    .eq("id", body.campaign_id)
    .single();
  if (!campaign) {
    return jsonError(404, "Campaign not found");
  }

  const isBrand = campaign.brand_id === userId;
  let creatorId: string | null = null;
  if (!isBrand) {
    const { data: application } = await admin
      .from("applications")
      .select("creator_id, status")
      .eq("campaign_id", body.campaign_id)
      .eq("creator_id", userId)
      .eq("status", "accepted")
      .maybeSingle();
    if (!application) {
      return jsonError(403, "Only the brand or the accepted creator can sign the contract");
    }
    creatorId = application.creator_id;
  } else {
    const { data: acceptedApp } = await admin
      .from("applications")
      .select("creator_id")
      .eq("campaign_id", body.campaign_id)
      .eq("status", "accepted")
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();
    creatorId = acceptedApp?.creator_id ?? null;
  }
  if (!creatorId) {
    return jsonError(400, "No accepted creator for this campaign yet");
  }

  const profile = await getProfile(admin, userId);
  if (!isBrand && !(profile?.is_admin ?? false) && creatorId !== userId) {
    return jsonError(403, "Only the brand or the accepted creator can sign the contract");
  }

  // Ensure a draft contract exists (accept-path may not have created one yet)
  await admin
    .from("contracts")
    .upsert(
      {
        campaign_id: body.campaign_id,
        creator_id: creatorId,
        brand_id: campaign.brand_id,
        terms: campaign.terms ?? "",
        status: "draft",
      },
      { onConflict: "campaign_id,creator_id", ignoreDuplicates: true }
    );

  const patch = isBrand
    ? { brand_agreed_at: new Date().toISOString() }
    : { creator_agreed_at: new Date().toISOString() };
  const { data: contract, error } = await admin
    .from("contracts")
    .update(patch)
    .eq("campaign_id", body.campaign_id)
    .eq("creator_id", creatorId)
    .select()
    .single();
  if (error || !contract) {
    return jsonError(500, "Contract update failed", error?.message);
  }

  const agreed =
    contract.brand_agreed_at != null && contract.creator_agreed_at != null;
  if (agreed && contract.status !== "agreed") {
    await admin
      .from("contracts")
      .update({ status: "agreed" })
      .eq("id", contract.id);
    contract.status = "agreed";
  }

  if (agreed) {
    void notify(
      isBrand ? creatorId : campaign.brand_id,
      "contract_agreed",
      { campaign_title: campaign.title, link: `/marketplace/campaigns/${campaign.id}` }
    );
  } else {
    void notify(
      isBrand ? creatorId : campaign.brand_id,
      "contract_pending_signature",
      { campaign_title: campaign.title, link: `/marketplace/campaigns/${campaign.id}` }
    );
  }

  return NextResponse.json({ result: contract });
}
