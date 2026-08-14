import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET() {
  const requiredEnv = [
    "NEXT_PUBLIC_SUPABASE_URL",
    "SUPABASE_SERVICE_ROLE_KEY",
    "ADMIN_PASSWORD",
    "NEXT_PUBLIC_APP_URL",
    "NEXT_PUBLIC_PUBLIC_CHECK_BASE_URL"
  ];

  const env = Object.fromEntries(requiredEnv.map((key) => [key, Boolean(process.env[key])]));
  const missingEnv = requiredEnv.filter((key) => !process.env[key]);

  if (missingEnv.length) {
    return NextResponse.json(
      {
        ok: false,
        message: "Environment variable belum lengkap.",
        env,
        missingEnv
      },
      { status: 500 }
    );
  }

  try {
    const supabase = getSupabaseAdmin();
    const checks = await Promise.all([
      supabase.from("products").select("id").limit(1),
      supabase.from("verification_logs").select("id").limit(1),
      supabase.from("authenticator_codes").select("id").limit(1),
      supabase.from("authenticator_logs").select("id").limit(1),
      supabase.from("customer_leads").select("id").limit(1)
    ]);

    const tableNames = ["products", "verification_logs", "authenticator_codes", "authenticator_logs", "customer_leads"];
    const tables = Object.fromEntries(
      checks.map((check, index) => [
        tableNames[index],
        {
          ok: !check.error,
          error: check.error?.message || null
        }
      ])
    );
    
    // Core tables are required
    const coreTables = ["products", "authenticator_codes", "customer_leads"];
    const failedCoreTables = coreTables.filter((name) => tables[name] && !tables[name].ok);

    return NextResponse.json(
      {
        ok: failedCoreTables.length === 0,
        message: failedCoreTables.length === 0 ? "Setup aplikasi siap digunakan." : `Tabel yang hilang: ${failedCoreTables.join(", ")}`,
        env,
        tables
      },
      { status: failedCoreTables.length === 0 ? 200 : 500 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        message: error instanceof Error ? error.message : "Health check gagal."
      },
      { status: 500 }
    );
  }
}
