// Marketplace 2.0 四模式端到端驗收（對本地 dev server）
// 用法：npm run dev 後 `node scripts/test-marketplace.mjs`
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";

const env = Object.fromEntries(
  readFileSync(new URL("../.env.local", import.meta.url), "utf8")
    .split("\n")
    .map((l) => l.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/))
    .filter(Boolean)
    .map((m) => [m[1], m[2]])
);
const BASE = process.env.TEST_BASE ?? "http://localhost:3000";
const db = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

const signIn = async (email, password) => {
  const res = await fetch(`${env.SUPABASE_URL}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: { apikey: env.SUPABASE_ANON_KEY ?? env.NEXT_PUBLIC_SUPABASE_ANON_KEY, "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const j = await res.json();
  if (!res.ok) throw new Error("sign-in failed: " + JSON.stringify(j));
  return { token: j.access_token, userId: j.user.id };
};

const brand = await signIn("brand.demo@lumiai.app", "DemoBrand#9xK2mQ");
const creator = await signIn("creator.demo@lumiai.app", "DemoCreator#7mP4wR");
console.log("signed in both users");

let pass = 0, fail = 0;
const ok = (cond, name) => { if (cond) { pass++; console.log("  PASS", name); } else { fail++; console.log("  FAIL", name); } };

const call = async (user, path, body) => {
  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${user.token}` },
    body: JSON.stringify(body),
  });
  return { status: res.status, body: await res.json().catch(() => ({})) };
};
const q = (t, sel, eq) => db.from(t).select(sel).match(eq);

// 搵四條 demo campaign
const { data: camps } = await db.from("campaigns").select("id,campaign_type,title,brand_id,status").in("campaign_type", ["paid", "barter", "affiliate", "ambassador"]).eq("brand_id", brand.userId).order("created_at", { ascending: false }).limit(4);
const byType = {};
for (const c of camps) if (!byType[c.campaign_type]) byType[c.campaign_type] = c;
if (Object.keys(byType).length < 4) { console.error("demo campaigns missing — run the marketplace-all.sql seed first"); process.exit(1); }

// ---------- BARTER ----------
console.log("\n[BARTER] PR Box 流程");
{
  const apply = await call(creator, "/api/applications", { campaign_id: byType.barter.id, message: "想試用新品，會開箱分享！", shipping_address: "香港九龍塘xx街1號" });
  ok(apply.status === 200 || apply.status === 201, "creator 申請（含收貨地址）");
  const { data: app } = await db.from("applications").select("id").eq("campaign_id", byType.barter.id).eq("creator_id", creator.userId).single();
  const acc = await call(brand, "/api/applications/status", { application_id: app.id, action: "accepted" });
  ok(acc.status === 200, "brand accept");
  const { data: contract } = await db.from("contracts").select("id,status").eq("campaign_id", byType.barter.id).single();
  ok(!!contract, "accept 後自動建 contract draft");
  const ship = await call(brand, "/api/applications/shipping", { application_id: app.id, action: "ship", tracking_number: "SF123456789HK" });
  ok(ship.status === 200, "brand 標記寄出 + tracking");
  const recv = await call(creator, "/api/applications/shipping", { application_id: app.id, action: "receive" });
  ok(recv.status === 200, "creator 確認收貨");
}

// ---------- PAID（完整 workflow）----------
console.log("\n[PAID] 業配：申請→合約→交稿→審稿→付款→評價");
{
  const apply = await call(creator, "/api/applications", { campaign_id: byType.paid.id, message: "我有美容類經驗，適合呢個業配。" });
  ok(apply.status === 200 || apply.status === 201, "creator 申請");
  const { data: app } = await db.from("applications").select("id").eq("campaign_id", byType.paid.id).single();
  ok(await call(brand, "/api/applications/status", { application_id: app.id, action: "accepted" }).then(r => r.status === 200), "brand accept");

  // 未簽 contract 前唔准交稿
  const early = await call(creator, "/api/submissions", { campaign_id: byType.paid.id, post_url: "https://tiktok.com/x" });
  ok(early.status === 400, "未簽合約交稿被拒（400）");

  const bA = await call(brand, "/api/contracts/agree", { campaign_id: byType.paid.id });
  const cA = await call(creator, "/api/contracts/agree", { campaign_id: byType.paid.id });
  ok(bA.status === 200 && cA.status === 200, "雙方同意合約");
  const { data: ct } = await db.from("contracts").select("status").eq("campaign_id", byType.paid.id).single();
  ok(ct.status === "agreed", "contract status = agreed");

  ok(await call(creator, "/api/submissions", { campaign_id: byType.paid.id, post_url: "https://tiktok.com/v1", note: "第一稿" }).then(r => r.status === 200), "creator 交稿 #1");
  const { data: sub1 } = await db.from("submissions").select("id").eq("campaign_id", byType.paid.id).order("created_at").limit(1).single();
  ok(await call(brand, "/api/submissions/review", { submission_id: sub1.id, action: "revision", feedback: "USPs 講清楚啲" }).then(r => r.status === 200), "brand 要求修改（revision）");
  ok(await call(creator, "/api/submissions", { campaign_id: byType.paid.id, post_url: "https://tiktok.com/v2-final", note: "第二稿" }).then(r => r.status === 200), "creator 交稿 #2");
  const { data: sub2 } = await db.from("submissions").select("id,status").eq("campaign_id", byType.paid.id).order("created_at", { ascending: false }).limit(1).single();
  ok(await call(brand, "/api/submissions/review", { submission_id: sub2.id, action: "approved" }).then(r => r.status === 200), "brand 批准 #2");

  ok(await call(brand, "/api/campaigns/complete", { campaign_id: byType.paid.id }).then(r => r.status === 200), "brand 標記完成");
  const { data: pay } = await db.from("payments").select("id,amount,kind,status").eq("campaign_id", byType.paid.id).single();
  ok(pay && pay.kind === "campaign_fee" && Number(pay.amount) === 8000, `完成後自動建 payment（campaign_fee $${pay?.amount}）`);
  ok(await call(brand, "/api/payments/transition", { payment_id: pay.id, action: "mark_paid" }).then(r => r.status === 200), "brand 標記已付款");
  ok(await call(creator, "/api/payments/transition", { payment_id: pay.id, action: "confirm" }).then(r => r.status === 200), "creator 確認收款");
  const { data: pay2 } = await db.from("payments").select("status").eq("id", pay.id).single();
  ok(pay2.status === "confirmed", "payment status = confirmed");

  ok(await call(brand, "/api/reviews", { campaign_id: byType.paid.id, rating: 5, comment: "準時交稿，好專業！" }).then(r => r.status === 200), "brand 評 creator 5 星");
  ok(await call(creator, "/api/reviews", { campaign_id: byType.paid.id, rating: 4, comment: "溝通愉快" }).then(r => r.status === 200), "creator 評 brand 4 星");
  const { data: rv } = await db.from("reviews").select("rating").eq("campaign_id", byType.paid.id);
  ok(rv.length === 2, "兩條 review 都入咗 DB");
}

