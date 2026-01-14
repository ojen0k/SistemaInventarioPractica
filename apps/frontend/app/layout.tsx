import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import { TopNav } from "./components/TopNav";
import { AutoLogout } from "./components/AutoLogout";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Sistema Inventario",
  description: "MVP del front",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>
        <div className="min-h-screen">
          <AutoLogout />
          <header className="border-b">
            <div className="mx-auto max-w-5xl px-4 py-4 flex items-center justify-between">
              <div className="font-semibold">Sistema Inventario</div>
              <TopNav />
            </div>
          </header>

          <main className="mx-auto max-w-5xl px-4 py-6">{children}</main>
        </div>
      </body>
    </html>
  );
}
