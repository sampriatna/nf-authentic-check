#!/usr/bin/env node

/**
 * Script untuk membuat admin user pertama kali
 * Jalankan dengan: npm run setup-admin
 */

import { createAdminUser } from "../lib/admin-setup";
import readline from "readline";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query: string): Promise<string> {
  return new Promise((resolve) => rl.question(query, resolve));
}

async function main() {
  console.log("\n=== Setup Admin User Pertama Kali ===\n");

  const username = await question("Username admin: ");
  const password = await question("Password (minimal 8 karakter): ");
  const email = await question("Email (opsional, tekan Enter untuk skip): ");

  if (!username.trim()) {
    console.error("Username tidak boleh kosong!");
    rl.close();
    process.exit(1);
  }

  if (password.length < 8) {
    console.error("Password minimal 8 karakter!");
    rl.close();
    process.exit(1);
  }

  console.log("\nMembuat admin user...");

  const result = await createAdminUser(username, password, email || undefined);

  if (result.success) {
    console.log("\n✅ Admin user berhasil dibuat!");
    console.log("Username:", username);
    console.log("Email:", email || "-");
    console.log("\nSekarang Anda bisa login di: https://cek.nusafishing.com/admin/login");
  } else {
    console.error("\n❌ Error membuat admin user:", result.error);
    process.exit(1);
  }

  rl.close();
}

main().catch(console.error);
