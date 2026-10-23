// 端到端驗證 Gemini omni AI 動態影片：1 個新 clip（經 API route）+ 1 個重用 clip → xfade 合成
// 費用：約 US$1（omni 10s 片段）。用法：npm run dev 後 `node scripts/test-scene-video.mjs`
import { createClient } from "@supabase/supabase-js";
import { readFileSync, existsSync } from "node:fs";

const env = Object.fromEntries(
  readFileSync(new URL("../.env.local", import.meta.url), "utf8")
    .split("\n")
    .map((l) => l.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/))
    .filter(Boolean)
    .map((m) => [m[1], m[2]])
);

const BASE = process.env.TEST_BASE ?? "http://localhost:3000";
const supabase = createClient(
  env.SUPABASE_URL ?? env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_ANON_KEY ?? env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);
const admin = createClient(
  env.SUPABASE_URL ?? env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY
);

const { data, error } = await supabase.auth.signInWithPassword({
  email: "brand.demo@lumiai.app",
  password: "DemoBrand#9xK2mQ",
});
if (error || !data.session) {
  console.error("sign-in failed:", error?.message);
  process.exit(1);
}
const token = data.session.access_token;
console.log("signed in ok");

const post = async (api, payload) => {
  const res = await fetch(`${BASE}${api}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  });
  const body = await res.json();
  if (!res.ok) throw new Error(`${api} FAILED ${res.status}: ${JSON.stringify(body)}`);
  return body;
};

// Clip 1：經 API route 生成（16:9 source image）
console.log("[clip 1] generating via /api/ai/scene-video (omni, ~30-60s)...");
const t0 = Date.now();
const clip1 = await post("/api/ai/scene-video", {
  scene_number: 1,
  description: "A person unboxing a skincare gift set at a wooden table, soft window light",
  shot_angle: "Medium shot, slow push-in",
  mood: "cozy morning",
  image_url:
    "https://jedjkfajpwyyuimwbbqv.supabase.co/storage/v1/object/public/storyboard-media/8f4889d6-6500-4a56-9ac2-791bdc85c66b/1792762720371-s1.png",
});
console.log(`[clip 1] OK in ${((Date.now() - t0) / 1000).toFixed(0)}s ->`, clip1.url);

// Clip 2：重用之前直接測試生成、儲喺 /tmp/omni-i2v.mp4 嘅 omni 片段（慳 US$1）
if (!existsSync("/tmp/omni-i2v.mp4")) {
  console.error("/tmp/omni-i2v.mp4 missing — run the direct omni test first");
  process.exit(1);
}
const up = await admin.storage
  .from("storyboard-media")
  .upload(`${data.user.id}/reuse-${Date.now()}.mp4`, readFileSync("/tmp/omni-i2v.mp4"), {
    contentType: "video/mp4",
  });
if (up.error) { console.error("reuse upload failed:", up.error.message); process.exit(1); }
const clip2 = admin.storage.from("storyboard-media").getPublicUrl(up.data.path).data.publicUrl;
console.log("[clip 2] reused earlier omni clip ->", clip2);

// 合成：9:16 輸出 + 隨機轉場（呢步會將 16:9 clip 裁成 9:16）
console.log("assembling with xfade transitions (9:16 output)...");
const vbody = await post("/api/ai/storyboard-video", {
  mode: "clips",
  clips: [clip1.url, clip2],
  aspect: "9:16",
  transitions: true,
});
const vid = await fetch(vbody.url);
const mp4 = Buffer.from(await vid.arrayBuffer());
console.log("video OK ->", vbody.url, `HTTP ${vid.status}, ${mp4.length} bytes`);

const idx = mp4.indexOf(Buffer.from("mvhd"));
if (idx >= 0) {
  const ver = mp4.readUInt8(idx + 4);
  const tsOff = idx + (ver === 1 ? 24 : 16);
  const timescale = mp4.readUInt32BE(tsOff);
  const duration = ver === 1 ? Number(mp4.readBigUInt64BE(tsOff + 4)) : mp4.readUInt32BE(tsOff + 4);
  console.log(`duration check: ${(duration / timescale).toFixed(2)}s (expect ~19.5s for 2x10s clips, 0.5s xfade)`);
}
console.log("AI VIDEO PIPELINE PASS");
