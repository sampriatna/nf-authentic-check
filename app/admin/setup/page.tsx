"use client";

import { useState } from "react";
import { LockKeyhole } from "lucide-react";

export default function AdminSetupPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/admin/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, email: email || undefined })
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.error || "Gagal membuat admin");
        setSuccess(false);
      } else {
        setMessage("Admin berhasil dibuat! Silakan login di /admin/login");
        setSuccess(true);
        setUsername("");
        setPassword("");
        setEmail("");
      }
    } catch (err) {
      setMessage("Terjadi kesalahan: " + (err instanceof Error ? err.message : "Unknown error"));
      setSuccess(false);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-b from-sky-50 to-blue-50">
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full"
      >
        <div className="mb-6">
          <div className="mb-3 inline-flex h-11 w-11 items-center justify-center rounded-md bg-navy-900 text-gold-400">
            <LockKeyhole className="h-5 w-5" />
          </div>
          <h1 className="text-2xl font-black text-navy-900">Setup Admin</h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Buat admin user pertama kali
          </p>
        </div>

        <label className="block mb-4">
          <span className="text-sm font-semibold text-navy-900">Username</span>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="admin"
            className="w-full mt-2 px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-navy-900"
            required
          />
        </label>

        <label className="block mb-4">
          <span className="text-sm font-semibold text-navy-900">Password</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Minimal 8 karakter"
            className="w-full mt-2 px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-navy-900"
            required
          />
        </label>

        <label className="block mb-6">
          <span className="text-sm font-semibold text-navy-900">Email (Opsional)</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@nusafishing.com"
            className="w-full mt-2 px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-navy-900"
          />
        </label>

        {message && (
          <div
            className={`p-3 rounded-md mb-4 text-sm ${
              success
                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                : "bg-red-50 text-red-700 border border-red-200"
            }`}
          >
            {message}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-navy-900 hover:bg-navy-800 disabled:bg-slate-400 text-white font-semibold py-2 rounded-md transition"
        >
          {loading ? "Membuat..." : "Buat Admin"}
        </button>

        <p className="text-xs text-slate-500 mt-4 text-center">
          Setelah admin dibuat, Anda bisa login di{" "}
          <a href="/admin/login" className="text-navy-900 font-semibold">
            /admin/login
          </a>
        </p>
      </form>
    </main>
  );
}
