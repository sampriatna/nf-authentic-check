import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Download, FileArchive, FileText, LogOut, Search, ShieldCheck } from "lucide-react";
import { logoutAction } from "@/app/actions";
import { AuthenticatorActions } from "@/components/AuthenticatorActions";
import { AuthenticatorGeneratorForm } from "@/components/AuthenticatorGeneratorForm";
import { isAdminLoggedIn } from "@/lib/auth";
import { getAuthenticatorCodes } from "@/lib/authenticator";
import { formatDateTime } from "@/lib/format";

type PageProps = {
  searchParams?: {
    product?: string;
    batch?: string;
    status?: string;
  };
};

export default async function AuthenticatorAdminPage({ searchParams }: PageProps) {
  if (!isAdminLoggedIn()) redirect("/admin/login");

  const codes = await getAuthenticatorCodes(searchParams);
  const totalScans = codes.reduce((sum, code) => sum + code.scan_count, 0);
  const repeated = codes.filter((code) => code.scan_count > 1).length;
  const query = new URLSearchParams();

  if (searchParams?.product) query.set("product", searchParams.product);
  if (searchParams?.batch) query.set("batch", searchParams.batch);
  if (searchParams?.status) query.set("status", searchParams.status);

  const queryString = query.toString();

  return (
    <main className="min-h-screen">
      <header className="bg-navy-900 text-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-5 py-6 md:flex-row md:items-center md:justify-between md:px-8">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 text-sm font-bold text-gold-400">
              <ShieldCheck className="h-4 w-4" />
              Nusa Fishing Authenticator
            </div>
            <h1 className="text-3xl font-black">Generator Kode QR</h1>
            <p className="mt-2 max-w-xl text-sm leading-6 text-navy-100">
              Buat kode QR massal untuk cek-dev/cek.nusafishing.com. Website utama nusafishing.com terpisah.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link className="btn-secondary border-white/20 bg-white/10 text-white hover:bg-white hover:text-navy-900" href="/admin">
              Admin Serial
            </Link>
            <Link className="btn-secondary border-white/20 bg-white/10 text-white hover:bg-white hover:text-navy-900" href="/">
              Portal Cek
            </Link>
            <a className="btn-secondary border-white/20 bg-white/10 text-white hover:bg-white hover:text-navy-900" href="/admin/authenticator/export">
              <Download className="h-4 w-4" />
              Export CSV
            </a>
            <a
              className="btn-secondary border-white/20 bg-white/10 text-white hover:bg-white hover:text-navy-900"
              href={`/admin/authenticator/qr-zip${queryString ? `?${queryString}` : ""}`}
            >
              <FileArchive className="h-4 w-4" />
              Download QR ZIP
            </a>
            <a className="btn-secondary border-white/20 bg-white/10 text-white hover:bg-white hover:text-navy-900" href="/admin/authenticator/labels" target="_blank">
              <FileText className="h-4 w-4" />
              Export PDF
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
          <Stat label="Total Kode" value={codes.length} />
          <Stat label="Total Scan" value={totalScans} />
          <Stat label="Scan Berulang" value={repeated} />
        </div>

        <div className="mt-6">
          <AuthenticatorGeneratorForm />
        </div>

        <section className="panel mt-6 overflow-hidden">
          <div className="border-b border-navy-100 p-5">
            <h2 className="text-lg font-black text-navy-900">Daftar Kode Authenticator</h2>
            <p className="mt-1 text-sm text-slate-500">Filter berdasarkan produk, batch, dan status.</p>
            <form className="mt-4 grid gap-3 md:grid-cols-[1fr_1fr_180px_auto]">
              <input className="field" defaultValue={searchParams?.product || ""} name="product" placeholder="Filter produk" />
              <input className="field" defaultValue={searchParams?.batch || ""} name="batch" placeholder="Filter batch" />
              <select className="field" defaultValue={searchParams?.status || ""} name="status">
                <option value="">Semua status</option>
                <option value="active">active</option>
                <option value="blocked">blocked</option>
              </select>
              <button className="btn-primary" type="submit">
                <Search className="h-4 w-4" />
                Filter
              </button>
            </form>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[1120px] text-left text-sm">
              <thead className="bg-navy-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-5 py-3">Kode</th>
                  <th className="px-5 py-3">QR</th>
                  <th className="px-5 py-3">Produk</th>
                  <th className="px-5 py-3">Varian</th>
                  <th className="px-5 py-3">Batch</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Scan</th>
                  <th className="px-5 py-3">Scan Pertama</th>
                  <th className="px-5 py-3">Scan Terakhir</th>
                  <th className="px-5 py-3">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {codes.map((code) => (
                  <tr className="border-t border-navy-100 align-top" key={code.id}>
                    <td className="px-5 py-4 font-bold text-navy-900">{code.unique_code}</td>
                    <td className="px-5 py-4">
                      <Image
                        alt={`QR ${code.unique_code}`}
                        className="rounded border border-navy-100"
                        height={64}
                        src={`/api/qr/${encodeURIComponent(code.unique_code)}`}
                        unoptimized
                        width={64}
                      />
                    </td>
                    <td className="px-5 py-4">{code.product_name}</td>
                    <td className="px-5 py-4">{code.variant}</td>
                    <td className="px-5 py-4">{code.batch}</td>
                    <td className="px-5 py-4">{code.status}</td>
                    <td className="px-5 py-4 font-bold">{code.scan_count}</td>
                    <td className="px-5 py-4">{formatDateTime(code.first_scanned_at)}</td>
                    <td className="px-5 py-4">{formatDateTime(code.last_scanned_at)}</td>
                    <td className="px-5 py-4">
                      <AuthenticatorActions code={code.unique_code} qrUrl={code.qr_url} />
                    </td>
                  </tr>
                ))}
                {!codes.length ? (
                  <tr>
                    <td className="px-5 py-5 text-slate-500" colSpan={10}>
                      Belum ada kode. Generate kode pertama dari form di atas.
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