// ---------- AFFILIATE ----------
console.log("\n[AFFILIATE] 分潤：折扣碼 + 報數 + 佣金");
{
  ok(await call(creator, "/api/applications", { campaign_id: byType.affiliate.id, message: "想做團購導購！" }).then(r => r.status === 200 || r.status === 201), "creator 申請");
  const { data: app } = await db.from("applications").select("id").eq("campaign_id", byType.affiliate.id).single();
  ok(await call(brand, "/api/applications/status", { application_id: app.id, action: "accepted" }).then(r => r.status === 200), "brand accept");
  ok(await call(brand, "/api/affiliate-sales", { campaign_id: byType.affiliate.id, creator_id: creator.userId, period: "2026-10", units: 100, revenue: 20000 }).then(r => r.status === 200), "brand 報 2026-10 數（100件/$20,000）");
  const { data: comm } = await db.from("payments").select("amount,kind").eq("campaign_id", byType.affiliate.id).eq("kind", "commission").single();
  ok(comm && Number(comm.amount) === 3000, `佣金自動計算 = $${comm?.amount}（expect 3000 = 20000×15%）`);
  // 重複報數（idempotent）
  await call(brand, "/api/affiliate-sales", { campaign_id: byType.affiliate.id, creator_id: creator.userId, period: "2026-10", units: 120, revenue: 24000 });
  const { data: comm2 } = await db.from("payments").select("amount").eq("campaign_id", byType.affiliate.id).eq("kind", "commission").single();
  const { data: sales } = await db.from("affiliate_sales").select("units,revenue").eq("campaign_id", byType.affiliate.id);
  ok(sales.length === 1 && sales[0].units === 120 && Number(comm2.amount) === 3600, "重複報數更新唔會雙計（120件 → 佣金 $3600）");
}

// ---------- AMBASSADOR（經 Send Offer）----------
console.log("\n[AMBASSADOR] 品牌主動出 Offer → 代言合約");
{
  ok(await call(brand, "/api/offers", { creator_id: creator.userId, campaign_id: byType.ambassador.id, offered_price: 15000, message: "想做我哋 2027 品牌大使嗎？" }).then(r => r.status === 200), "brand Send Offer");
  const { data: offer } = await db.from("applications").select("id").eq("campaign_id", byType.ambassador.id).eq("offer", true).single();
  ok(await call(creator, "/api/offers/respond", { application_id: offer.id, action: "accepted" }).then(r => r.status === 200), "creator 接受 offer");
  ok(await call(brand, "/api/contracts/agree", { campaign_id: byType.ambassador.id }).then(r => r.status === 200), "brand 簽代言合約");
  ok(await call(creator, "/api/contracts/agree", { campaign_id: byType.ambassador.id }).then(r => r.status === 200), "creator 簽代言合約");
  ok(await call(brand, "/api/campaigns/complete", { campaign_id: byType.ambassador.id }).then(r => r.status === 200), "標記完成");
  const { data: rp } = await db.from("payments").select("amount,kind,note").eq("campaign_id", byType.ambassador.id).eq("kind", "retainer").single();
  ok(rp && Number(rp.amount) === 15000, `首月代言費 payment = $${rp?.amount}`);
}

// ---------- DM + 通知 ----------
console.log("\n[DM] 站內訊息");
{
  const ensure = await call(creator, "/api/conversations/ensure", { campaign_id: byType.paid.id });
  ok(ensure.status === 200 && ensure.body.conversation_id, "creator 開 conversation");
  const send = await call(brand, "/api/messages", { conversation_id: ensure.body.conversation_id, body: "你好，想傾下合作細節" });
  ok(send.status === 200, "brand 發訊息");
  const { data: msgs } = await db.from("messages").select("body,sender_id").eq("conversation_id", ensure.body.conversation_id);
  ok(msgs.length >= 1, "訊息入咗 DB");
  const { data: notifs } = await db.from("notifications").select("type").eq("user_id", creator.userId);
  const types = new Set(notifs.map(n => n.type));
  for (const t of ["application_accepted", "contract_agreed", "submission_revision", "payment_paid", "review_received", "message"]) {
    ok(types.has(t), `creator 收到通知: ${t}`);
  }
  ok(notifs.length >= 8, `creator 累計 ${notifs.length} 條通知`);
}

console.log(`\n========== RESULT: ${pass} passed, ${fail} failed ==========`);
process.exit(fail > 0 ? 1 : 0);
