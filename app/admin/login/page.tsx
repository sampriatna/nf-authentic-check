import { redirect } from "next/navigation";
import { isAdminLoggedIn } from "@/lib/auth";
import { LoginForm } from "@/components/LoginForm";

export default function AdminLoginPage() {
  if (isAdminLoggedIn()) redirect("/admin");

  return (
    <main className="flex min-h-screen items-center justify-center px-5 py-10">
      <LoginForm />
    </main>
  );
}
