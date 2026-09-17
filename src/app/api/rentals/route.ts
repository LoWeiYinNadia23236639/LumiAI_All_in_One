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

function todayStr(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function escapeHtml(s: string): string {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

async function sendOwnerNotification(params: {
  ownerEmail: string;
  renterName: string;
  gearTitle: string;
  gearUrl: string;
  startDate: string;
  endDate: string;
  message: string | null;
}) {
  if (!RESEND_API_KEY) {
    console.log(
      `[rentals] RESEND_API_KEY not set — skipping email to ${params.ownerEmail}`
    );
    return;
  }
  const resend = new Resend(RESEND_API_KEY);
  // resend.emails.send resolves even on API errors — the error is in the result.
  try {
    const { error: resendError } = await resend.emails.send({
      from: EMAIL_FROM,
      to: params.ownerEmail,
      subject: `New rental request for "${params.gearTitle}"`,
      html: `
        <div style="font-family: sans-serif; max-width: 560px; margin: 0 auto;">
          <h2 style="color: #171717;">New rental request</h2>
          <p><strong>${escapeHtml(params.renterName)}</strong> wants to rent
            <strong>${escapeHtml(params.gearTitle)}</strong>.</p>
          <table style="border-collapse: collapse; margin: 16px 0;">
            <tr><td style="padding: 4px 12px 4px 0; color: #666;">Renter</td>
                <td>${escapeHtml(params.renterName)}</td></tr>
            <tr><td style="padding: 4px 12px 4px 0; color: #666;">Start date</td>
                <td>${escapeHtml(params.startDate)}</td></tr>
            <tr><td style="padding: 4px 12px 4px 0; color: #666;">End date</td>
                <td>${escapeHtml(params.endDate)}</td></tr>
          </table>
          ${
            params.message
              ? `<h3 style="color: #171717; font-size: 14px;">Message</h3>
                 <p style="white-space: pre-line; background: #f5f5f5; padding: 12px; border-radius: 8px;">${escapeHtml(params.message)}</p>`
              : ""
          }
          <p>
            <a href="${escapeHtml(params.gearUrl)}"
               style="display: inline-block; background: linear-gradient(90deg, #f97316, #f59e0b);
                      color: #fff; padding: 10px 20px; border-radius: 8px; text-decoration: none;">
              View request
            </a>
          </p>
        </div>
      `,
    });
    if (resendError) {
      console.error("[rentals] Resend error:", resendError);
    } else {
      console.log(`[rentals] notification email sent to ${params.ownerEmail}`);
    }
  } catch (err) {
    // Email failure must never break the rental flow.
    console.error("[rentals] Resend error:", err);
  }
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

  let body: {
    gear_id?: string;
    start_date?: string;
    end_date?: string;
    message?: string;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
  if (!body.gear_id || !body.start_date || !body.end_date) {
    return NextResponse.json(
      { error: "gear_id, start_date and end_date are required" },
      { status: 400 }
    );
  }

  // Basic date validation — the client shows localized messages for these.
  const dateRe = /^\d{4}-\d{2}-\d{2}$/;
  if (
    !dateRe.test(body.start_date) ||
    !dateRe.test(body.end_date) ||
    body.end_date < body.start_date ||
    body.start_date < todayStr()
  ) {
    return NextResponse.json({ error: "Invalid dates" }, { status: 400 });
  }

  // Client scoped to this user so the insert passes RLS (renter_id = auth.uid()).
  const userClient: SupabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
    global: { headers: { Authorization: `Bearer ${token}` } },
  });

  // Resolve the gear first — we need its owner_id and title, and it must exist.
  const { data: gear, error: gearError } = await userClient
    .from("gears")
    .select("id, owner_id, title")
    .eq("id", body.gear_id)
    .single();
  if (gearError || !gear) {
    return NextResponse.json({ error: "Gear not found" }, { status: 404 });
  }

  const { data, error } = await userClient
    .from("rental_requests")
    .insert({
      gear_id: body.gear_id,
      renter_id: userData.user.id,
      owner_id: gear.owner_id,
      start_date: body.start_date,
      end_date: body.end_date,
      message: body.message?.trim() || null,
      status: "pending",
    })
    .select("id, status")
    .single();

  if (error) {
    return NextResponse.json(
      { error: "Insert failed", detail: error.message },
      { status: 500 }
    );
  }

  // --- Notify the owner by email (best-effort; never blocks the response) ---
  try {
    if (SUPABASE_SERVICE_ROLE_KEY) {
      // profiles has no email column — look it up in auth.users via the admin API.
      const adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
        auth: { autoRefreshToken: false, persistSession: false },
      });
      const [{ data: ownerUser }, { data: renterProfile }] = await Promise.all([
        adminClient.auth.admin.getUserById(gear.owner_id),
        userClient
          .from("profiles")
          .select("name")
          .eq("id", userData.user.id)
          .single(),
      ]);
      const ownerEmail = ownerUser.user?.email;
      if (ownerEmail) {
        const origin = req.nextUrl.origin;
        await sendOwnerNotification({
          ownerEmail,
          renterName:
            renterProfile?.name ?? userData.user.email ?? "A creator",
          gearTitle: gear.title,
          gearUrl: `${origin}/en/equipment/${body.gear_id}`,
          startDate: body.start_date,
          endDate: body.end_date,
          message: body.message?.trim() || null,
        });
      }
    }
  } catch (err) {
    console.error("[rentals] notification step failed:", err);
  }

  return NextResponse.json({ result: data });
}
