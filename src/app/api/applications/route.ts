import { NextRequest, NextResponse } from "next/server";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { Resend } from "resend";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const RESEND_API_KEY = process.env.RESEND_API_KEY;

// Test-mode sender: unverified Resend accounts can only send from
// onboarding@resend.dev, and only to the email of the Resend account owner.
const EMAIL_FROM = "LumiAI Marketplace <onboarding@resend.dev>";

async function sendBrandNotification(params: {
  brandEmail: string;
  campaignTitle: string;
  campaignUrl: string;
  creatorName: string;
  creatorNiche: string | null;
  creatorFollowers: number | null;
  pitch: string | null;
}) {
  if (!RESEND_API_KEY) {
    console.log(
      `[applications] RESEND_API_KEY not set — skipping email to ${params.brandEmail}`
    );
    return;
  }
  const resend = new Resend(RESEND_API_KEY);
  const followers =
    params.creatorFollowers != null
      ? params.creatorFollowers.toLocaleString()
      : "—";
  // resend.emails.send resolves even on API errors — the error is in the result.
  try {
    const { error: resendError } = await resend.emails.send({
      from: EMAIL_FROM,
      to: params.brandEmail,
      subject: `New application for "${params.campaignTitle}"`,
      html: `
        <div style="font-family: sans-serif; max-width: 560px; margin: 0 auto;">
          <h2 style="color: #171717;">New campaign application</h2>
          <p><strong>${escapeHtml(params.creatorName)}</strong> applied to
            <strong>${escapeHtml(params.campaignTitle)}</strong>.</p>
          <table style="border-collapse: collapse; margin: 16px 0;">
            <tr><td style="padding: 4px 12px 4px 0; color: #666;">Creator</td>
                <td>${escapeHtml(params.creatorName)}</td></tr>
            <tr><td style="padding: 4px 12px 4px 0; color: #666;">Niche</td>
                <td>${escapeHtml(params.creatorNiche ?? "—")}</td></tr>
            <tr><td style="padding: 4px 12px 4px 0; color: #666;">Followers</td>
                <td>${followers}</td></tr>
          </table>
          ${
            params.pitch
              ? `<h3 style="color: #171717; font-size: 14px;">Pitch</h3>
                 <p style="white-space: pre-line; background: #f5f5f5; padding: 12px; border-radius: 8px;">${escapeHtml(params.pitch)}</p>`
              : ""
          }
          <p>
            <a href="${escapeHtml(params.campaignUrl)}"
               style="display: inline-block; background: linear-gradient(90deg, #ec4899, #8b5cf6);
                      color: #fff; padding: 10px 20px; border-radius: 8px; text-decoration: none;">
              View application
            </a>
          </p>
        </div>
      `,
    });
    if (resendError) {
      console.error("[applications] Resend error:", resendError);
    } else {
      console.log(`[applications] notification email sent to ${params.brandEmail}`);
    }
  } catch (err) {
    // Email failure must never break the application flow.
    console.error("[applications] Resend error:", err);
  }
}
function escapeHtml(s: string): string {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

export async function POST(req: NextRequest) {
  // --- Auth: caller must supply their Supabase access token (client-side session) ---
  const authHeader = req.headers.get("authorization") ?? "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const authClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { data: userData, error: userError } = await authClient.auth.getUser(token);
  if (userError || !userData.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { campaign_id?: string; message?: string; shipping_address?: string | null };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
  if (!body.campaign_id) {
    return NextResponse.json({ error: "campaign_id is required" }, { status: 400 });
  }

  // Client scoped to this user so the insert passes RLS (creator_id = auth.uid()).
  const userClient: SupabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
    global: { headers: { Authorization: `Bearer ${token}` } },
  });

  const { data, error } = await userClient
    .from("applications")
    .insert({
      campaign_id: body.campaign_id,
      creator_id: userData.user.id,
      status: "pending",
      message: body.message?.trim() || null,
      shipping_address: body.shipping_address?.trim() || null,
    })
    .select("id, status")
    .single();

  if (error) {
    // unique(campaign_id, creator_id) — duplicate application
    if (error.code === "23505") {
      return NextResponse.json(
        { error: "duplicate", detail: error.message },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: "Insert failed", detail: error.message },
      { status: 500 }
    );
  }

  // --- Notify the brand by email (best-effort; never blocks the response) ---
  try {
    const [campaignRes, profileRes] = await Promise.all([
      userClient
        .from("campaigns")
        .select("title, brand_id")
        .eq("id", body.campaign_id)
        .single(),
      userClient
        .from("profiles")
        .select("name, niche, follower_count")
        .eq("id", userData.user.id)
        .single(),
    ]);

    const brandId = campaignRes.data?.brand_id;
    if (campaignRes.data && brandId && SUPABASE_SERVICE_ROLE_KEY) {
      // profiles has no email column — look it up in auth.users via the admin API.
      const adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
        auth: { autoRefreshToken: false, persistSession: false },
      });
      const { data: brandUser } = await adminClient.auth.admin.getUserById(brandId);
      const brandEmail = brandUser.user?.email;
      if (brandEmail) {
        const origin = req.nextUrl.origin;
        await sendBrandNotification({
          brandEmail,
          campaignTitle: campaignRes.data.title,
          campaignUrl: `${origin}/en/marketplace/campaigns/${body.campaign_id}`,
          creatorName: profileRes.data?.name ?? userData.user.email ?? "A creator",
          creatorNiche: profileRes.data?.niche ?? null,
          creatorFollowers: profileRes.data?.follower_count ?? null,
          pitch: body.message?.trim() || null,
        });
      }
    }
  } catch (err) {
    console.error("[applications] notification step failed:", err);
  }

  return NextResponse.json({ result: data });
}
