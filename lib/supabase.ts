import { createClient } from "@supabase/supabase-js";

export function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  // Try SUPABASE_SERVICE_ROLE_KEY first, then fall back to SUPABASE_JWT_SECRET
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_JWT_SECRET;

  console.log("[v0] DEBUG Supabase config:", {
    url_exists: !!url,
    key_exists: !!serviceRoleKey,
    url_value: url ? url.substring(0, 20) + "..." : "undefined",
    key_value: serviceRoleKey ? serviceRoleKey.substring(0, 10) + "..." : "undefined"
  });

  if (!url || !serviceRoleKey) {
    throw new Error("Supabase belum dikonfigurasi. Isi NEXT_PUBLIC_SUPABASE_URL dan SUPABASE_SERVICE_ROLE_KEY atau SUPABASE_JWT_SECRET.");
  }

  return createClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}

export function getAdminPassword() {
  return process.env.ADMIN_PASSWORD || "tukgumer123";
}
