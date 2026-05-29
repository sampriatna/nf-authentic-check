import Link from "next/link";
import { AlertTriangle, BadgeCheck, MessageCircle, ShieldCheck } from "lucide-react";
import { checkAuthenticatorCode } from "@/lib/authenticator";
import { formatDateTime } from "@/lib/format";

const adminWhatsapp = process.env.NEXT_PUBLIC_ADMIN_WHATSAPP || "6281234567890";

type PageProps = {
  params: {
    code: string;
  };
};

export default async function PublicCodeCheckPage({ params }: PageProps) {
  const result = await checkAuthenticatorCode(params.code);
  const isValid = result.result === "valid_first" || result.result === "valid_repeat";
  const isRepeat = result.result === "valid_repeat";
  const whatsappText = encodeURIComponent(`Halo admin Nusa Fishing, saya ingin melaporkan kode mencurigakan: ${decodeURIComponent(params.code)}`);

  return (
    <main className="min-h-screen">
      <section className="bg-navy-900 text-white">
        <div className="mx-auto max-w-4xl px-5 py-10 md:px-8">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-gold-400/30 px-3 py-1 text-sm text-gold-400">
            <ShieldCheck className="h-4 w-4" />
            cek.nusafishing.com
          </div>
          <h1 className="text-4xl font-black leading-tight md:text-5xl">Cek Keaslian Produk</h1>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-navy-100">
            Portal khusus autentikasi produk Nusa Fishing. Website utama tetap terpisah di nusafishing.com.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-5 py-8 md:px-8">
        <div className={`panel overflow-hidden border-l-4 ${isValid ? "border-l-emerald-500" : "border-l-red-500"}`}>
          <div className="p-5 md:p-6">
            <div
              className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-bold ${
                isValid ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
              }`}
            >
              {isValid ? <BadgeCheck className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
              {result.message}
            </div>

            {isValid && result.code ? (
              <>
                <h2 className="mt-4 text-2xl font-black text-navy-900">Produk Asli Nusa Fishing</h2>
                {isRepeat ? (
                  <p className="mt-3 rounded-md border border-gold-400 bg-gold-400/10 p-4 text-sm font-semibold leading-6 text-navy-900">
                    Peringatan: kode ini sudah pernah discan sebelumnya. Jika Anda baru pertama kali membuka label ini,
                    hubungi admin Nusa Fishing.
                  </p>
                ) : (
                  <p className="mt-3 text-sm leading-6 text-slate-600">
                    Kode valid dan tercatat sebagai scan pertama pada sistem Nusa Fishing.
                  </p>
                )}

                <div className="mt-5 grid border-t border-navy-100 md:grid-cols-2">
                  <Detail label="Nama Produk" value={result.code.product_name} />
                  <Detail label="Varian" value={result.code.variant} />
                  <Detail label="Batch" value={result.code.batch} />
                  <Detail label="Status Asli" value={result.code.status} />
                  <Detail label="Jumlah Scan" value={`${result.code.scan_count} kali`} />
                  <Detail label="Scan Terakhir" value={formatDateTime(result.code.last_scanned_at)} />
                </div>
              </>
            ) : (
              <>
                <h2 className="mt-4 text-2xl font-black text-navy-900">Kode tidak terdaftar</h2>
                <p className="mt-3 rounded-md border border-red-200 bg-red-50 p-4 text-sm font-semibold leading-6 text-red-800">
                  Hati-hati produk palsu. Kode ini tidak ditemukan pada database resmi Nusa Fishing.
                </p>
              </>
            )}

            <div className="mt-6 flex flex-wrap gap-3">
              <a className="btn-primary" href={`https://wa.me/${adminWhatsapp}?text=${whatsappText}`} rel="noreferrer" target="_blank">
                <MessageCircle className="h-4 w-4" />
                Hubungi Admin Nusa Fishing
              </a>
              <Link className="btn-secondary" href="/">
                Cek Serial Produk
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-b border-navy-100 py-4 md:px-4">
      <p className="text-xs font-bold uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-1 break-words text-sm font-semibold text-navy-900">{value}</p>
    </div>
  );
}
