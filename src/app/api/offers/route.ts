import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import {
  authenticateRequest,
  getProfile,
  isBrandProfile,
  jsonError,
} from "@/lib/server/auth";
import { notify } from "@/lib/notifications/server";

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const EMAIL_FROM = "LumiAI Marketplace <onboarding@resend.dev>";

function escapeHtml(s: string): string {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

async function sendOfferEmail(params: {
  creatorEmail: string;
  brandName: string;
  campaignTitle: string;
  campaignUrl: string;
  offeredPrice: number | null;
  message: string | null;
}) {
  if (!RESEND_API_KEY) {
    console.log(`[offers] RESEND_API_KEY not set — skipping email to ${params.creatorEmail}`);
    return;
  }
  const resend = new Resend(RESEND_API_KEY);
  try {
    const { error: resendError } = await resend.emails.send({
      from: EMAIL_FROM,
      to: params.creatorEmail,
      subject: `Collaboration offer from ${params.brandName}`,
      html: `
        <div style="font-family: sans-serif; max-width: 560px; margin: 0 auto;">
          <h2 style="color: #171717;">You received a collaboration offer</h2>
          <p><strong>${escapeHtml(params.brandName)}</strong> invited you to collaborate on
            <strong>${escapeHtml(params.campaignTitle)}</strong>.</p>
          <table style="border-collapse: collapse; margin: 16px 0;">
            ${
              params.offeredPrice != null
                ? `<tr><td style="padding: 4px 12px 4px 0; color: #666;">Offered price</td>
                   <td>$${params.offeredPrice.toLocaleString()}</td></tr>`
                : ""
            }
          </table>
          ${
            params.message
              ? `<h3 style="color: #171717; font-size: 14px;">Message</h3>
                 <p style="white-space: pre-line; background: #f5f5f5; padding: 12px; border-radius: 8px;">${escapeHtml(params.message)}</p>`
              : ""
          }
          <p>
            <a href="${escapeHtml(params.campaignUrl)}"
               style="display: inline-block; background: linear-gradient(90deg, #ec4899, #8b5cf6);
                      color: #fff; padding: 10px 20px; border-radius: 8px; text-decoration: none;">
              View offer
            </a>
          </p>
        </div>
      `,
    });
    if (resendError) {
      console.error("[offers] Resend error:", resendError);
    }
  } catch (err) {
    console.error("[offers] Resend error:", err);
  }
}

export async function POST(req: NextRequest) {
  const auth = await authenticateRequest(req);
  if (auth instanceof NextResponse) return auth;
  const { userId, admin } = auth;

  const profile = await getProfile(admin, userId);
  if (!profile || !isBrandProfile(profile)) {
    return jsonError(403, "Only brands can send offers");
  }

  let body: {
    creator_id?: string;
    campaign_id?: string;
    offered_price?: number | null;
    message?: string;
  };
  try {
    body = await req.json();
  } catch {
    return jsonError(400, "Invalid request body");
  }
  if (!body.creator_id || !body.campaign_id) {
    return jsonError(400, "creator_id and campaign_id are required");
  }
  if (
    body.offered_price != null &&
    (typeof body.offered_price !== "number" || body.offered_price < 0)
  ) {
    return jsonError(400, "offered_price must be a non-negative number");
  }

  const { data: campaign } = await admin
    .from("campaigns")
    .select("id, title, brand_id, status")
    .eq("id", body.campaign_id)
    .single();
  if (!campaign) {
    return jsonError(404, "Campaign not found");
  }
  if (campaign.brand_id !== userId) {
    return jsonError(403, "You do not own this campaign");
  }
  if (campaign.status !== "active") {
    return jsonError(400, "Campaign is not active");
  }

  const { data: creator } = await admin
    .from("profiles")
    .select("id, role")
    .eq("id", body.creator_id)
    .single();
  if (!creator || creator.role !== "creator") {
    return jsonError(404, "Creator not found");
  }

  // One application row per (campaign, creator) — block duplicate offers/applications
  const { data: existing } = await admin
    .from("applications")
    .select("id")
    .eq("campaign_id", body.campaign_id)
    .eq("creator_id", body.creator_id)
    .maybeSingle();
  if (existing) {
    return jsonError(409, "This creator already has an application for this campaign");
  }

  const { data: inserted, error } = await admin
    .from("applications")
    .insert({
      campaign_id: body.campaign_id,
      creator_id: body.creator_id,
      status: "pending",
      offer: true,
      offered_price: body.offered_price ?? null,
      message: body.message?.trim() || null,
    })
    .select("id, status")
    .single();
  if (error || !inserted) {
    return jsonError(500, "Insert failed", error?.message);
  }

  void notify(body.creator_id, "offer_received", {
    campaign_title: campaign.title,
    brand_name: profile.name,
    offered_price: body.offered_price ?? null,
    link: `/marketplace/campaigns/${campaign.id}`,
  });

  try {
    const { data: creatorUser } = await admin.auth.admin.getUserById(body.creator_id);
    const creatorEmail = creatorUser.user?.email;
    if (creatorEmail) {
      await sendOfferEmail({
        creatorEmail,
        brandName: profile.name,
        campaignTitle: campaign.title,
        campaignUrl: `${req.nextUrl.origin}/en/marketplace/campaigns/${campaign.id}`,
        offeredPrice: body.offered_price ?? null,
        message: body.message?.trim() || null,
      });
    }
  } catch (err) {
    console.error("[offers] email step failed:", err);
  }

  return NextResponse.json({ result: inserted });
}
