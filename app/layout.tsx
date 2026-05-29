import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NF Authentic Check",
  description: "Sistem cek keaslian produk dengan serial number dan PIN."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
