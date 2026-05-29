import Link from "next/link";
import { redirect } from "next/navigation";
import { Download, Eye, Fish, LogOut, MapPin, Trash2, ShieldAlert, ShieldCheck, Store, TrendingUp, Users, Lock } from "lucide-react";
import { logoutAction, blockSuspiciousProductAction, deleteSuspiciousProductAction } from "@/app/actions";
import { AddProductForm, ImportCsvForm } from "@/components/AdminForms";
import { isAdminLoggedIn } from "@/lib/auth";
import { formatDate, formatDateTime } from "@/lib/format";
import { getDashboardStats, getLeadsDashboardStats } from "@/lib/products";

export default async function AdminPage() {
  if (!isAdminLoggedIn()) redirect("/admin/login");

  let dashboardData: any = null;
  let leadsStats: any = null;
  let error: string | null = null;

  try {
    dashboardData = await getDashboardStats();
    leadsStats = await getLeadsDashboardStats();
  } catch (err) {
    error = err instanceof Error ? err.message : "Error loading dashboard data";
    console.error("[v0] Dashboard error:", error);
  }

  const { products = [], suspicious = [], suspiciousCount = 0, totalProducts = 0, totalScans = 0 } = dashboardData || {};

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
        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4">
            <p className="text-sm text-red-800">
              <strong>Konfigurasi Supabase diperlukan:</strong> {error}
            </p>
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-3">
          <Stat label="Total Serial" value={totalProducts} />
          <Stat label="Total Scan" value={totalScans} />
          <Stat label="Kode Mencurigakan" value={suspiciousCount} />
        </div>

        {leadsStats && (
          <div className="panel mt-6 overflow-hidden">
            <div className="flex items-center justify-between border-b border-navy-100 p-5">
              <div>
                <h2 className="text-lg font-black text-navy-900">Statistik Customer Leads</h2>
                <p className="text-sm text-slate-500">Data dari form klaim ebook produk terverifikasi.</p>
              </div>
              <TrendingUp className="h-6 w-6 text-gold-600" />
            </div>
            <div className="grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard 
                icon={<TrendingUp className="h-5 w-5 text-emerald-600" />}
                label="Scan Hari Ini" 
                value={leadsStats.scansToday} 
                color="emerald"
              />
              <StatCard 
                icon={<TrendingUp className="h-5 w-5 text-blue-600" />}
                label="Scan Bulan Ini" 
                value={leadsStats.scansThisMonth} 
                color="blue"
              />
              <StatCard 
                icon={<ShieldCheck className="h-5 w-5 text-navy-600" />}
                label="Produk Terbanyak" 
                value={leadsStats.topProduct || "-"} 
                isText
              />
              <StatCard 
                icon={<MapPin className="h-5 w-5 text-red-600" />}
                label="Kota Terbanyak" 
                value={leadsStats.topCity || "-"} 
                isText
              />
            </div>
            <div className="grid gap-4 border-t border-navy-100 p-5 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard 
                icon={<Store className="h-5 w-5 text-purple-600" />}
                label="Jumlah Reseller" 
                value={leadsStats.resellerCount} 
                color="purple"
              />
              <StatCard 
                icon={<Store className="h-5 w-5 text-orange-600" />}
                label="Toko Pancing" 
                value={leadsStats.tokoPancingCount} 
                color="orange"
              />
              <StatCard 
                icon={<Fish className="h-5 w-5 text-gold-600" />}
                label="Pemancing Ikan Mas" 
                value={leadsStats.pemancingMasCount} 
                color="gold"
              />
              <StatCard 
                icon={<Fish className="h-5 w-5 text-slate-600" />}
                label="Pemancing Lele" 
                value={leadsStats.pemancingLeleCount} 
                color="slate"
              />
            </div>
          </div>
        )}

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
                  <th className="px-5 py-3">Aksi</th>
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
                      <td className="px-5 py-4">
                        <div className="flex gap-2">
                          <form action={blockSuspiciousProductAction} onSubmit={(e) => {
                            if (!confirm("Block kode ini? Kode tidak akan bisa dicek lagi.")) e.preventDefault();
                          }}>
                            <input type="hidden" name="product_id" value={product.id} />
                            <button 
                              type="submit" 
                              className="inline-flex items-center gap-1 rounded bg-orange-100 px-2.5 py-1.5 text-xs font-bold text-orange-700 hover:bg-orange-200"
                            >
                              <Lock className="h-3.5 w-3.5" />
                              Block
                            </button>
                          </form>
                          <form action={deleteSuspiciousProductAction} onSubmit={(e) => {
                            if (!confirm("Hapus kode ini? Tindakan tidak dapat dibatalkan.")) e.preventDefault();
                          }}>
                            <input type="hidden" name="product_id" value={product.id} />
                            <button 
                              type="submit" 
                              className="inline-flex items-center gap-1 rounded bg-red-100 px-2.5 py-1.5 text-xs font-bold text-red-700 hover:bg-red-200"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              Hapus
                            </button>
                          </form>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className="px-5 py-5 text-slate-500" colSpan={7}>
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

type StatCardProps = {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  color?: "emerald" | "blue" | "purple" | "orange" | "gold" | "slate" | "red";
  isText?: boolean;
};

function StatCard({ icon, label, value, color = "slate", isText = false }: StatCardProps) {
  const colorClasses = {
    emerald: "bg-emerald-50 border-emerald-100",
    blue: "bg-blue-50 border-blue-100",
    purple: "bg-purple-50 border-purple-100",
    orange: "bg-orange-50 border-orange-100",
    gold: "bg-gold-50 border-gold-200",
    slate: "bg-slate-50 border-slate-100",
    red: "bg-red-50 border-red-100"
  };

  return (
    <div className={`rounded-lg border p-4 ${colorClasses[color]}`}>
      <div className="flex items-center gap-2">
        {icon}
        <p className="text-xs font-bold uppercase tracking-wide text-slate-500">{label}</p>
      </div>
      <p className={`mt-2 ${isText ? "text-lg" : "text-2xl"} font-black text-navy-900`}>
        {typeof value === "number" ? value.toLocaleString("id-ID") : value}
      </p>
    </div>
  );
}
