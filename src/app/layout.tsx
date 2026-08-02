import type { Metadata } from "next";
import Script from "next/script";
import { Inter } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { LiveMediaPlayer } from "@/components/LiveMediaPlayer";
import { CookieConsent } from "@/components/CookieConsent";
import { GoogleTranslate } from "@/components/GoogleTranslate";
import { RewardsNudge } from "@/components/RewardsNudge";
import { LiveActivity } from "@/components/LiveActivity";
import { VisitorPinger } from "@/components/VisitorPinger";
import { AiChat } from "@/components/AiChat";
import { BackToTop } from "@/components/BackToTop";
import { UnregisterServiceWorkers } from "@/components/UnregisterServiceWorkers";
import { aiEnabled } from "@/lib/ai";
import { siteUrl } from "@/lib/format";
import { TELEGRAM_GROUP } from "@/lib/site";

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
    images: [{ url: "/og-godesi.jpg", width: 1200, height: 630 }],
  },
  twitter: { card: "summary_large_image" },
  verification: {
    other: { "msvalidate.01": "9AC0C1E8C5BEEC4E0EF93C0575F608AE" },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const adsenseClient = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;
  const umamiId = process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID;
  const umamiSrc =
    process.env.NEXT_PUBLIC_UMAMI_SRC ?? "https://cloud.umami.is/script.js";

  return (
    <html lang="en" className="overflow-x-hidden">
      {adsenseClient || umamiId ? (
        <head>
          {adsenseClient ? (
            <Script
              async
              crossOrigin="anonymous"
              src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseClient}`}
              strategy="afterInteractive"
            />
          ) : null}
          {umamiId ? (
            <Script
              defer
              src={umamiSrc}
              data-website-id={umamiId}
              strategy="afterInteractive"
            />
          ) : null}
        </head>
      ) : null}
      <body
        className={`${inter.className} min-h-screen overflow-x-hidden bg-slate-50 pb-20 text-slate-900 sm:pb-0`}
      >
        {/* Brand identity for Google: "Godesi" the directory, distinct from the
            other Desi brands, plus the search box shown under the result. */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify([
              {
                "@context": "https://schema.org",
                "@type": "Organization",
                name: "Godesi",
                alternateName: ["GoDesi.com", "Godesi.com"],
                url: siteUrl(),
                logo: `${siteUrl()}/logo-godesi.png`,
                description:
                  "Godesi is a desi directory and community marketplace: business listings, buyer requirements, events, jobs, news, live radio and TV.",
                address: {
                  "@type": "PostalAddress",
                  streetAddress: "1 Austin Avenue, Suite C",
                  addressLocality: "Iselin",
                  addressRegion: "NJ",
                  postalCode: "08830",
                  addressCountry: "US",
                },
                sameAs: [
                  "https://www.facebook.com/godesicom/",
                  "https://www.instagram.com/godesicom/",
                  "https://www.youtube.com/@Godesibiz",
                  "https://x.com/godesi",
                  "https://www.linkedin.com/company/100483662/",
                  TELEGRAM_GROUP,
                ],
              },
              {
                "@context": "https://schema.org",
                "@type": "WebSite",
                name: "Godesi",
                url: siteUrl(),
                potentialAction: {
                  "@type": "SearchAction",
                  target: {
                    "@type": "EntryPoint",
                    urlTemplate: `${siteUrl()}/find?q={search_term_string}`,
                  },
                  "query-input": "required name=search_term_string",
                },
              },
            ]),
          }}
        />
        <UnregisterServiceWorkers />
        <SiteHeader />
        <main className="mx-auto w-full max-w-7xl px-4 py-6">{children}</main>
        <SiteFooter />
        <LiveMediaPlayer />
        <CookieConsent />
        <RewardsNudge />
        <LiveActivity />
        <VisitorPinger />
        <GoogleTranslate />
        <BackToTop />
        {aiEnabled() && <AiChat />}
      </body>
    </html>
  );
}
