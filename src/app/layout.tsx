import type { Metadata } from "next";
import Script from "next/script";
import { Inter } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { CookieConsent } from "@/components/CookieConsent";
import { AiChat } from "@/components/AiChat";
import { aiEnabled } from "@/lib/ai";
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
  const adsenseClient = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;

  return (
    <html lang="en">
      {adsenseClient ? (
        <head>
          <Script
            async
            crossOrigin="anonymous"
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseClient}`}
            strategy="afterInteractive"
          />
        </head>
      ) : null}
      <body className={`${inter.className} min-h-screen bg-slate-50 text-slate-900`}>
        <SiteHeader />
        <main className="mx-auto w-full max-w-7xl px-4 py-6">{children}</main>
        <SiteFooter />
        <CookieConsent />
        {aiEnabled() && <AiChat />}
      </body>
    </html>
  );
}
