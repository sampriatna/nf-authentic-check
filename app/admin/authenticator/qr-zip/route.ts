import { NextRequest, NextResponse } from "next/server";
import JSZip from "jszip";
import QRCode from "qrcode";
import { isAdminLoggedIn } from "@/lib/auth";
import { getAuthenticatorCodes } from "@/lib/authenticator";

export async function GET(request: NextRequest) {
  if (!isAdminLoggedIn()) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  const product = request.nextUrl.searchParams.get("product") || undefined;
  const batch = request.nextUrl.searchParams.get("batch") || undefined;
  const status = request.nextUrl.searchParams.get("status") || undefined;
  const codes = await getAuthenticatorCodes({ product, batch, status });
  const zip = new JSZip();

  for (const code of codes) {
    const svg = await QRCode.toString(code.qr_url, {
      type: "svg",
      margin: 1,
      width: 640,
      errorCorrectionLevel: "M"
    });

    const safeName = code.unique_code.replace(/[^A-Z0-9-]/gi, "_");
    zip.file(`${safeName}.svg`, svg);
  }

  const content = await zip.generateAsync({ type: "arraybuffer" });

  return new NextResponse(content, {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="nusa-fishing-qr-codes.zip"`
    }
  });
}
