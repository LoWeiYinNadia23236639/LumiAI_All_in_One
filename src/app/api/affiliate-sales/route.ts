import { NextRequest, NextResponse } from "next/server";
import {
  authenticateRequest,
  getProfile,
  isBrandProfile,
  jsonError,
} from "@/lib/server/auth";
import { notify } from "@/lib/notifications/server";

export async function POST(req: NextRequest) {
  const auth = await authenticateRequest(req);
  if (auth instanceof NextResponse) return auth;
  const { userId, admin } = auth;

  const profile = await getProfile(admin, userId);
  if (!profile || !isBrandProfile(profile)) {
    return jsonError(403, "Only brands can report affiliate sales");
  }

  let body: {
    campaign_id?: string;
    creator_id?: string;
    period?: string;
    units?: number;
    revenue?: number;
  };
  try {
    body = await req.json();
  } catch {
    return jsonError(400, "Invalid request body");
  }
  if (!body.campaign_id || !body.creator_id || !body.period) {
    return jsonError(400, "campaign_id, creator_id and period are required");
  }
  if (!/^\d{4}-\d{2}$/.test(body.period)) {
    return jsonError(400, "period must be in YYYY-MM format");
  }
  if (
    typeof body.units !== "number" ||
    Number.isNaN(body.units) ||
    body.units < 0 ||
    typeof body.revenue !== "number" ||
    Number.isNaN(body.revenue) ||
    body.revenue < 0
  ) {
    return jsonError(400, "units and revenue must be non-negative numbers");
  }

  const { data: campaign } = await admin
    .from("campaigns")
    .select("id, title, brand_id, campaign_type, commission_rate")
    .eq("id", body.campaign_id)
    .single();
  if (!campaign) {
    return jsonError(404, "Campaign not found");
  }
  if (campaign.brand_id !== userId) {
    return jsonError(403, "You do not own this campaign");
  }
  if (campaign.campaign_type !== "affiliate") {
    return jsonError(400, "Sales can only be reported for affiliate campaigns");
  }
  if (campaign.commission_rate == null) {
    return jsonError(400, "This campaign has no commission rate");
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

  // Upsert the sales record (unique campaign+creator+period)
  const { data: sale, error: saleError } = await admin
    .from("affiliate_sales")
    .upsert(
      {
        campaign_id: body.campaign_id,
        creator_id: body.creator_id,
        period: body.period,
        units: body.units,
        revenue: body.revenue,
      },
      { onConflict: "campaign_id,creator_id,period" }
    )
    .select()
    .single();
  if (saleError || !sale) {
    return jsonError(500, "Sales upsert failed", saleError?.message);
  }

  // Commission payment: update the pending record for this period if present,
  // otherwise create a new pending one (idempotent re-reporting)
  const commission = Math.round((body.revenue * campaign.commission_rate) / 100);
  const { data: existingPay } = await admin
    .from("payments")
    .select("id, status")
    .eq("campaign_id", body.campaign_id)
    .eq("creator_id", body.creator_id)
    .eq("kind", "commission")
    .eq("note", body.period)
    .maybeSingle();

  if (existingPay && existingPay.status === "pending") {
    await admin
      .from("payments")
      .update({ amount: commission })
      .eq("id", existingPay.id);
  } else if (!existingPay) {
    const { error: payError } = await admin.from("payments").insert({
      campaign_id: body.campaign_id,
      creator_id: body.creator_id,
      amount: commission,
      kind: "commission",
      status: "pending",
      note: body.period,
    });
    if (payError) {
      return jsonError(500, "Commission payment failed", payError.message);
    }
  }

  void notify(body.creator_id, "commission_recorded", {
    campaign_title: campaign.title,
    period: body.period,
    amount: commission,
    link: `/marketplace/campaigns/${campaign.id}`,
  });

  return NextResponse.json({ result: sale });
}
