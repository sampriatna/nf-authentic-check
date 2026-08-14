import { ShieldCheck } from "lucide-react";

export function VerificationResultCard() {
  return (
    <div className="panel border border-navy-100/50 bg-gradient-to-br from-navy-50 to-slate-50 p-5 md:p-6">
      <div className="flex items-start gap-4">
        <div className="inline-flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-navy-100">
          <ShieldCheck className="h-6 w-6 text-navy-700" />
        </div>
        <div className="flex-1">
          <h2 className="text-base font-black text-navy-900">Hasil verifikasi akan tampil di sini</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Masukkan Serial Number dan PIN, lalu klik Cek Keaslian untuk melihat status produk.
          </p>
          <div className="mt-4 rounded-md bg-white p-3 text-xs leading-5 text-slate-600">
            <p className="font-semibold text-slate-700">Untuk label QR terbaru:</p>
            <p className="mt-1">
              Cukup scan QR pada label produk atau buka link dengan format <span className="font-mono font-medium text-navy-900">/cek/KODE</span>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
