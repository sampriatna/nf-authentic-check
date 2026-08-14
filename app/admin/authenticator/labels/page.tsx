import Image from "next/image";
import { redirect } from "next/navigation";
import { PrintButton } from "@/components/PrintButton";
import { isAdminLoggedIn } from "@/lib/auth";
import { getAuthenticatorCodes } from "@/lib/authenticator";

export default async function AuthenticatorLabelsPage() {
  if (!isAdminLoggedIn()) redirect("/admin/login");

  const codes = await getAuthenticatorCodes();

  return (
    <main className="min-h-screen bg-white p-5 text-navy-900 print:p-0">
      <div className="mb-5 flex items-center justify-between print:hidden">
        <div>
          <h1 className="text-2xl font-black">Label QR Nusa Fishing</h1>
          <p className="text-sm text-slate-500">Gunakan tombol cetak browser lalu pilih Save as PDF.</p>
        </div>
        <PrintButton />
      </div>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 print:grid-cols-3 print:gap-0">
        {codes.map((code) => (
          <article className="break-inside-avoid border border-navy-100 p-4 text-center print:h-[64mm] print:border-slate-300 print:p-2" key={code.id}>
            <Image
              alt={`QR ${code.unique_code}`}
              className="mx-auto h-32 w-32 print:h-28 print:w-28"
              height={128}
              src={`/api/qr/${encodeURIComponent(code.unique_code)}`}
              unoptimized
              width={128}
            />
            <p className="mt-2 text-sm font-black">{code.unique_code}</p>
            <p className="mt-1 text-xs font-semibold">{code.product_name}</p>
            <p className="text-xs text-slate-500">{code.variant}</p>
            <p className="mt-2 text-xs font-bold text-navy-800">Scan untuk cek keaslian produk</p>
          </article>
        ))}
      </section>
    </main>
  );
}
