#!/usr/bin/env node

/**
 * Script untuk membuat admin user pertama kali
 * Jalankan dengan: node scripts/setup-admin.js
 */

const { createClient } = require("@supabase/supabase-js");
const bcrypt = require("bcryptjs");
const readline = require("readline");

const SALT_ROUNDS = 10;

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise((resolve) => rl.question(query, resolve));
}

function getSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
  return createClient(url, key);
}

async function createAdminUser(username, password, email) {
  try {
    const supabase = getSupabaseClient();
    
    // Hash password
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    
    const { data, error } = await supabase
      .from("admin_users")
      .insert([
        {
          username,
          password_hash: passwordHash,
          email: email || null,
          is_active: true
        }
      ])
      .select();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

async function main() {
  console.log("\n=== Setup Admin User Pertama Kali ===\n");

  const username = await question("Username admin: ");
  const password = await question("Password (minimal 8 karakter): ");
  const email = await question("Email (opsional, tekan Enter untuk skip): ");

  if (!username.trim()) {
    console.error("❌ Username tidak boleh kosong!");
    rl.close();
    process.exit(1);
  }

  if (password.length < 8) {
    console.error("❌ Password minimal 8 karakter!");
    rl.close();
    process.exit(1);
  }

  console.log("\n⏳ Membuat admin user...");

  const result = await createAdminUser(username, password, email || undefined);

  if (result.success) {
    console.log("\n✅ Admin user berhasil dibuat!");
    console.log("   Username:", username);
    console.log("   Email:", email || "-");
    console.log("\n📍 Sekarang Anda bisa login di:");
    console.log("   https://cek.nusafishing.com/admin/login");
  } else {
    console.error("\n❌ Error membuat admin user:", result.error);
    process.exit(1);
  }

  rl.close();
}

main().catch(console.error);
