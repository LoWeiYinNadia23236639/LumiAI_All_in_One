import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest, jsonError } from "@/lib/server/auth";
import { notify } from "@/lib/notifications/server";

export async function POST(req: NextRequest) {
  const auth = await authenticateRequest(req);
  if (auth instanceof NextResponse) return auth;
  const { userId, admin } = auth;

  let body: { campaign_id?: string; rating?: number; comment?: string };
  try {
    body = await req.json();
  } catch {
    return jsonError(400, "Invalid request body");
  }
  if (!body.campaign_id) {
    return jsonError(400, "campaign_id is required");
  }
  const rating = body.rating;
  if (
    typeof rating !== "number" ||
    !Number.isInteger(rating) ||
    rating < 1 ||
    rating > 5
  ) {
    return jsonError(400, "rating must be an integer between 1 and 5");
  }
  const comment = body.comment?.trim() ?? "";

  const { data: campaign } = await admin
    .from("campaigns")
    .select("id, title, brand_id, status")
    .eq("id", body.campaign_id)
    .single();
  if (!campaign) {
    return jsonError(404, "Campaign not found");
  }
  if (campaign.status !== "completed") {
    return jsonError(400, "Reviews open after the campaign is completed");
  }

  // Reviewer must be the brand or an accepted creator; reviewee is the other party
  let revieweeId: string;
  if (campaign.brand_id === userId) {
    const { data: acceptedApp } = await admin
      .from("applications")
      .select("creator_id")
      .eq("campaign_id", body.campaign_id)
      .eq("status", "accepted")
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();
    if (!acceptedApp) {
      return jsonError(400, "No accepted creator to review for this campaign");
    }
    revieweeId = acceptedApp.creator_id;
  } else {
    const { data: ownApp } = await admin
      .from("applications")
      .select("id")
      .eq("campaign_id", body.campaign_id)
      .eq("creator_id", userId)
      .eq("status", "accepted")
      .maybeSingle();
    if (!ownApp) {
      return jsonError(403, "Only the brand or the accepted creator can leave a review");
    }
    revieweeId = campaign.brand_id;
  }

  const { data: existing } = await admin
    .from("reviews")
    .select("id")
    .eq("campaign_id", body.campaign_id)
    .eq("reviewer_id", userId)
    .maybeSingle();
  if (existing) {
    return jsonError(409, "You have already reviewed this campaign");
  }

  const { data: inserted, error } = await admin
    .from("reviews")
    .insert({
      campaign_id: body.campaign_id,
      reviewer_id: userId,
      reviewee_id: revieweeId,
      rating,
      comment,
    })
    .select()
    .single();
  if (error || !inserted) {
    return jsonError(500, "Insert failed", error?.message);
  }

  void notify(revieweeId, "review_received", {
    campaign_title: campaign.title,
    rating,
    link: `/marketplace/campaigns/${campaign.id}`,
  });

  return NextResponse.json({ result: inserted });
}
