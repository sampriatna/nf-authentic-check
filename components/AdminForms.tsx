"use client";

import { ChangeEvent, useState } from "react";
import { useFormState } from "react-dom";
import { FileUp, PlusCircle } from "lucide-react";
import { addProductAction, importCsvAction } from "@/app/actions";
import { SubmitButton } from "./SubmitButton";

const initialState = {
  ok: false,
  message: ""
};

const csvExample =
  "serial_number,pin_code,product_name,batch_code,production_date,expired_date,status,note\nNF-2026-0001,123456,NF Serum,BATCH-A,2026-01-10,2028-01-10,active,Sample";

export function AddProductForm() {
  const [state, formAction] = useFormState(addProductAction, initialState);

  return (
    <form action={formAction} className="panel p-5">
      <div className="mb-5 flex items-center gap-3">
        <div className="rounded-md bg-navy-900 p-2 text-gold-400">
          <PlusCircle className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-lg font-black text-navy-900">Tambah Produk</h2>
          <p className="text-sm text-slate-500">Input serial dan PIN baru.</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Serial Number" name="serial_number" placeholder="NF-2026-0001" />
        <Field label="PIN Produk" name="pin_code" placeholder="123456" />
        <Field label="Nama Produk" name="product_name" placeholder="Nama produk" />
        <Field label="Batch Code" name="batch_code" placeholder="BATCH-A" />
        <Field label="Tanggal Produksi" name="production_date" type="date" />
        <Field label="Expired Date" name="expired_date" type="date" />
        <label className="block">
          <span className="label">Status</span>
          <select className="field mt-2" name="status">
            <option value="active">active</option>
            <option value="blocked">blocked</option>
            <option value="expired">expired</option>
          </select>
        </label>
        <Field label="Catatan" name="note" placeholder="Opsional" />
      </div>

      {state.message ? (
        <p className={`mt-4 text-sm font-semibold ${state.ok ? "text-emerald-700" : "text-red-600"}`}>
          {state.message}
        </p>
      ) : null}

      <SubmitButton className="btn-primary mt-5">Tambah Data</SubmitButton>
    </form>
  );
}

export function ImportCsvForm() {
  const [state, formAction] = useFormState(importCsvAction, initialState);
  const [csv, setCsv] = useState(csvExample);

  function handleFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => setCsv(String(reader.result || ""));
    reader.readAsText(file);
  }

  return (
    <form action={formAction} className="panel p-5">
      <div className="mb-5 flex items-center gap-3">
        <div className="rounded-md bg-navy-900 p-2 text-gold-400">
          <FileUp className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-lg font-black text-navy-900">Import CSV</h2>
          <p className="text-sm text-slate-500">Gunakan header sesuai contoh.</p>
        </div>
      </div>

      <input accept=".csv,text/csv" className="field" onChange={handleFile} type="file" />
      <textarea
        className="field mt-4 min-h-40 font-mono text-xs"
        name="csv_data"
        onChange={(event) => setCsv(event.target.value)}
        value={csv}
      />

      {state.message ? (
        <p className={`mt-4 text-sm font-semibold ${state.ok ? "text-emerald-700" : "text-red-600"}`}>
          {state.message}
        </p>
      ) : null}

      <SubmitButton className="btn-primary mt-5">Import Data</SubmitButton>
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
      <input className="field mt-2" name={name} placeholder={placeholder} type={type} />
    </label>
  );
}
