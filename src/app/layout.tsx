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
    default: "Godesi — The desi directory for businesses, leads, events & news",
    template: "%s | Godesi",
  },
  description:
    "Godesi is a multi-category desi directory: business listings with QR cards and WhatsApp chat, buyer requirements, community events with online tickets and daily news.",
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
        <main className="mx-auto w-full max-w-7xl px-4 py-6">{children}</main>
        <footer className="mt-12 border-t border-slate-200 bg-white">
          <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-6 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
            <p>© {new Date().getFullYear()} Godesi</p>
            <div className="flex flex-wrap gap-4">
              <Link href="/categories">Categories</Link>
              <Link href="/search">Businesses</Link>
              <Link href="/leads">Leads</Link>
              <Link href="/events">Events</Link>
              <Link href="/news">News</Link>
              <Link href="/pricing">Pricing</Link>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
