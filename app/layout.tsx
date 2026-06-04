import type { Metadata } from "next";
import { SpeedInsights } from "@vercel/speed-insights/next";
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
    <html lang="id" className="scroll-smooth">
      <body className="min-h-screen bg-gradient-to-b from-sky-50 to-blue-50 text-navy-900">
        {children}
        <SpeedInsights />
      </body>
    </html>
  );
}
