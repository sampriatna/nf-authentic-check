"use client";

import { useState } from "react";
import { Check, Copy, Download } from "lucide-react";

export function AuthenticatorActions({ code, qrUrl }: { code: string; qrUrl: string }) {
  const [copied, setCopied] = useState(false);

  async function copyLink() {
    await navigator.clipboard.writeText(qrUrl);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <div className="flex flex-wrap gap-2">
      <button className="btn-secondary px-3 py-2" onClick={copyLink} title="Copy link cek produk" type="button">
        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
        {copied ? "Copied" : "Copy Link"}
      </button>
      <a className="btn-secondary px-3 py-2" download={`${code}.svg`} href={`/api/qr/${encodeURIComponent(code)}`}>
        <Download className="h-4 w-4" />
        QR
      </a>
    </div>
  );
}
