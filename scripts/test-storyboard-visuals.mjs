// 端到端驗證 storyboard 圖片（四種 format）同影片生成（對本地 dev server）
// 用法：npm run dev 後執行 `node scripts/test-storyboard-visuals.mjs`
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
const supabase = createClient(
  env.SUPABASE_URL ?? env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_ANON_KEY ?? env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const { data, error } = await supabase.auth.signInWithPassword({
  email: "brand.demo@lumiai.app",
  password: "DemoBrand#9xK2mQ",
});
if (error || !data.session) {
  console.error("sign-in failed:", error?.message ?? "no session");
  process.exit(1);
}
const token = data.session.access_token;
console.log("signed in ok");

const scene = {
  description: "A person unboxing a skincare gift set at a wooden table",
  shot_angle: "Medium shot, eye level",
  lighting: "Soft natural window light, warm tones",
  mood: "cozy morning",
};

const urls = {};
let n = 0;
for (const aspect of ["16:9", "9:16", "3:4", "4:3"]) {
  n += 1;
  const res = await fetch(`${BASE}/api/ai/scene-image`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ ...scene, scene_number: n, aspect }),
  });
  const body = await res.json();
  if (!res.ok) {
    console.error(`scene-image ${aspect} FAILED:`, res.status, body);
    process.exit(1);
  }
  const check = await fetch(body.url);
  const img = Buffer.from(await check.arrayBuffer());
  // PNG IHDR: bytes 16-23 = width/height (big-endian)
  const w = img.readUInt32BE(16);
  const h = img.readUInt32BE(20);
  console.log(`scene-image ${aspect} OK ->`, body.url, `(HTTP ${check.status}, ${w}x${h})`);
  urls[aspect] = body.url;
}

const vres = await fetch(`${BASE}/api/ai/storyboard-video`, {
  method: "POST",
  headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
  body: JSON.stringify({
    images: [urls["9:16"], urls["3:4"], urls["4:3"]].map((url, i) => ({ url, scene_number: i + 1 })),
    aspect: "9:16",
    seconds_per_scene: 1.5,
  }),
});
const vbody = await vres.json();
if (!vres.ok) {
  console.error("storyboard-video FAILED:", vres.status, vbody);
  process.exit(1);
}
const vcheck = await fetch(vbody.url);
console.log("storyboard-video OK ->", vbody.url, `(HTTP ${vcheck.status}, ${vcheck.headers.get("content-type")})`);
console.log("ALL PASS");
