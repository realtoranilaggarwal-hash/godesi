import type { Metadata } from "next";
import Script from "next/script";
import { Inter } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/components/SiteHeader";
import { FeaturedOfferBar } from "@/components/FeaturedOfferBar";
import { SiteTicker } from "@/components/SiteTicker";
import { SiteFooter } from "@/components/SiteFooter";
import { PhoneSmallBanners, SmallBanners } from "@/components/Banners";
import { LiveMediaPlayer } from "@/components/LiveMediaPlayer";
import { CookieConsent } from "@/components/CookieConsent";
import { GoogleTranslate } from "@/components/GoogleTranslate";
import { RewardsNudge } from "@/components/RewardsNudge";
import { LiveActivity } from "@/components/LiveActivity";
import { AiChat } from "@/components/AiChat";
import { BackToTop } from "@/components/BackToTop";
import { SpinWheel } from "@/components/SpinWheel";
import { UnregisterServiceWorkers } from "@/components/UnregisterServiceWorkers";
import { QuoraSignupEvent } from "@/components/QuoraSignupEvent";
import { aiEnabled } from "@/lib/ai";
import { currentUserId } from "@/lib/auth";
import { siteUrl } from "@/lib/format";
import { TELEGRAM_GROUP } from "@/lib/site";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: {
    default: "GoDesi.com — Desi business directory, events, deals & community",
    template: "%s | GoDesi",
  },
  description:
    "GoDesi.com is the desi community platform: business directory with QR cards and WhatsApp chat, buyer requirements, events with tickets, deals, courses, news and the Wall of Fame.",
  alternates: { types: { "application/rss+xml": "/feed.xml" } },
  openGraph: {
    type: "website",
    siteName: "GoDesi.com",
    images: [{ url: "/og-godesi.jpg", width: 1200, height: 630 }],
  },
  twitter: { card: "summary_large_image" },
  verification: {
    other: {
      "msvalidate.01": "9AC0C1E8C5BEEC4E0EF93C0575F608AE",
      // Impact.com — proves site ownership for the affiliate partnerships.
      "impact-site-verification": "b1bd1fb0-8d97-492f-9688-4ce75f5da2c6",
      "fo-verify": "9984ba14-93d9-4671-bf88-535ec243d5e1",
    },
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const signedInId = await currentUserId();
  const adsenseClient = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;
  const umamiId = process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID;
  const umamiSrc =
    process.env.NEXT_PUBLIC_UMAMI_SRC ?? "https://cloud.umami.is/script.js";
  const gaId = process.env.NEXT_PUBLIC_GA_ID;
  const clarityId = process.env.NEXT_PUBLIC_CLARITY_ID;
  const quoraPixel =
    process.env.NEXT_PUBLIC_QUORA_PIXEL_ID ??
    "e1f78f6226a74980abda723156b819ed";

  return (
    <html lang="en" className="overflow-x-hidden">
      <head>
          {adsenseClient ? (
            /* Plain script tag so AdSense's site verifier finds it in the
               raw HTML (next/script injects after hydration). */
            /* eslint-disable-next-line @next/next/no-sync-scripts */
            <script
              async
              crossOrigin="anonymous"
              src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseClient}`}
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
          {gaId ? (
            <>
              <Script
                async
                src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
                strategy="afterInteractive"
              />
              <Script
                id="ga4"
                strategy="afterInteractive"
                dangerouslySetInnerHTML={{
                  __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config',${JSON.stringify(gaId)});`,
                }}
              />
            </>
          ) : null}
          {/* Microsoft Clarity: heatmaps and session replay of the layout. */}
          {clarityId ? (
            <Script
              id="clarity"
              strategy="afterInteractive"
              dangerouslySetInnerHTML={{
                __html: `(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);})(window,document,"clarity","script",${JSON.stringify(clarityId)});`,
              }}
            />
          ) : null}
          {/* Quora Pixel: conversion tracking for Quora ads and the GoDesi Space. */}
          {quoraPixel ? (
            <>
              <Script
                id="quora-pixel"
                strategy="afterInteractive"
                dangerouslySetInnerHTML={{
                  __html: `!function(q,e,v,n,t,s){if(q.qp) return; n=q.qp=function(){n.qp?n.qp.apply(n,arguments):n.queue.push(arguments);}; n.queue=[];t=document.createElement(e);t.async=!0;t.src=v; s=document.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t,s);}(window, 'script', 'https://a.quora.com/qevents.js');qp('init', ${JSON.stringify(quoraPixel)});qp('track', 'ViewContent');`,
                }}
              />
              <noscript>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  height="1"
                  width="1"
                  style={{ display: "none" }}
                  alt=""
                  src={`https://q.quora.com/_/ad/${quoraPixel}/pixel?tag=ViewContent&noscript=1`}
                />
              </noscript>
            </>
          ) : null}
          {/* Travelpayouts Drive: turns travel links into partner links and verifies the site. */}
          <Script
            id="travelpayouts-drive"
            strategy="afterInteractive"
            src="https://emrldco.com/NTg3NTE5.js?t=587519"
            data-cmp-ab="2"
          />
          {/* Google Reader Revenue Manager (swg-basic): enables the GoDesi
              publication's newsletter/reader CTAs and is required for Google
              News Publisher Center review. Plain script tags (not next/script)
              so Google's verifier sees them in the raw HTML. */}
          {/* eslint-disable-next-line @next/next/no-sync-scripts */}
          <script
            async
            type="application/javascript"
            src="https://news.google.com/swg/js/v1/swg-basic.js"
          />
          <script
            dangerouslySetInnerHTML={{
              __html: `(self.SWG_BASIC = self.SWG_BASIC || []).push(function(basicSubscriptions){ basicSubscriptions.init({ type: "NewsArticle", isPartOfType: ["Product"], isPartOfProductId: "CAownJDiCw:openaccess", clientOptions: { theme: "light", lang: "en" } }); });`,
            }}
          />
        </head>
      <body
        className={`${inter.variable} ${inter.className} min-h-screen bg-slate-50 pb-20 text-slate-900 sm:pb-0`}
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
        <FeaturedOfferBar />
        <SiteTicker />
        <main className="mx-auto flex w-full max-w-screen-2xl gap-6 px-4 py-6">
          <SmallBanners side="left" start={10} />
          <div className="min-w-0 flex-1">
            {children}
            <PhoneSmallBanners />
          </div>
          <SmallBanners />
        </main>
        <SiteFooter />
        <QuoraSignupEvent />
        <LiveMediaPlayer signedIn={Boolean(signedInId)} />
        <CookieConsent />
        <RewardsNudge />
        <LiveActivity />
        <GoogleTranslate />
        <BackToTop />
        <SpinWheel />
        {aiEnabled() && <AiChat />}
      </body>
    </html>
  );
}
