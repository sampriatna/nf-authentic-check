import crypto from "crypto";
import { headers } from "next/headers";
import { AuthenticatorCode, AuthenticatorGenerateInput } from "./types";
import { getSupabaseAdmin } from "./supabase";

const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function getPublicBaseUrl() {
  return (process.env.NEXT_PUBLIC_PUBLIC_CHECK_BASE_URL || process.env.NEXT_PUBLIC_APP_URL || "https://cek.nusafishing.com")
    .replace(/\/$/, "");
}

export function buildCheckUrl(uniqueCode: string) {
  return `${getPublicBaseUrl()}/cek/${encodeURIComponent(uniqueCode)}`;
}

export function normalizePrefix(prefix: string) {
  return prefix
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 24);
}

function randomToken(length = 8) {
  const bytes = crypto.randomBytes(length);
  return Array.from(bytes, (byte) => alphabet[byte % alphabet.length]).join("");
}

function makeUniqueCode(prefix: string) {
  const cleanPrefix = normalizePrefix(prefix) || "NF";
  return `${cleanPrefix}-${randomToken(8)}`;
}

export async function generateAuthenticatorCodes(input: AuthenticatorGenerateInput) {
  const supabase = getSupabaseAdmin();
  const quantity = Math.min(Math.max(input.quantity, 1), 5000);
  const rows: Array<Omit<AuthenticatorCode, "id" | "created_at">> = [];
  const generated = new Set<string>();

  while (rows.length < quantity) {
    const uniqueCode = makeUniqueCode(input.prefix);
    if (generated.has(uniqueCode)) continue;

    generated.add(uniqueCode);
    rows.push({
      product_name: input.product_name.trim(),
      variant: input.variant.trim(),
      batch: input.batch.trim(),
      unique_code: uniqueCode,
      qr_url: buildCheckUrl(uniqueCode),
      status: "active",
      scan_count: 0,
      first_scanned_at: null,
      last_scanned_at: null,
      production_date: input.production_date || null,
      note: input.note || null
    });
  }

  const { data, error } = await supabase.from("authenticator_codes").insert(rows).select("*");

  if (error) {
    if (isMissingTableError(error)) {
      throw new Error("Tabel authenticator_codes belum dibuat. Jalankan supabase/schema.sql di SQL Editor Supabase.");
    }
    if (error.code === "23505") {
      return generateAuthenticatorCodes(input);
    }
    throw error;
  }

  return (data || []) as AuthenticatorCode[];
}

export async function getAuthenticatorCodes(filters?: {
  product?: string;
  batch?: string;
  status?: string;
}) {
  const supabase = getSupabaseAdmin();
  let query = supabase.from("authenticator_codes").select("*").order("created_at", { ascending: false });

  if (filters?.product) query = query.ilike("product_name", `%${filters.product}%`);
  if (filters?.batch) query = query.ilike("batch", `%${filters.batch}%`);
  if (filters?.status) query = query.eq("status", filters.status);

  const { data, error } = await query;
  if (error) {
    if (isMissingTableError(error)) return [];
    throw error;
  }

  return (data || []) as AuthenticatorCode[];
}

export async function checkAuthenticatorCode(uniqueCode: string) {
  const supabase = getSupabaseAdmin();
  const codeValue = decodeURIComponent(uniqueCode).trim().toUpperCase();
  const now = new Date().toISOString();

  const { data: code, error } = await supabase
    .from("authenticator_codes")
    .select("*")
    .eq("unique_code", codeValue)
    .maybeSingle<AuthenticatorCode>();

  if (error) {
    if (isMissingTableError(error)) {
      return {
        result: "invalid" as const,
        message: "Kode tidak terdaftar",
        code: null
      };
    }
    throw error;
  }

  const { error: logError } = await supabase.from("authenticator_logs").insert({
    unique_code: codeValue,
    result: code ? "valid" : "invalid",
    scanned_at: now,
    ip_address: getClientIp(),
    user_agent: headers().get("user-agent") || "unknown"
  });

  if (logError && !isMissingTableError(logError)) throw logError;

  if (!code) {
    return {
      result: "invalid" as const,
      message: "Kode tidak terdaftar",
      code: null
    };
  }

  const result: "valid_first" | "valid_repeat" = code.scan_count > 0 ? "valid_repeat" : "valid_first";
  const { data: updatedCode, error: updateError } = await supabase
    .from("authenticator_codes")
    .update({
      scan_count: code.scan_count + 1,
      first_scanned_at: code.first_scanned_at || now,
      last_scanned_at: now
    })
    .eq("id", code.id)
    .select("*")
    .single<AuthenticatorCode>();

  if (updateError) throw updateError;

  return {
    result,
    message:
      code.scan_count === 0
        ? "Produk Asli Nusa Fishing"
        : "Produk Asli Nusa Fishing, tapi kode ini sudah pernah discan sebelumnya",
    code: updatedCode
  };
}

function getClientIp() {
  const h = headers();
  const forwardedFor = h.get("x-forwarded-for");
  return forwardedFor?.split(",")[0]?.trim() || h.get("x-real-ip") || "unknown";
}

function isMissingTableError(error: { code?: string; message?: string }) {
  return error.code === "PGRST205" || Boolean(error.message?.includes("Could not find the table"));
}
