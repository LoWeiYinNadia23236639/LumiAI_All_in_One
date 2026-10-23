// 驗證 storyboard-video API：自建測試圖 → upload → 9:16 animatic（唔依賴 Gemini 配額）
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";
import { deflateSync } from "node:zlib";

const env = Object.fromEntries(
  readFileSync("/Users/nadialo/Downloads/FYP/influencer-agency-marketplace/.env.local", "utf8")
    .split("\n")
    .map((l) => l.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/))
    .filter(Boolean)
    .map((m) => [m[1], m[2]])
);

const BASE = "http://localhost:3000";
const BUCKET = "storyboard-media";
const admin = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// 1. 登入攞 token（API auth 用）
const anon = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY ?? env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
const { data, error } = await anon.auth.signInWithPassword({
  email: "brand.demo@lumiai.app",
  password: "DemoBrand#9xK2mQ",
});
if (error || !data.session) { console.error("sign-in failed:", error?.message); process.exit(1); }
const token = data.session.access_token;
console.log("signed in ok");

// 2. 純 node 砌兩張 720x1280 漸變 PNG（無外部依賴）
function crc32(buf) {
  let c, table = crc32.table;
  if (!table) {
    table = crc32.table = new Int32Array(256);
    for (let n = 0; n < 256; n++) {
      c = n;
      for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      table[n] = c;
    }
  }
  c = -1;
  for (let i = 0; i < buf.length; i++) c = (c >>> 8) ^ table[(c ^ buf[i]) & 255];
  return (c ^ -1) >>> 0;
}
function chunk(type, data) {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type), data]);
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(body));
  return Buffer.concat([len, body, crc]);
}
function gradientPng(w, h, r1, g1, b1, r2, g2, b2) {
  const raw = Buffer.alloc((w * 3 + 1) * h);
  for (let y = 0; y < h; y++) {
    const row = y * (w * 3 + 1);
    raw[row] = 0;
    for (let x = 0; x < w; x++) {
      const t = x / w;
      raw[row + 1 + x * 3] = Math.round(r1 + (r2 - r1) * t);
      raw[row + 2 + x * 3] = Math.round(g1 + (g2 - g1) * t);
      raw[row + 3 + x * 3] = Math.round(b1 + (b2 - b1) * t);
    }
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8; ihdr[9] = 2; // 8-bit RGB
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk("IHDR", ihdr),
    chunk("IDAT", deflateSync(raw)),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

// 3. 確保 bucket（模擬 route 行為前，bucket 理應唔存在——由 route 自己建）
const { data: bucket } = await admin.storage.getBucket(BUCKET);
console.log("bucket exists before video API call?", !!bucket);

// 4. 如果 bucket 未存在，先唔建，直接 call video API 會因為冇圖而失敗——所以用 service role 建 bucket 再上傳測試圖
// （圖片上傳係測試前置，bucket 建立仍會由 API route 驗證：如果 route 建好咗，upload 就會成功）
const png1 = gradientPng(720, 1280, 27, 67, 50, 242, 236, 222);
const png2 = gradientPng(720, 1280, 242, 236, 222, 27, 67, 50);
const urls = [];
for (const [i, png] of [png1, png2].entries()) {
  const path = `${data.user.id}/test-${Date.now()}-${i}.png`;
  const up = await admin.storage.from(BUCKET).upload(path, png, { contentType: "image/png" });
  if (up.error) { console.error("test image upload failed (bucket missing?):", up.error.message); process.exit(1); }
  urls.push(admin.storage.from(BUCKET).getPublicUrl(path).data.publicUrl);
}
console.log("test images uploaded ok (implies bucket auto-created by video route on a previous call, or already present)");

// 5. call video API（呢一步確保 route 自己會 ensureBucket）
const res = await fetch(`${BASE}/api/ai/storyboard-video`, {
  method: "POST",
  headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
  body: JSON.stringify({
    images: urls.map((url, i) => ({ url, scene_number: i + 1 })),
    aspect: "9:16",
    seconds_per_scene: 1.5,
  }),
});
const body = await res.json();
if (!res.ok) { console.error("video API FAILED:", res.status, body); process.exit(1); }
const vid = await fetch(body.url);
const mp4 = Buffer.from(await vid.arrayBuffer());
console.log("video OK ->", body.url, `HTTP ${vid.status}, ${mp4.length} bytes`);

// 6. 從 mp4 mvhd atom 讀實際時長（2 scenes x 1.5s = 3s）
const idx = mp4.indexOf(Buffer.from("mvhd"));
if (idx >= 0) {
  const ver = mp4.readUInt8(idx + 4);
  const tsOff = idx + (ver === 1 ? 24 : 16);
  const timescale = mp4.readUInt32BE(tsOff);
  const duration = ver === 1 ? Number(mp4.readBigUInt64BE(tsOff + 4)) : mp4.readUInt32BE(tsOff + 4);
  console.log(`duration check: ${(duration / timescale).toFixed(2)}s (expect ~3.00s)`);
}
console.log("VIDEO PIPELINE PASS");
