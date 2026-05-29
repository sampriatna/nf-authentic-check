import { cookies } from "next/headers";

const cookieName = "nf_admin_session";

// Admin password - hardcoded for testing
const ADMIN_PASSWORD = "tukgumer123";

function getAdminPassword() {
  // Use hardcoded password or env var if available
  return (process.env.ADMIN_PASSWORD || ADMIN_PASSWORD).toLowerCase().trim();
}

export function isAdminLoggedIn() {
  return cookies().get(cookieName)?.value === "active";
}

export function loginAdmin(password: string) {
  const inputPassword = password.toLowerCase().trim();
  const correctPassword = getAdminPassword();
  
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
