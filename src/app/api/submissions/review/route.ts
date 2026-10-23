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

  let body: {
    submission_id?: string;
    action?: string;
    feedback?: string;
  };
  try {
    body = await req.json();
  } catch {
    return jsonError(400, "Invalid request body");
  }
  if (!body.submission_id) {
    return jsonError(400, "submission_id is required");
  }
  if (body.action !== "approved" && body.action !== "revision") {
    return jsonError(400, "action must be 'approved' or 'revision'");
  }
  const feedback = body.feedback?.trim() ?? "";
  if (body.action === "revision" && !feedback) {
    return jsonError(400, "feedback is required when requesting a revision");
  }

  const { data: submission } = await admin
    .from("submissions")
    .select("id, status, creator_id, campaigns(id, title, brand_id)")
    .eq("id", body.submission_id)
    .single();
  if (!submission) {
    return jsonError(404, "Submission not found");
  }
  const campaign = submission.campaigns as unknown as {
    id: string;
    title: string;
    brand_id: string;
  } | null;
  if (!campaign) {
    return jsonError(404, "Campaign not found");
  }
  if (campaign.brand_id !== userId) {
    return jsonError(403, "Only the campaign brand can review submissions");
  }

  const { data: updated, error } = await admin
    .from("submissions")
    .update({ status: body.action, brand_feedback: feedback || null })
    .eq("id", body.submission_id)
    .select()
    .single();
  if (error || !updated) {
    return jsonError(500, "Update failed", error?.message);
  }

  void notify(
    submission.creator_id,
    body.action === "approved" ? "submission_approved" : "submission_revision",
    {
      campaign_title: campaign.title,
      feedback: feedback || null,
      link: `/marketplace/campaigns/${campaign.id}`,
    }
  );

  return NextResponse.json({ result: updated });
}
