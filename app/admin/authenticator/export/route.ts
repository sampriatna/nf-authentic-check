import { NextRequest, NextResponse } from "next/server";
import { isAdminLoggedIn } from "@/lib/auth";
import { getAuthenticatorCodes } from "@/lib/authenticator";
import { formatDateTime, toCsvValue } from "@/lib/format";

export async function GET(request: NextRequest) {
  if (!isAdminLoggedIn()) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  const codes = await getAuthenticatorCodes();
  const headers = [
    "product_name",
    "variant",
    "batch",
    "unique_code",
    "qr_url",
    "status",
    "scan_count",
    "first_scanned_at",
    "last_scanned_at",
    "created_at"
  ];

  const rows = codes.map((code) =>
    [
      code.product_name,
      code.variant,
      code.batch,
      code.unique_code,
      code.qr_url,
      code.status,
      code.scan_count,
      formatDateTime(code.first_scanned_at),
      formatDateTime(code.last_scanned_at),
      formatDateTime(code.created_at)
    ]
      .map(toCsvValue)
      .join(",")
  );

  return new NextResponse([headers.join(","), ...rows].join("\n"), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="nusa-fishing-authenticator-codes.csv"`
    }
  });
}
