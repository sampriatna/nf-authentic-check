import { headers } from "next/headers";
import { CustomerLead, CustomerLeadInput, LeadsDashboardStats, Product, ProductInput } from "./types";
import { getSupabaseAdmin } from "./supabase";

function getRequestMeta() {
  const h = headers();
  const forwardedFor = h.get("x-forwarded-for");
  const ip = forwardedFor?.split(",")[0]?.trim() || h.get("x-real-ip") || "unknown";

  return {
    ip,
    userAgent: h.get("user-agent") || "unknown"
  };
}

export async function verifyProduct(serialNumber: string, pinCode: string) {
  const supabase = getSupabaseAdmin();
  const serial = serialNumber.trim();
  const pin = pinCode.trim();
  const meta = getRequestMeta();
  const now = new Date().toISOString();

  const { data: product, error } = await supabase
    .from("products")
    .select("*")
    .eq("serial_number", serial)
    .maybeSingle<Product>();

  if (error) throw error;

  const valid = product && product.pin_code === pin;
  const logResult: "first_scan" | "repeat_scan" | "invalid" = valid
    ? product.scan_count > 0
      ? "repeat_scan"
      : "first_scan"
    : "invalid";

  await supabase.from("verification_logs").insert({
    serial_number: serial,
    pin_input: pin,
    result: logResult,
    scanned_at: now,
    ip_address: meta.ip,
    user_agent: meta.userAgent
  });

  if (!valid) {
    return {
      result: "invalid" as const,
      message: "Kode tidak valid",
      product: null
    };
  }

  const result: "first_scan" | "repeat_scan" = product.scan_count > 0 ? "repeat_scan" : "first_scan";

  const updates = {
    scan_count: product.scan_count + 1,
    first_scan_at: product.first_scan_at || now,
    last_scan_at: now,
    first_scan_ip: product.first_scan_ip || meta.ip,
    last_scan_ip: meta.ip
  };

  const { data: updatedProduct, error: updateError } = await supabase
    .from("products")
    .update(updates)
    .eq("id", product.id)
    .select("*")
    .single<Product>();

  if (updateError) throw updateError;

  return {
    result,
    message:
      product.scan_count === 0
        ? "Produk Asli - Scan Pertama"
        : "Produk Asli, tapi kode ini sudah pernah dicek sebelumnya",
    product: updatedProduct
  };
}

export async function createProduct(input: ProductInput) {
  const supabase = getSupabaseAdmin();

  const payload = {
    serial_number: input.serial_number.trim(),
    pin_code: input.pin_code.trim(),
    product_name: input.product_name.trim(),
    batch_code: input.batch_code.trim(),
    production_date: input.production_date || null,
    expired_date: input.expired_date || null,
    status: input.status || "active",
    note: input.note || null
  };

  const { error } = await supabase.from("products").insert(payload);
  if (error) throw error;
}

export async function importProducts(inputs: ProductInput[]) {
  const supabase = getSupabaseAdmin();
  const rows = inputs.map((input) => ({
    serial_number: input.serial_number.trim(),
    pin_code: input.pin_code.trim(),
    product_name: input.product_name.trim(),
    batch_code: input.batch_code.trim(),
    production_date: input.production_date || null,
    expired_date: input.expired_date || null,
    status: input.status || "active",
    note: input.note || null
  }));

  if (rows.length === 0) return;

  const { error } = await supabase.from("products").upsert(rows, {
    onConflict: "serial_number"
  });

  if (error) throw error;
}

export async function getProducts() {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data || []) as Product[];
}

export async function getDashboardStats() {
  const products = await getProducts();
  const suspicious = products.filter((product) => product.scan_count > 1);

  return {
    totalProducts: products.length,
    totalScans: products.reduce((sum, product) => sum + product.scan_count, 0),
    suspiciousCount: suspicious.length,
    suspicious,
    products
  };
}

export async function saveCustomerLead(input: CustomerLeadInput): Promise<CustomerLead> {
  const supabase = getSupabaseAdmin();
  const now = new Date().toISOString();

  const payload = {
    product_code: input.product_code.trim(),
    product_name: input.product_name.trim(),
    batch_code: input.batch_code.trim(),
    customer_name: input.customer_name.trim(),
    whatsapp: input.whatsapp.trim(),
    city: input.city.trim(),
    target_fish: input.target_fish.trim(),
    scanned_at: now,
    created_at: now
  };

  const { data, error } = await supabase
    .from("customer_leads")
    .insert(payload)
    .select("*")
    .single<CustomerLead>();

  if (error) throw error;
  return data;
}

export async function getLeadsDashboardStats(): Promise<LeadsDashboardStats> {
  const supabase = getSupabaseAdmin();

  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

  // Get all customer leads
  const { data: leads, error: leadsError } = await supabase
    .from("customer_leads")
    .select("*");

  if (leadsError) throw leadsError;

  const allLeads = (leads || []) as CustomerLead[];

  // Get authenticator codes for scan counts
  const { data: codes, error: codesError } = await supabase
    .from("authenticator_codes")
    .select("product_name, scan_count, last_scanned_at");

  if (codesError) throw codesError;

  const allCodes = codes || [];

  // Calculate scans today and this month from authenticator codes
  const scansToday = allCodes.filter(
    (code) => code.last_scanned_at && new Date(code.last_scanned_at) >= new Date(startOfDay)
  ).reduce((sum, code) => sum + (code.scan_count || 0), 0);

  const scansThisMonth = allCodes.filter(
    (code) => code.last_scanned_at && new Date(code.last_scanned_at) >= new Date(startOfMonth)
  ).reduce((sum, code) => sum + (code.scan_count || 0), 0);

  // Find top product by scan count
  const productScans: Record<string, number> = {};
  for (const code of allCodes) {
    if (code.product_name && code.scan_count > 0) {
      productScans[code.product_name] = (productScans[code.product_name] || 0) + code.scan_count;
    }
  }
  const topProduct = Object.entries(productScans)
    .sort((a, b) => b[1] - a[1])[0]?.[0] || null;

  // Find top city from leads
  const cityCounts: Record<string, number> = {};
  for (const lead of allLeads) {
    if (lead.city) {
      cityCounts[lead.city] = (cityCounts[lead.city] || 0) + 1;
    }
  }
  const topCity = Object.entries(cityCounts)
    .sort((a, b) => b[1] - a[1])[0]?.[0] || null;

  // Count by target fish
  const resellerCount = allLeads.filter((lead) => lead.target_fish === "Reseller").length;
  const tokoPancingCount = allLeads.filter((lead) => lead.target_fish === "Toko Pancing").length;
  const pemancingMasCount = allLeads.filter((lead) => lead.target_fish === "Ikan Mas").length;
  const pemancingLeleCount = allLeads.filter((lead) => lead.target_fish === "Lele").length;

  return {
    scansToday,
    scansThisMonth,
    topProduct,
    topCity,
    resellerCount,
    tokoPancingCount,
    pemancingMasCount,
    pemancingLeleCount
  };
}
