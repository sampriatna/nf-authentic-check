import { cookies } from "next/headers";

const cookieName = "nf_admin_session";

// Admin password - hardcoded for now, can use environment variable
const ADMIN_PASSWORD = "@Tukgumer123";

function getAdminPassword() {
  // Use hardcoded password or env var if available
  return process.env.ADMIN_PASSWORD || ADMIN_PASSWORD;
}

export function isAdminLoggedIn() {
  return cookies().get(cookieName)?.value === "active";
}

export function loginAdmin(password: string) {
  const inputPassword = password.trim();
  const correctPassword = getAdminPassword().trim();
  
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
