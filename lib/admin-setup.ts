import { createClient } from "@supabase/supabase-js";
import bcrypt from "bcryptjs";

const SALT_ROUNDS = 10;

function getSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
  return createClient(url, key);
}

export async function createAdminUser(username: string, password: string, email?: string) {
  try {
    const supabase = getSupabaseClient();
    
    // Hash password
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    
    const { data, error } = await supabase
      .from("admin_users")
      .insert({
        username,
        password_hash: passwordHash,
        email,
        is_active: true
      })
      .select()
      .single();

    if (error) {
      console.error("[admin-setup] Error creating admin user:", error.message);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (err) {
    console.error("[admin-setup] Error:", err);
    return { success: false, error: String(err) };
  }
}

export async function getAdminUsers() {
  try {
    const supabase = getSupabaseClient();
    
    const { data, error } = await supabase
      .from("admin_users")
      .select("id, username, email, is_active, last_login, created_at")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return { success: true, data };
  } catch (err) {
    console.error("[admin-setup] Error fetching admins:", err);
    return { success: false, error: String(err) };
  }
}

export async function deleteAdminUser(id: string) {
  try {
    const supabase = getSupabaseClient();
    
    const { error } = await supabase
      .from("admin_users")
      .delete()
      .eq("id", id);

    if (error) throw error;
    return { success: true };
  } catch (err) {
    console.error("[admin-setup] Error deleting admin:", err);
    return { success: false, error: String(err) };
  }
}

export async function updateAdminPassword(id: string, newPassword: string) {
  try {
    const supabase = getSupabaseClient();
    
    const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
    
    const { error } = await supabase
      .from("admin_users")
      .update({ password_hash: passwordHash })
      .eq("id", id);

    if (error) throw error;
    return { success: true };
  } catch (err) {
    console.error("[admin-setup] Error updating password:", err);
    return { success: false, error: String(err) };
  }
}
