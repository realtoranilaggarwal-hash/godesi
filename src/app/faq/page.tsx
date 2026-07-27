import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/LegalPage";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "FAQ",
  description:
    "What Godesi is, why to use it, and how listings, leads, tickets, ads, points and claims work.",
};

const FAQS: { q: string; a: React.ReactNode }[] = [
  {
    q: "What is Godesi?",
    a: (
      <>
        A desi marketplace and directory in one: business and professional listings,
        buyer requirements (leads), community events with online tickets, real estate
        and rooms, wedding services, temples and daily news.
      </>
    ),
  },
  {
    q: "Why should I list my business here?",
    a: (
      <>
        A free, shareable profile page with your gallery, a QR code and a WhatsApp
        button, plus access to buyers posting requirements in your category. Customers
        contact you directly — nothing is routed through us.{" "}
        <Link href="/signup">List free</Link>.
      </>
    ),
  },
  {
    q: "Is it really free?",
    a: (
      <>
        Yes. A Free listing includes your profile, 5 images, QR code and WhatsApp
        button. Paid plans add up to 20 images, visible phone and email, a Featured
        badge and higher ranking — see <Link href="/pricing">pricing</Link>.
      </>
    ),
  },
  {
    q: "How do leads work?",
    a: (
      <>
        Customers post what they need with a budget and city. Premium members can
        unlock the contact details and respond.{" "}
        <Link href="/leads">Browse requirements</Link> or{" "}
        <Link href="/leads/new">post one</Link>.
      </>
    ),
  },
  {
    q: "Can I sell event tickets?",
    a: (
      <>
        Yes — post your event, set the price, currency and seats, and buyers pay by
        card. Each ticket gets a QR code you can scan at the door, and buyers get an
        email confirmation. <Link href="/events/new">Post an event</Link>.
      </>
    ),
  },
  {
    q: "I found my business already listed. How do I take it over?",
    a: (
      <>
        Open the listing and use “Is this your business? Claim it”. Our team checks the
        claim, and once approved the listing is yours to edit, with images, packages and
        contact details.
      </>
    ),
  },
  {
    q: "Where does your data come from?",
    a: (
      <>
        From the businesses and community themselves, plus basic starter listings that
        owners can claim. We do not scrape other directories. Places of worship include
        a small openly licensed set from OpenStreetMap contributors.
      </>
    ),
  },
  {
    q: "How do the reward points work?",
    a: (
      <>
        Share your referral link and earn points when people join and become active —
        then spend them on banner ads, a Featured listing, promotions or a month of
        Pro. See <Link href="/dashboard/rewards">Refer &amp; earn</Link>.
      </>
    ),
  },
  {
    q: "How do I advertise?",
    a: (
      <>
        Buy a sidebar (300×250), skyscraper (160×600) or header banner monthly, upload
        your creative and watch impressions, clicks and CTR in your dashboard.{" "}
        <Link href="/advertise">Advertise on Godesi</Link>.
      </>
    ),
  },
  {
    q: "Which countries and currencies do you support?",
    a: (
      <>
        Godesi is global. Prices are shown in US dollars for visitors in the USA and in
        rupees in India, and posters can pick the currency they charge in.
      </>
    ),
  },
  {
    q: "How do I remove my listing or data?",
    a: (
      <>
        Email <a href={`mailto:${SITE.supportEmail}`}>{SITE.supportEmail}</a> from your
        account address and we will delete it. See our{" "}
        <Link href="/privacy">privacy policy</Link>.
      </>
    ),
  },
];

export default function FaqPage() {
  return (
    <LegalPage title="Frequently asked questions">
      <p>
        Everything Godesi does, and why it is worth listing. Still stuck? Write to{" "}
        <a href={`mailto:${SITE.supportEmail}`}>{SITE.supportEmail}</a>.
      </p>

      {FAQS.map((faq) => (
        <div key={faq.q}>
          <h2>{faq.q}</h2>
          <p>{faq.a}</p>
        </div>
      ))}
    </LegalPage>
  );
}
