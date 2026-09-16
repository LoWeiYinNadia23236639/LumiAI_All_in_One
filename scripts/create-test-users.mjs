// 建立 brand 和 creator 測試帳號（已驗證 email，跳過驗證信）
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";

const env = Object.fromEntries(
  readFileSync(new URL("../.env.local", import.meta.url), "utf8")
    .split("\n")
    .map((l) => l.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/))
    .filter(Boolean)
    .map((m) => [m[1], m[2]])
);

const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const users = [
  {
    email: "brand.demo@lumiai.app",
    password: "DemoBrand#9xK2mQ",
    profile: { role: "brand", name: "Glow Beauty HK", niche: "Beauty", follower_count: 0 },
  },
  {
    email: "creator.demo@lumiai.app",
    password: "DemoCreator#7mP4wR",
    profile: { role: "creator", name: "Sara Cheung", niche: "Lifestyle", follower_count: 5200 },
  },
];

for (const u of users) {
  const { data: existing } = await supabase.auth.admin.listUsers();
  const found = existing?.users?.find((x) => x.email === u.email);
  let userId;
  if (found) {
    userId = found.id;
    const { error } = await supabase.auth.admin.updateUserById(userId, {
      password: u.password,
      email_confirm: true,
    });
    if (error) { console.error("update failed:", u.email, error.message); continue; }
    console.log("updated existing:", u.email);
  } else {
    const { data, error } = await supabase.auth.admin.createUser({
      email: u.email,
      password: u.password,
      email_confirm: true,
      user_metadata: { name: u.profile.name, role: u.profile.role },
    });
    if (error || !data.user) { console.error("create failed:", u.email, error?.message); continue; }
    userId = data.user.id;
    console.log("created:", u.email);
  }
  const { error: perr } = await supabase.from("profiles").upsert({
    id: userId,
    role: u.profile.role,
    name: u.profile.name,
    niche: u.profile.niche,
    follower_count: u.profile.follower_count,
    is_admin: false,
  });
  if (perr) { console.error("profile upsert failed:", u.email, perr.message); continue; }
  console.log("profile ok:", u.profile.name, "(" + u.profile.role + ")");
}
console.log("done");
