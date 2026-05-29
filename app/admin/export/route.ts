import { NextRequest, NextResponse } from "next/server";
import { isAdminLoggedIn } from "@/lib/auth";
import { formatDateTime, toCsvValue } from "@/lib/format";
import { getProducts } from "@/lib/products";

export async function GET(request: NextRequest) {
  if (!isAdminLoggedIn()) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  const products = await getProducts();
  const headers = [
    "serial_number",
    "pin_code",
    "product_name",
    "batch_code",
    "production_date",
    "expired_date",
    "status",
    "scan_count",
    "first_scan_at",
    "last_scan_at",
    "first_scan_ip",
    "last_scan_ip",
    "note"
  ];

  const rows = products.map((product) =>
    [
      product.serial_number,
      product.pin_code,
      product.product_name,
      product.batch_code,
      product.production_date,
      product.expired_date,
      product.status,
      product.scan_count,
      formatDateTime(product.first_scan_at),
      formatDateTime(product.last_scan_at),
      product.first_scan_ip,
      product.last_scan_ip,
      product.note
    ]
      .map(toCsvValue)
      .join(",")
  );

  const csv = [headers.join(","), ...rows].join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="nf-authentic-check-report.csv"`
    }
  });
}
