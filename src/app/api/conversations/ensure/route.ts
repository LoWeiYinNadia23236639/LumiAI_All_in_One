import { NextRequest, NextResponse } from "next/server";
import {
  authenticateRequest,
  getProfile,
  jsonError,
} from "@/lib/server/auth";

export async function POST(req: NextRequest) {
  const auth = await authenticateRequest(req);
  if (auth instanceof NextResponse) return auth;
  const { userId, admin } = auth;

  let body: { campaign_id?: string; creator_id?: string };
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
    .select("id, brand_id")
    .eq("id", body.campaign_id)
    .single();
  if (!campaign) {
    return jsonError(404, "Campaign not found");
  }

  const profile = await getProfile(admin, userId);
  const isBrand = campaign.brand_id === userId;
  let creatorId: string | null = null;

  if (isBrand) {
    creatorId = body.creator_id ?? null;
    if (!creatorId) {
      return jsonError(400, "creator_id is required for the campaign brand");
    }
    const { data: application } = await admin
      .from("applications")
      .select("id")
      .eq("campaign_id", body.campaign_id)
      .eq("creator_id", creatorId)
      .maybeSingle();
    if (!application) {
      return jsonError(403, "This creator has not applied to your campaign");
    }
  } else {
    if (profile?.role !== "creator" && !(profile?.is_admin ?? false)) {
      return jsonError(403, "Only the campaign brand or an applicant creator can start a conversation");
    }
    const { data: application } = await admin
      .from("applications")
      .select("id")
      .eq("campaign_id", body.campaign_id)
      .eq("creator_id", userId)
      .maybeSingle();
    if (!application) {
      return jsonError(403, "You need an application on this campaign to message the brand");
    }
    creatorId = userId;
  }

  const { data: existing } = await admin
    .from("conversations")
    .select("id")
    .eq("campaign_id", body.campaign_id)
    .eq("creator_id", creatorId)
    .maybeSingle();
  if (existing) {
    return NextResponse.json({ conversation_id: existing.id });
  }

  const { data: inserted, error } = await admin
    .from("conversations")
    .insert({
      campaign_id: body.campaign_id,
      brand_id: campaign.brand_id,
      creator_id: creatorId,
    })
    .select("id")
    .single();
  if (error || !inserted) {
    // unique(campaign_id, creator_id) race — return the existing row
    if (error?.code === "23505") {
      const { data: raced } = await admin
        .from("conversations")
        .select("id")
        .eq("campaign_id", body.campaign_id)
        .eq("creator_id", creatorId)
        .single();
      if (raced) {
        return NextResponse.json({ conversation_id: raced.id });
      }
    }
    return jsonError(500, "Insert failed", error?.message);
  }

  return NextResponse.json({ conversation_id: inserted.id });
}
