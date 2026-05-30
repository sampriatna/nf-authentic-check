"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { loginAdmin, logoutAdmin } from "@/lib/auth";
import { generateAuthenticatorCodes, normalizePrefix } from "@/lib/authenticator";
import { createProduct, importProducts, saveCustomerLead, verifyProduct } from "@/lib/products";
import { CheckResult, CustomerLeadInput, ProductInput } from "@/lib/types";

export type FormState = {
  ok: boolean;
  message: string;
};

export async function checkProductAction(
  _prevState: CheckResult | null,
  formData: FormData
): Promise<CheckResult> {
  const serial = String(formData.get("serial_number") || "");
  const pin = String(formData.get("pin_code") || "");

  if (!serial.trim() || !pin.trim()) {
    return {
      result: "invalid",
      message: "Serial number dan PIN wajib diisi",
      product: null
    };
  }

  return verifyProduct(serial, pin);
}

export async function loginAction(_prevState: FormState, formData: FormData): Promise<FormState> {
  const password = String(formData.get("password") || "");

  if (!password.trim()) {
    return {
      ok: false,
      message: "Password wajib diisi"
    };
  }

  const success = loginAdmin(password);

  if (!success) {
    return {
      ok: false,
      message: "Password admin salah"
    };
  }

  redirect("/admin");
}

export async function logoutAction() {
  logoutAdmin();
  redirect("/admin/login");
}

export async function addProductAction(_prevState: FormState, formData: FormData): Promise<FormState> {
  const input = formToProductInput(formData);

  if (!input.serial_number || !input.pin_code || !input.product_name || !input.batch_code) {
    return {
      ok: false,
      message: "Serial, PIN, nama produk, dan batch wajib diisi"
    };
  }

  await createProduct(input);
  revalidatePath("/admin");

  return {
    ok: true,
    message: "Produk berhasil ditambahkan"
  };
}

export async function importCsvAction(_prevState: FormState, formData: FormData): Promise<FormState> {
  const csv = String(formData.get("csv_data") || "");
  const products = parseCsv(csv);

  if (products.length === 0) {
    return {
      ok: false,
      message: "CSV kosong atau format header belum sesuai"
    };
  }

  await importProducts(products);
  revalidatePath("/admin");

  return {
    ok: true,
    message: `${products.length} data produk berhasil diimport`
  };
}

export async function generateAuthenticatorCodesAction(
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const quantity = Number(formData.get("quantity") || 0);
  const input = {
    product_name: String(formData.get("product_name") || "").trim(),
    variant: String(formData.get("variant") || "").trim(),
    batch: String(formData.get("batch") || "").trim(),
    quantity,
    prefix: normalizePrefix(String(formData.get("prefix") || "NF")),
    production_date: String(formData.get("production_date") || "") || null,
    note: String(formData.get("note") || "") || null
  };

  if (!input.product_name || !input.variant || !input.batch || !input.prefix) {
    return {
      ok: false,
      message: "Nama produk, varian, batch, dan prefix wajib diisi"
    };
  }

  if (!Number.isInteger(quantity) || quantity < 1 || quantity > 5000) {
    return {
      ok: false,
      message: "Jumlah kode harus 1 sampai 5000"
    };
  }

  try {
    const created = await generateAuthenticatorCodes(input);
    revalidatePath("/admin/authenticator");

    return {
      ok: true,
      message: `${created.length} kode authenticator berhasil dibuat`
    };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "Generate kode gagal"
    };
  }
}

function formToProductInput(formData: FormData): ProductInput {
  return {
    serial_number: String(formData.get("serial_number") || "").trim(),
    pin_code: String(formData.get("pin_code") || "").trim(),
    product_name: String(formData.get("product_name") || "").trim(),
    batch_code: String(formData.get("batch_code") || "").trim(),
    production_date: String(formData.get("production_date") || "") || null,
    expired_date: String(formData.get("expired_date") || "") || null,
    status: String(formData.get("status") || "active"),
    note: String(formData.get("note") || "") || null
  };
}

function parseCsv(csv: string): ProductInput[] {
  const lines = csv
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length < 2) return [];

  const headers = splitCsvLine(lines[0]).map((header) => header.trim());

  return lines
    .slice(1)
    .map((line) => {
      const values = splitCsvLine(line);
      const row = Object.fromEntries(headers.map((header, index) => [header, values[index] || ""]));

      return {
        serial_number: row.serial_number,
        pin_code: row.pin_code,
        product_name: row.product_name,
        batch_code: row.batch_code,
        production_date: row.production_date || null,
        expired_date: row.expired_date || null,
        status: row.status || "active",
        note: row.note || null
      };
    })
    .filter((product) => product.serial_number && product.pin_code && product.product_name && product.batch_code);
}

function splitCsvLine(line: string) {
  const values: string[] = [];
  let current = "";
  let quoted = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    const next = line[index + 1];

    if (char === '"' && quoted && next === '"') {
      current += '"';
      index += 1;
      continue;
    }

    if (char === '"') {
      quoted = !quoted;
      continue;
    }

    if (char === "," && !quoted) {
      values.push(current.trim());
      current = "";
      continue;
    }

    current += char;
  }

  values.push(current.trim());
  return values;
}

export async function saveCustomerLeadAction(
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const input: CustomerLeadInput = {
    product_code: String(formData.get("product_code") || "").trim(),
    product_name: String(formData.get("product_name") || "").trim(),
    batch_code: String(formData.get("batch_code") || "").trim(),
    customer_name: String(formData.get("customer_name") || "").trim(),
    whatsapp: String(formData.get("whatsapp") || "").trim(),
    city: String(formData.get("city") || "").trim(),
    target_fish: String(formData.get("target_fish") || "").trim()
  };

  if (!input.customer_name || !input.whatsapp || !input.city || !input.target_fish) {
    return {
      ok: false,
      message: "Semua field wajib diisi"
    };
  }

  if (!input.whatsapp.match(/^[0-9]{10,15}$/)) {
    return {
      ok: false,
      message: "Nomor WhatsApp tidak valid (10-15 digit angka)"
    };
  }

  try {
    await saveCustomerLead(input);
    return {
      ok: true,
      message: "Data berhasil disimpan! Anda berhak mendapatkan Ebook Racikan Umpan Update Gratis Seumur Hidup."
    };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "Gagal menyimpan data"
    };
  }
}

export async function deleteSuspiciousProductAction(_prevState: FormState, formData: FormData): Promise<FormState> {
  const productId = String(formData.get("product_id") || "").trim();

  if (!productId) {
    return {
      ok: false,
      message: "Product ID tidak valid"
    };
  }

  try {
    const { deleteProduct } = await import("@/lib/products");
    await deleteProduct(productId);
    revalidatePath("/admin");

    return {
      ok: true,
      message: "Kode mencurigakan berhasil dihapus"
    };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "Gagal menghapus kode"
    };
  }
}

export async function blockSuspiciousProductAction(_prevState: FormState, formData: FormData): Promise<FormState> {
  const productId = String(formData.get("product_id") || "").trim();

  if (!productId) {
    return {
      ok: false,
      message: "Product ID tidak valid"
    };
  }

  try {
    const { blockProduct } = await import("@/lib/products");
    await blockProduct(productId);
    revalidatePath("/admin");

    return {
      ok: true,
      message: "Kode mencurigakan berhasil diblock"
    };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "Gagal memblock kode"
    };
  }
}
