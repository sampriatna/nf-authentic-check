"use client";

import Link from "next/link";
import { AlertTriangle, RefreshCw } from "lucide-react";

export default function GlobalError({
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="flex min-h-screen items-center justify-center px-5 py-10">
      <section className="panel max-w-xl p-6">
        <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-md bg-red-50 text-red-700">
          <AlertTriangle className="h-6 w-6" />
        </div>
        <h1 className="text-2xl font-black text-navy-900">Aplikasi belum bisa memuat halaman</h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          Biasanya ini terjadi karena environment Supabase belum lengkap atau tabel database belum dibuat.
          Buka endpoint health check untuk melihat status setup.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <button className="btn-primary" onClick={reset} type="button">
            <RefreshCw className="h-4 w-4" />
            Coba Lagi
          </button>
          <Link className="btn-secondary" href="/api/health">
            Cek Setup
          </Link>
        </div>
      </section>
    </main>
  );
}
