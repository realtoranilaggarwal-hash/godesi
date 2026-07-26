import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import { SiteHeader } from "@/components/SiteHeader";
import { siteUrl } from "@/lib/format";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: {
    default: "Godesi — Digital business cards, QR codes & leads for small businesses",
    template: "%s | Godesi",
  },
  description:
    "Godesi gives small businesses a mobile-first digital business card with QR code, WhatsApp chat button, reviews and a lead marketplace.",
  openGraph: {
    type: "website",
    siteName: "Godesi",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen bg-slate-50 text-slate-900`}>
        <SiteHeader />
        <main className="mx-auto w-full max-w-6xl px-4 py-6">{children}</main>
        <footer className="mt-12 border-t border-slate-200 bg-white">
          <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-6 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
            <p>© {new Date().getFullYear()} Godesi</p>
            <div className="flex gap-4">
              <Link href="/search">Discover</Link>
              <Link href="/leads">Leads</Link>
              <Link href="/pricing">Pricing</Link>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
