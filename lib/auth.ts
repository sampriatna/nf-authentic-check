import { cookies } from "next/headers";

const cookieName = "nf_admin_session";

// Admin password - for production use environment variable ADMIN_PASSWORD
function getAdminPassword() {
  const password = process.env.ADMIN_PASSWORD || "@Tukgumer123";
  return password.trim();
}

export function isAdminLoggedIn() {
  return cookies().get(cookieName)?.value === "active";
}

export function loginAdmin(password: string) {
  const inputPassword = password.trim();
  const correctPassword = getAdminPassword();
  console.log("[v0] Login - Input length:", inputPassword.length, "Expected length:", correctPassword.length);
  console.log("[v0] Match result:", inputPassword === correctPassword);
  
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
