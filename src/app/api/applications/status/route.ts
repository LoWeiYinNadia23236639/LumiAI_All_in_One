import { NextRequest, NextResponse } from "next/server";
import {
  authenticateRequest,
  getProfile,
  isBrandProfile,
  jsonError,
} from "@/lib/server/auth";
import { notify } from "@/lib/notifications/server";

async function ensureContractDraft(
  admin: import("@supabase/supabase-js").SupabaseClient,
  campaign: { id: string; brand_id: string; terms: string | null },
  creatorId: string
) {
  await admin
    .from("contracts")
    .upsert(
      {
        campaign_id: campaign.id,
        creator_id: creatorId,
        brand_id: campaign.brand_id,
        terms: campaign.terms ?? "",
        status: "draft",
      },
      { onConflict: "campaign_id,creator_id", ignoreDuplicates: true }
    );
}

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
  if (!body.application_id || !body.application_id.trim()) {
    return jsonError(400, "application_id is required");
  }
  if (body.action !== "accepted" && body.action !== "rejected") {
    return jsonError(400, "action must be 'accepted' or 'rejected'");
  }

  const { data: application } = await admin
    .from("applications")
    .select("id, status, creator_id, campaigns(id, title, brand_id, terms)")
    .eq("id", body.application_id)
    .single();
  if (!application) {
    return jsonError(404, "Application not found");
  }
  const campaign = (application as unknown as { campaigns: { id: string; title: string; brand_id: string; terms: string | null } | null }).campaigns;
  if (!campaign) {
    return jsonError(404, "Campaign not found");
  }

  const profile = await getProfile(admin, userId);
  const isOwner = campaign.brand_id === userId;
  if (!isOwner && !(profile?.is_admin ?? false)) {
    return jsonError(403, "Only the campaign brand can review applications");
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
    void notify(application.creator_id, "application_accepted", {
      campaign_title: campaign.title,
      link: `/marketplace/campaigns/${campaign.id}`,
    });
    await ensureContractDraft(admin, campaign, application.creator_id);
  } else {
    void notify(application.creator_id, "application_rejected", {
      campaign_title: campaign.title,
      link: `/marketplace/campaigns/${campaign.id}`,
    });
  }

  return NextResponse.json({ result: updated });
}
