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

  let body: { application_id?: string; action?: string };
  try {
    body = await req.json();
  } catch {
    return jsonError(400, "Invalid request body");
  }
  if (!body.application_id) {
    return jsonError(400, "application_id is required");
  }
  if (body.action !== "accepted" && body.action !== "rejected") {
    return jsonError(400, "action must be 'accepted' or 'rejected'");
  }

  const { data: application } = await admin
    .from("applications")
    .select("id, status, offer, creator_id, campaigns(id, title, brand_id, terms)")
    .eq("id", body.application_id)
    .single();
  if (!application) {
    return jsonError(404, "Offer not found");
  }
  if (application.creator_id !== userId) {
    return jsonError(403, "Only the invited creator can respond to this offer");
  }
  if (!application.offer || application.status !== "pending") {
    return jsonError(400, "This offer is no longer pending");
  }
  const campaign = application.campaigns as unknown as {
    id: string;
    title: string;
    brand_id: string;
    terms: string | null;
  } | null;
  if (!campaign) {
    return jsonError(404, "Campaign not found");
  }

  const { data: updated, error } = await admin
    .from("applications")
    .update({ status: body.action })
    .eq("id", body.application_id)
    .select("id, status")
    .single();
  if (error || !updated) {
    return jsonError(500, "Update failed", error?.message);
  }

  if (body.action === "accepted") {
    void notify(campaign.brand_id, "offer_accepted", {
      campaign_title: campaign.title,
      link: `/marketplace/campaigns/${campaign.id}`,
    });
    await admin
      .from("contracts")
      .upsert(
        {
          campaign_id: campaign.id,
          creator_id: userId,
          brand_id: campaign.brand_id,
          terms: campaign.terms ?? "",
          status: "draft",
        },
        { onConflict: "campaign_id,creator_id", ignoreDuplicates: true }
      );
  } else {
    const profile = await getProfile(admin, userId);
    void notify(campaign.brand_id, "offer_declined", {
      campaign_title: campaign.title,
      creator_name: profile?.name ?? "",
      link: `/marketplace/campaigns/${campaign.id}`,
    });
  }

  return NextResponse.json({ result: updated });
}
