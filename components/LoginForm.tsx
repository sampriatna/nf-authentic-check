"use client";

import { useFormState } from "react-dom";
import { LockKeyhole } from "lucide-react";
import { loginAction } from "@/app/actions";
import { SubmitButton } from "./SubmitButton";

const initialState = {
  ok: false,
  message: ""
};

export function LoginForm() {
  const [state, formAction] = useFormState(loginAction, initialState);

  return (
    <form action={formAction} className="panel w-full max-w-md p-6">
      <div className="mb-6">
        <div className="mb-3 inline-flex h-11 w-11 items-center justify-center rounded-md bg-navy-900 text-gold-400">
          <LockKeyhole className="h-5 w-5" />
        </div>
        <h1 className="text-2xl font-black text-navy-900">Login Admin</h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">Masuk untuk mengelola serial produk NF.</p>
      </div>

      <label className="block">
        <span className="label">Username</span>
        <input className="field mt-2" name="username" placeholder="Masukkan username" required />
      </label>

      <label className="block mt-4">
        <span className="label">Password</span>
        <input className="field mt-2" name="password" placeholder="Masukkan password" type="password" required />
      </label>

      {state.message ? <p className="mt-3 text-sm font-semibold text-red-600">{state.message}</p> : null}

      <SubmitButton className="btn-primary mt-5 w-full">Masuk Admin</SubmitButton>
    </form>
  );
}
