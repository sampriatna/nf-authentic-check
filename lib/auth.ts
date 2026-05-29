import { cookies } from "next/headers";

const cookieName = "nf_admin_session";

// Admin password - hardcoded for testing
const ADMIN_PASSWORD = "tukgumer123";

function getAdminPassword() {
  // Use hardcoded password or env var if available
  return (process.env.ADMIN_PASSWORD || ADMIN_PASSWORD).toLowerCase().trim();
}

export function isAdminLoggedIn() {
  try {
    const cookieStore = cookies();
    return cookieStore.get(cookieName)?.value === "active";
  } catch (err) {
    // If cookies are not available (e.g., in some RSC contexts), return false
    console.log("[v0] Auth: Cookies not available, returning false");
    return false;
  }
}

export function loginAdmin(password: string) {
  const inputPassword = password.toLowerCase().trim();
  const correctPassword = getAdminPassword();
  
  if (inputPassword !== correctPassword) return false;

  try {
    const cookieStore = cookies();
    cookieStore.set(cookieName, "active", {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 8
    });
  } catch (err) {
    console.error("[v0] Auth: Failed to set cookie", err);
    return false;
  }

  return true;
}

export function logoutAdmin() {
  try {
    const cookieStore = cookies();
    cookieStore.delete(cookieName);
  } catch (err) {
    console.error("[v0] Auth: Failed to delete cookie", err);
  }
}
