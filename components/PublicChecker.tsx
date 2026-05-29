"use client";

import { useFormState } from "react-dom";
import { AlertTriangle, BadgeCheck, MessageCircle, QrCode, Search, ShieldCheck } from "lucide-react";
import { checkProductAction } from "@/app/actions";
import { formatDate, formatDateTime } from "@/lib/format";

const adminWhatsapp = process.env.NEXT_PUBLIC_ADMIN_WHATSAPP || "6282285333666";

export function PublicChecker() {
  const [state, formAction] = useFormState(checkProductAction, null);
  const isSuccess = state?.result === "first_scan" || state?.result === "repeat_scan";
  const isRepeat = state?.result === "repeat_scan";
  const whatsappText = encodeURIComponent("Halo admin NF, saya ingin melaporkan produk yang mencurigakan.");

  return (
    <main className="min-h-screen">
      <section className="bg-navy-900 text-white">
        <div className="mx-auto grid min-h-[42vh] max-w-6xl gap-8 px-5 py-10 md:grid-cols-[1.05fr_0.95fr] md:items-center md:px-8">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-gold-400/30 px-3 py-1 text-sm text-gold-400">
              <ShieldCheck className="h-4 w-4" />
              cek.nusafishing.com
            </div>
            <h1 className="max-w-2xl text-4xl font-black leading-tight md:text-6xl">
              Portal cek keaslian produk Nusa Fishing.
            </h1>
            <p className="mt-4 max-w-xl text-base leading-7 text-navy-100">
              Gunakan halaman ini khusus untuk verifikasi produk. Website utama Nusa Fishing tetap terpisah
              dari portal cek keaslian.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <a className="btn-secondary border-white/20 bg-white/10 text-white hover:bg-white hover:text-navy-900" href="/admin/authenticator">
                <QrCode className="h-4 w-4" />
                Admin QR
              </a>
              <a className="btn-secondary border-white/20 bg-white/10 text-white hover:bg-white hover:text-navy-900" href="https://nusafishing.com" rel="noreferrer" target="_blank">
                Website Utama
              </a>
            </div>
          </div>

          <form action={formAction} className="panel p-5 text-navy-900 md:p-6">
            <div className="mb-5">
              <h2 className="text-xl font-black">Cek Serial + PIN</h2>
              <p className="mt-1 text-sm text-slate-500">Untuk label lama yang memakai serial number dan PIN.</p>
            </div>

            <div className="space-y-4">
              <label className="block">
                <span className="label">Serial Number</span>
                <input className="field mt-2" name="serial_number" placeholder="Contoh: NF-2026-0001" />
              </label>

              <label className="block">
                <span className="label">PIN Produk</span>
                <input className="field mt-2" name="pin_code" placeholder="Masukkan PIN" type="password" />
              </label>

              <button className="btn-primary w-full" type="submit">
                <Search className="h-4 w-4" />
                Cek Keaslian
              </button>
            </div>
          </form>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-8 md:px-8">
        {state ? (
          <div
            className={`panel overflow-hidden border-l-4 ${
              isSuccess ? (isRepeat ? "border-l-gold-500" : "border-l-emerald-500") : "border-l-red-500"
            }`}
          >
            <div className="flex flex-col gap-4 p-5 md:flex-row md:items-start md:justify-between md:p-6">
              <div>
                <div
                  className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-bold ${
                    isSuccess ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
                  }`}
                >
                  {isSuccess ? <BadgeCheck className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
                  {state.message}
                </div>
                {isRepeat ? (
                  <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
                    Kode ini valid, tetapi pernah dicek sebelumnya. Cocokkan kondisi kemasan dan hubungi admin
                    bila Anda tidak merasa pernah melakukan scan.
                  </p>
                ) : null}
                {!isSuccess ? (
                  <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
                    Serial number atau PIN tidak cocok dengan database NF Authentic Check.
                  </p>
                ) : null}
              </div>

              <a
                className="btn-secondary"
                href={`https://wa.me/${adminWhatsapp}?text=${whatsappText}`}
                rel="noreferrer"
                target="_blank"
              >
                <MessageCircle className="h-4 w-4" />
                WhatsApp Admin
              </a>
            </div>

            {state.product ? (
              <div className="grid border-t border-navy-100 p-5 md:grid-cols-3 md:p-6">
                <Detail label="Nama Produk" value={state.product.product_name} />
                <Detail label="Batch" value={state.product.batch_code} />
                <Detail label="Tanggal Produksi" value={formatDate(state.product.production_date)} />
                <Detail label="Expired Date" value={formatDate(state.product.expired_date)} />
                <Detail label="Status" value={state.product.status} />
                <Detail label="Scan Pertama" value={formatDateTime(state.product.first_scan_at)} />
                <Detail label="Jumlah Scan" value={`${state.product.scan_count} kali`} />
                <Detail label="Scan Terakhir" value={formatDateTime(state.product.last_scan_at)} />
                <Detail label="Catatan" value={state.product.note || "-"} />
              </div>
            ) : null}
          </div>
        ) : (
          <div className="panel p-5 md:p-6">
            <h2 className="text-lg font-black text-navy-900">Status autentikasi akan tampil di sini</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Untuk QR authenticator baru, scan QR pada label atau buka link dengan format /cek/KODE.
            </p>
          </div>
        )}
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
