import { cookies } from "next/headers";

const cookieName = "nf_admin_session";

// Admin password - for production use environment variable ADMIN_PASSWORD
function getAdminPassword() {
  return process.env.ADMIN_PASSWORD || "@Tukgumer123";
}

export function isAdminLoggedIn() {
  return cookies().get(cookieName)?.value === "active";
}

export function loginAdmin(password: string) {
  if (password !== getAdminPassword()) return false;

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
