import { NextRequest, NextResponse } from "next/server";
import QRCode from "qrcode";
import { buildCheckUrl } from "@/lib/authenticator";

export async function GET(_request: NextRequest, { params }: { params: { code: string } }) {
  const code = decodeURIComponent(params.code).trim().toUpperCase();
  const svg = await QRCode.toString(buildCheckUrl(code), {
    type: "svg",
    margin: 1,
    width: 320,
    errorCorrectionLevel: "M"
  });

  return new NextResponse(svg, {
    headers: {
      "Content-Type": "image/svg+xml; charset=utf-8",
      "Cache-Control": "public, max-age=31536000, immutable",
      "Content-Disposition": `inline; filename="${code}.svg"`
    }
  });
}
