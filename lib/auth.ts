import { cookies } from "next/headers";
import { getAdminPassword } from "./supabase";

const cookieName = "nf_admin_session";

export function isAdminLoggedIn() {
  return cookies().get(cookieName)?.value === "active";
}

export function loginAdmin(password: string) {
  const inputPassword = password.toLowerCase().trim();
  const correctPassword = getAdminPassword().toLowerCase().trim();
  if (inputPassword !== correctPassword) return false;

  cookies().set(cookieName, "active", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 8
  });

  return true;
}

export function logoutAdmin() {
  cookies().delete(cookieName);
}
