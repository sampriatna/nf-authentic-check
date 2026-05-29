"use client";

import { useActionState } from "react";
import { Book, ExternalLink, Loader2, Users } from "lucide-react";
import { saveCustomerLeadAction, FormState } from "@/app/actions";

type EbookClaimFormProps = {
  productCode: string;
  productName: string;
  batchCode: string;
};

const TARGET_FISH_OPTIONS = [
  { value: "", label: "Pilih Target Ikan" },
  { value: "Ikan Mas", label: "Pemancing Ikan Mas" },
  { value: "Lele", label: "Pemancing Lele" },
  { value: "Toko Pancing", label: "Toko Pancing" },
  { value: "Reseller", label: "Reseller" }
];

const initialState: FormState = {
  ok: false,
  message: ""
};

export function EbookClaimForm({ productCode, productName, batchCode }: EbookClaimFormProps) {
  const [state, formAction, pending] = useActionState(saveCustomerLeadAction, initialState);

  if (state.ok) {
    return (
      <div className="mt-6 rounded-lg border border-emerald-200 bg-emerald-50 p-5">
        <div className="flex items-start gap-3">
          <Book className="mt-0.5 h-5 w-5 flex-shrink-0 text-emerald-600" />
          <div className="flex-1">
            <h3 className="text-lg font-bold text-emerald-800">Selamat!</h3>
            <p className="mt-1 text-sm leading-6 text-emerald-700">{state.message}</p>
            <p className="mt-2 text-sm text-emerald-600">
              Tim kami akan menghubungi Anda melalui WhatsApp untuk mengirimkan ebook.
            </p>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          <a
            className="btn-primary bg-emerald-600 hover:bg-emerald-700"
            href="https://chat.whatsapp.com/nusafishing"
            target="_blank"
            rel="noreferrer"
          >
            <Users className="h-4 w-4" />
            Gabung Komunitas
          </a>
          <a
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-navy-700 underline underline-offset-2 hover:text-gold-600"
            href="https://affiliate.nusafishing.com/join"
            target="_blank"
            rel="noreferrer"
          >
            Jadi Affiliate
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-6 rounded-lg border border-gold-300 bg-gold-50 p-5">
      <div className="flex items-start gap-3">
        <Book className="mt-0.5 h-5 w-5 flex-shrink-0 text-gold-600" />
        <div className="flex-1">
          <h3 className="text-lg font-bold text-navy-900">Klaim Ebook Gratis</h3>
          <p className="mt-1 text-sm leading-6 text-navy-700">
            Selamat! Produk Anda terverifikasi ORIGINAL. Isi form di bawah untuk mendapatkan{" "}
            <strong>Ebook Racikan Umpan Update Gratis Seumur Hidup</strong>.
          </p>
        </div>
      </div>

      <form action={formAction} className="mt-5 space-y-4">
        <input type="hidden" name="product_code" value={productCode} />
        <input type="hidden" name="product_name" value={productName} />
        <input type="hidden" name="batch_code" value={batchCode} />

        <div>
          <label className="label" htmlFor="customer_name">
            Nama Lengkap
          </label>
          <input
            className="field mt-1"
            type="text"
            id="customer_name"
            name="customer_name"
            placeholder="Masukkan nama lengkap"
            required
            disabled={pending}
          />
        </div>

        <div>
          <label className="label" htmlFor="whatsapp">
            Nomor WhatsApp
          </label>
          <input
            className="field mt-1"
            type="tel"
            id="whatsapp"
            name="whatsapp"
            placeholder="Contoh: 08123456789"
            pattern="[0-9]{10,15}"
            required
            disabled={pending}
          />
          <p className="mt-1 text-xs text-slate-500">Format: 10-15 digit angka tanpa spasi</p>
        </div>

        <div>
          <label className="label" htmlFor="city">
            Kota
          </label>
          <input
            className="field mt-1"
            type="text"
            id="city"
            name="city"
            placeholder="Masukkan nama kota"
            required
            disabled={pending}
          />
        </div>

        <div>
          <label className="label" htmlFor="target_fish">
            Target Ikan / Kategori
          </label>
          <select
            className="field mt-1"
            id="target_fish"
            name="target_fish"
            required
            disabled={pending}
          >
            {TARGET_FISH_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {state.message && !state.ok && (
          <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700">
            {state.message}
          </div>
        )}

        <button className="btn-primary w-full" type="submit" disabled={pending}>
          {pending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Mengirim...
            </>
          ) : (
            <>
              <Book className="h-4 w-4" />
              Klaim Ebook Sekarang
            </>
          )}
        </button>
      </form>
    </div>
  );
}
