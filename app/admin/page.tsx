import Link from "next/link";
import { redirect } from "next/navigation";
import { Download, Eye, LogOut, ShieldAlert, ShieldCheck } from "lucide-react";
import { logoutAction } from "@/app/actions";
import { AddProductForm, ImportCsvForm } from "@/components/AdminForms";
import { isAdminLoggedIn } from "@/lib/auth";
import { formatDate, formatDateTime } from "@/lib/format";
import { getDashboardStats } from "@/lib/products";

export default async function AdminPage() {
  if (!isAdminLoggedIn()) redirect("/admin/login");

  const { products, suspicious, suspiciousCount, totalProducts, totalScans } = await getDashboardStats();

  return (
    <main className="min-h-screen">
      <header className="bg-navy-900 text-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-5 py-6 md:flex-row md:items-center md:justify-between md:px-8">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 text-sm font-bold text-gold-400">
              <ShieldCheck className="h-4 w-4" />
              NF Authentic Check
            </div>
            <h1 className="text-3xl font-black">Admin Dashboard</h1>
            <p className="mt-2 max-w-xl text-sm leading-6 text-navy-100">
              Kelola serial + PIN lama. Untuk batch QR baru, gunakan Generator QR.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link className="btn-secondary border-white/20 bg-white/10 text-white hover:bg-white hover:text-navy-900" href="/">
              Portal Cek
            </Link>
            <Link className="btn-secondary border-white/20 bg-white/10 text-white hover:bg-white hover:text-navy-900" href="/admin/authenticator">
              Generator QR
            </Link>
            <a className="btn-secondary border-white/20 bg-white/10 text-white hover:bg-white hover:text-navy-900" href="/admin/export">
              <Download className="h-4 w-4" />
              Export CSV
            </a>
            <form action={logoutAction}>
              <button className="btn-secondary border-white/20 bg-white/10 text-white hover:bg-white hover:text-navy-900" type="submit">
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </form>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-5 py-7 md:px-8">
        <div className="grid gap-4 md:grid-cols-3">
          <Stat label="Total Serial" value={totalProducts} />
          <Stat label="Total Scan" value={totalScans} />
          <Stat label="Kode Mencurigakan" value={suspiciousCount} />
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-2">
          <AddProductForm />
          <ImportCsvForm />
        </div>

        <section className="panel mt-6 overflow-hidden">
          <div className="flex flex-col gap-3 border-b border-navy-100 p-5 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-lg font-black text-navy-900">Kode Mencurigakan</h2>
              <p className="text-sm text-slate-500">Serial dengan scan berulang lebih dari satu kali.</p>
            </div>
            <ShieldAlert className="h-6 w-6 text-gold-600" />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="bg-navy-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-5 py-3">Serial</th>
                  <th className="px-5 py-3">Produk</th>
                  <th className="px-5 py-3">Jumlah Scan</th>
                  <th className="px-5 py-3">Scan Pertama</th>
                  <th className="px-5 py-3">Scan Terakhir</th>
                  <th className="px-5 py-3">IP Terakhir</th>
                </tr>
              </thead>
              <tbody>
                {suspicious.length ? (
                  suspicious.map((product) => (
                    <tr className="border-t border-navy-100" key={product.id}>
                      <td className="px-5 py-4 font-bold text-navy-900">{product.serial_number}</td>
                      <td className="px-5 py-4">{product.product_name}</td>
                      <td className="px-5 py-4 font-bold text-gold-600">{product.scan_count}</td>
                      <td className="px-5 py-4">{formatDateTime(product.first_scan_at)}</td>
                      <td className="px-5 py-4">{formatDateTime(product.last_scan_at)}</td>
                      <td className="px-5 py-4">{product.last_scan_ip || "-"}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className="px-5 py-5 text-slate-500" colSpan={6}>
                      Belum ada kode mencurigakan.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="panel mt-6 overflow-hidden">
          <div className="flex items-center justify-between border-b border-navy-100 p-5">
            <div>
              <h2 className="text-lg font-black text-navy-900">Daftar Serial</h2>
              <p className="text-sm text-slate-500">Pantau status dan jumlah scan tiap produk.</p>
            </div>
            <Eye className="h-6 w-6 text-navy-700" />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] text-left text-sm">
              <thead className="bg-navy-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-5 py-3">Serial</th>
                  <th className="px-5 py-3">PIN</th>
                  <th className="px-5 py-3">Produk</th>
                  <th className="px-5 py-3">Batch</th>
                  <th className="px-5 py-3">Produksi</th>
                  <th className="px-5 py-3">Expired</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Scan</th>
                  <th className="px-5 py-3">Terakhir</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr className="border-t border-navy-100" key={product.id}>
                    <td className="px-5 py-4 font-bold text-navy-900">{product.serial_number}</td>
                    <td className="px-5 py-4">{product.pin_code}</td>
                    <td className="px-5 py-4">{product.product_name}</td>
                    <td className="px-5 py-4">{product.batch_code}</td>
                    <td className="px-5 py-4">{formatDate(product.production_date)}</td>
                    <td className="px-5 py-4">{formatDate(product.expired_date)}</td>
                    <td className="px-5 py-4">{product.status}</td>
                    <td className="px-5 py-4 font-bold">{product.scan_count}</td>
                    <td className="px-5 py-4">{formatDateTime(product.last_scan_at)}</td>
                  </tr>
                ))}
                {!products.length ? (
                  <tr>
                    <td className="px-5 py-5 text-slate-500" colSpan={9}>
                      Belum ada data produk.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </section>
      </section>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="panel p-5">
      <p className="text-sm font-bold text-slate-500">{label}</p>
      <p className="mt-2 text-3xl font-black text-navy-900">{value.toLocaleString("id-ID")}</p>
    </div>
  );
}
