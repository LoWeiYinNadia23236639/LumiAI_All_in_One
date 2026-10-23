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
    application_id?: string;
    action?: string;
    tracking_number?: string;
  };
  try {
    body = await req.json();
  } catch {
    return jsonError(400, "Invalid request body");
  }
  if (!body.application_id) {
    return jsonError(400, "application_id is required");
  }
  if (body.action !== "ship" && body.action !== "receive") {
    return jsonError(400, "action must be 'ship' or 'receive'");
  }

  const { data: application } = await admin
    .from("applications")
    .select("id, status, creator_id, shipping_status, campaigns(id, title, brand_id)")
    .eq("id", body.application_id)
    .single();
  if (!application) {
    return jsonError(404, "Application not found");
  }
  const campaign = application.campaigns as unknown as {
    id: string;
    title: string;
    brand_id: string;
  } | null;
  if (!campaign) {
    return jsonError(404, "Campaign not found");
  }
  if (application.status !== "accepted") {
    return jsonError(400, "Shipping is only available for accepted applications");
  }

  if (body.action === "ship") {
    if (campaign.brand_id !== userId) {
      return jsonError(403, "Only the campaign brand can mark the product as shipped");
    }
    const { data: updated, error } = await admin
      .from("applications")
      .update({
        shipping_status: "shipped",
        tracking_number: body.tracking_number?.trim() || null,
      })
      .eq("id", body.application_id)
      .select("id, shipping_status, tracking_number")
      .single();
    if (error || !updated) {
      return jsonError(500, "Update failed", error?.message);
    }
    void notify(application.creator_id, "shipment_shipped", {
      campaign_title: campaign.title,
      tracking_number: body.tracking_number?.trim() || null,
      link: `/marketplace/campaigns/${campaign.id}`,
    });
    return NextResponse.json({ result: updated });
  }

  // receive
  if (application.creator_id !== userId) {
    return jsonError(403, "Only the creator can confirm receipt");
  }
  if (application.shipping_status !== "shipped") {
    return jsonError(400, "The product has not been shipped yet");
  }
  const { data: updated, error } = await admin
    .from("applications")
    .update({ shipping_status: "received" })
    .eq("id", body.application_id)
    .select("id, shipping_status")
    .single();
  if (error || !updated) {
    return jsonError(500, "Update failed", error?.message);
  }
  void notify(campaign.brand_id, "shipment_received", {
    campaign_title: campaign.title,
    link: `/marketplace/campaigns/${campaign.id}`,
  });
  return NextResponse.json({ result: updated });
}
