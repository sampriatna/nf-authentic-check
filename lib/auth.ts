import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";
import bcrypt from "bcryptjs";

const cookieName = "nf_admin_session";
const adminIdCookie = "nf_admin_id";

function getSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
  return createClient(url, key);
}

export async function verifyAdminPassword(username: string, password: string) {
  try {
    const supabase = getSupabaseClient();
    
    const { data: admin, error } = await supabase
      .from("admin_users")
      .select("id, username, password_hash, is_active")
      .eq("username", username)
      .single();

    if (error || !admin) return null;
    if (!admin.is_active) return null;

    const passwordMatch = await bcrypt.compare(password, admin.password_hash);
    if (!passwordMatch) return null;

    // Update last_login
    await supabase
      .from("admin_users")
      .update({ last_login: new Date().toISOString() })
      .eq("id", admin.id);

    return admin;
  } catch (err) {
    console.error("[auth] Error verifying password:", err);
    return null;
  }
}

export function isAdminLoggedIn() {
  return cookies().get(cookieName)?.value === "active";
}

export function getAdminId() {
  return cookies().get(adminIdCookie)?.value;
}

export function loginAdmin(adminId: string) {
  cookies().set(cookieName, "active", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 8
  });

  cookies().set(adminIdCookie, adminId, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 8
  });
}

export function logoutAdmin() {
  cookies().delete(cookieName);
  cookies().delete(adminIdCookie);
}
