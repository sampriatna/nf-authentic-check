import { redirect } from "next/navigation";
import { isAdminLoggedIn } from "@/lib/auth";
import { AdminManagementClient } from "@/components/AdminManagementClient";

export default function AdminManagePage() {
  if (!isAdminLoggedIn()) {
    redirect("/admin/login");
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-sky-50 to-blue-50">
      <div className="mx-auto max-w-6xl px-5 py-8 md:px-8">
        <AdminManagementClient />
      </div>
    </main>
  );
}
