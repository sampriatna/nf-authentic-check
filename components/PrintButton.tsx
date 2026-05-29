"use client";

import { Printer } from "lucide-react";

export function PrintButton() {
  return (
    <button className="btn-primary" onClick={() => window.print()} type="button">
      <Printer className="h-4 w-4" />
      Cetak / Save PDF
    </button>
  );
}
