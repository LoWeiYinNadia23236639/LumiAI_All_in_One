// Creates (or updates) the hidden admin account defined by ADMIN_EMAIL / ADMIN_PASSWORD
// in .env.local, and marks its profiles row as is_admin = true.
//
// Usage: node scripts/create-admin.mjs
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";

function loadEnvLocal() {
  const lines = readFileSync(new URL("../.env.local", import.meta.url), "utf8").split("\n");
  const env = {};
  for (const line of lines) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m) env[m[1]] = m[2];
  }
  return env;
}

const env = loadEnvLocal();
const url = env.SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY;
const email = env.ADMIN_EMAIL;
const password = env.ADMIN_PASSWORD;

if (!url || !serviceRoleKey || !email || !password) {
  console.error("Missing SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY / ADMIN_EMAIL / ADMIN_PASSWORD in .env.local");
  process.exit(1);
}

const supabase = createClient(url, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// 1. Find existing user or create a new one
let userId = null;
const { data: listData } = await supabase.auth.admin.listUsers();
const existing = listData?.users?.find((u) => u.email?.toLowerCase() === email.toLowerCase());
if (existing) {
  userId = existing.id;
  const { error } = await supabase.auth.admin.updateUserById(userId, {
    password,
    email_confirm: true,
  });
  if (error) {
    console.error("Failed to update existing user password:", error.message);
    process.exit(1);
  }
  console.log("Existing user found — password updated and email confirmed.");
} else {
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { name: "Admin", role: "creator" },
  });
  if (error || !data.user) {
    console.error("Failed to create user:", error?.message ?? "unknown error");
    process.exit(1);
  }
  userId = data.user.id;
  console.log("Admin user created.");
}

// 2. Ensure the profiles row exists and is flagged as admin
const { error: upsertError } = await supabase.from("profiles").upsert({
  id: userId,
  role: "creator",
  name: "Admin",
  is_admin: true,
});

if (upsertError) {
  console.error("Failed to upsert profiles row:", upsertError.message);
  console.error("Did you run scripts/supabase-schema.sql in the Supabase SQL Editor yet?");
  process.exit(1);
}

console.log("profiles row upserted with is_admin = true.");
console.log("Done. Sign in at /login with ADMIN_EMAIL and ADMIN_PASSWORD from .env.local.");
