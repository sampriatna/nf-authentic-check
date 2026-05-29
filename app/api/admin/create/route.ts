import { createClient } from "@supabase/supabase-js";
import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { username, password, email } = await req.json();

    // Validate inputs
    if (!username || !password) {
      return NextResponse.json(
        { error: "Username dan password wajib diisi" },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password minimal 8 karakter" },
        { status: 400 }
      );
    }

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
    const supabase = createClient(url, key);

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Insert admin user
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
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data,
      message: "Admin user berhasil dibuat"
    });
  } catch (err) {
    console.error("[api] Error creating admin:", err);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat membuat admin" },
      { status: 500 }
    );
  }
}
