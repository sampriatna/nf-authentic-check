"use client";

import { useFormState } from "react-dom";
import { QrCode } from "lucide-react";
import { generateAuthenticatorCodesAction } from "@/app/actions";
import { SubmitButton } from "./SubmitButton";

const initialState = {
  ok: false,
  message: ""
};

export function AuthenticatorGeneratorForm() {
  const [state, formAction] = useFormState(generateAuthenticatorCodesAction, initialState);

  return (
    <form action={formAction} className="panel p-5">
      <div className="mb-5 flex items-center gap-3">
        <div className="rounded-md bg-navy-900 p-2 text-gold-400">
          <QrCode className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-lg font-black text-navy-900">Generate Kode Authenticator</h2>
          <p className="text-sm text-slate-500">Buat kode unik dan QR otomatis untuk batch produksi.</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Nama Produk" name="product_name" placeholder="Contoh: Kail Garong" />
        <Field label="Varian Produk" name="variant" placeholder="Contoh: Size 10 Gold" />
        <Field label="Batch Produksi" name="batch" placeholder="Contoh: GK-2026-A" />
        <Field label="Jumlah Kode" name="quantity" placeholder="100" type="number" />
        <Field label="Prefix Kode" name="prefix" placeholder="NF-GK" />
        <Field label="Tanggal Produksi" name="production_date" type="date" />
        <label className="block md:col-span-2">
          <span className="label">Catatan Opsional</span>
          <textarea className="field mt-2 min-h-24" name="note" placeholder="Catatan internal batch" />
        </label>
      </div>

      {state.message ? (
        <p className={`mt-4 text-sm font-semibold ${state.ok ? "text-emerald-700" : "text-red-600"}`}>
          {state.message}
        </p>
      ) : null}

      <SubmitButton className="btn-primary mt-5">Generate Kode</SubmitButton>
    </form>
  );
}

function Field({
  label,
  name,
  placeholder,
  type = "text"
}: {
  label: string;
  name: string;
  placeholder?: string;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="label">{label}</span>
      <input className="field mt-2" min={type === "number" ? 1 : undefined} name={name} placeholder={placeholder} type={type} />
    </label>
  );
}
