import type { Metadata } from "next";
import { PrintButton } from "@/components/PrintButton";
import { WEBSITE_OFFER } from "@/lib/websiteOffer";

export const metadata: Metadata = {
  title: "GoDesi.com × New Year's Eve Gala — Exclusive Partner Packages",
  description:
    "Partner with GoDesi.com and the New Year's Eve Gala in Edison, NJ (~250 families): the $2,000 Platinum Partner package with a VIP table for 12, AI website and Wall of Fame bricks, the $500 Gold Partner package, and add-ons you can pick.",
  alternates: { canonical: "/partner-package" },
};

const GOLD = "#b8860b";

/** Prints only the flyer on one page: site chrome, side banners and widgets are hidden. */
const PRINT_CSS = `
  @media print {
    body > *:not(main) { display: none !important; }
    main > *:not(:has(#partner-package-flyer)) { display: none !important; }
    main > div > *:not(#partner-package-flyer) { display: none !important; }
    main { display: block !important; padding: 0 !important; margin: 0 !important; max-width: none !important; }
    html, body { background: #fff !important; padding: 0 !important; margin: 0 !important; min-height: 0 !important; height: auto !important; }
    #partner-package-flyer {
      max-width: none !important;
      font-size: 9.5pt;
      line-height: 1.25;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    #partner-package-flyer section, #partner-package-flyer tr { break-inside: avoid; }
    @page { size: letter; margin: 8mm; }
  }
`;

const PLATINUM: React.ReactNode[] = [
  <>
    <strong>VIP table for 12 guests</strong> ($1,500 value till Dec 15, then $2,500)
  </>,
  "Featured GoDesi business profile for 12 months, with video playlist",
  "320×100 side banner on GoDesi.com for 12 months",
  "GoDesi Elite interview + DesiWho'sWho listing",
  "Logo, photo & website on the event supporters banner",
  "Personalized table placard",
  "Personal 10% ticket discount code for your clients",
  "1 promo video (10 sec)",
  <>
    Complimentary AI-enabled, SEO-friendly website with chatbot, no storefront ($
    {WEBSITE_OFFER.customPriceUsd} value, hosting free year 1)
  </>,
];

const GOLD_BENEFITS = [
  "2 complimentary New Year's Eve tickets",
  "GoDesi Elite interview & feature",
  "GoDesi Elite membership + featured business profile",
  "DesiWho'sWho listing",
  "1 promo video (10 sec)",
  "320×100 side banner on GoDesi.com for 12 months",
  "AI-enabled, SEO-friendly business website (hosting free year 1)",
  "Name on the event supporters banner",
  "10% discount code for your clients",
  "10 Wall of Fame bricks",
];

const ADD_ONS: { item: React.ReactNode; price: string }[] = [
  { item: "AI website with storefront + chatbot", price: "$1,000" },
  { item: "Header leaderboard banner, 970×90, 12 months", price: "$912" },
  { item: "Homepage hero banner, 1200×150", price: "$179/mo" },
  { item: "Entrance standee", price: "$350" },
  { item: <>LED screen logo / clip*</>, price: "$500" },
  { item: "Extra AI promo videos", price: "$50 each" },
  {
    item: "QR-code gift items for ~250 families, with coupon + store raffle",
    price: "$500–750",
  },
  { item: "1,000 scratch cards", price: "$150–250" },
  { item: "Custom gobo / laser name projection", price: "$150–300" },
  { item: "Extra Wall of Fame bricks", price: "$10/brick" },
];

function Tick({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex gap-2">
      <span aria-hidden className="text-[#b8860b]">
        ◆
      </span>
      <span className="min-w-0">{children}</span>
    </li>
  );
}

function Box() {
  return (
    <span
      aria-hidden
      className="inline-block h-4 w-4 rounded-sm border-2 border-[#b8860b] bg-white align-middle print:h-3 print:w-3"
    />
  );
}

function Blank({ label }: { label: string }) {
  return (
    <span className="flex min-w-[10rem] flex-1 items-end gap-2">
      <span className="font-serif font-bold text-slate-800">{label}:</span>
      <span className="mb-1 min-w-0 flex-1 border-b border-slate-400" />
    </span>
  );
}

export default function PartnerPackagePage() {
  return (
    <div id="partner-package-flyer" className="mx-auto max-w-4xl space-y-4 print:space-y-2">
      <style dangerouslySetInnerHTML={{ __html: PRINT_CSS }} />

      <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
        <p className="text-sm text-slate-500">
          Share this page, or save it as a PDF to send on WhatsApp or email.
        </p>
        <PrintButton className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-bold text-white hover:bg-slate-800 print:hidden">
          🖨️ Print / Save as PDF
        </PrintButton>
      </div>

      <header
        className="rounded-2xl border-4 border-double bg-gradient-to-b from-amber-50 to-white p-6 text-center print:rounded-lg print:p-2"
        style={{ borderColor: GOLD }}
      >
        <p className="text-xs font-bold uppercase tracking-[0.3em]" style={{ color: GOLD }}>
          Edison, NJ · ~250 families
        </p>
        <h1 className="mt-2 break-words font-serif text-3xl font-bold leading-tight text-slate-900 sm:text-4xl print:text-2xl">
          GoDesi.com <span style={{ color: GOLD }}>×</span> New Year&apos;s Eve Gala
        </h1>
        <p className="mt-1 font-serif text-xl italic sm:text-2xl print:text-lg" style={{ color: GOLD }}>
          Exclusive Partner Packages
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-[3fr_2fr] print:grid-cols-[3fr_2fr] print:gap-2">
        <section
          className="flex min-w-0 flex-col overflow-hidden rounded-2xl border-2 bg-white print:rounded-lg"
          style={{ borderColor: GOLD }}
        >
          <div className="bg-slate-900 p-4 text-center text-white print:p-2">
            <h2 className="font-serif text-2xl font-bold tracking-wide print:text-lg">
              PLATINUM PARTNER
            </h2>
            <p className="font-serif text-3xl font-bold print:text-xl" style={{ color: GOLD }}>
              $2,000
            </p>
          </div>
          <div className="flex-1 space-y-3 p-4 text-sm text-slate-700 print:space-y-1.5 print:p-2 print:text-[9pt]">
            <ul className="space-y-1 print:space-y-0.5">
              {PLATINUM.map((benefit, i) => (
                <Tick key={i}>{benefit}</Tick>
              ))}
            </ul>
            <p className="rounded-lg border border-dashed bg-amber-50 p-3 print:p-1.5" style={{ borderColor: GOLD }}>
              <strong className="font-serif" style={{ color: GOLD }}>
                BONUS:
              </strong>{" "}
              <strong>80 permanent Wall of Fame bricks</strong> included ($10/brick, $800 value).
              The wall is ranked by bricks owned — more bricks = higher placement.
            </p>
          </div>
        </section>

        <section className="flex min-w-0 flex-col overflow-hidden rounded-2xl border-2 border-slate-300 bg-white print:rounded-lg">
          <div className="p-4 text-center print:p-2" style={{ backgroundColor: GOLD }}>
            <h2 className="font-serif text-2xl font-bold tracking-wide text-white print:text-lg">
              GOLD PARTNER
            </h2>
            <p className="font-serif text-3xl font-bold text-white print:text-xl">$500</p>
          </div>
          <ul className="flex-1 space-y-1 p-4 text-sm text-slate-700 print:space-y-0.5 print:p-2 print:text-[9pt]">
            {GOLD_BENEFITS.map((benefit) => (
              <Tick key={benefit}>{benefit}</Tick>
            ))}
          </ul>
        </section>
      </div>

      <section className="overflow-hidden rounded-2xl border-2 bg-white print:rounded-lg" style={{ borderColor: GOLD }}>
        <h2 className="border-b-2 bg-amber-50 px-4 py-2 font-serif text-xl font-bold text-slate-900 print:py-1 print:text-base" style={{ borderColor: GOLD }}>
          Add-Ons — <span className="italic" style={{ color: GOLD }}>pick what you want</span>
        </h2>
        <table className="w-full text-sm print:text-[9pt]">
          <thead>
            <tr className="border-b border-slate-200 text-left font-serif text-slate-600">
              <th className="w-10 px-3 py-1.5 text-center print:py-0">✓</th>
              <th className="px-2 py-1.5 print:py-0.5">Add-on</th>
              <th className="px-3 py-1.5 text-right print:py-0.5">Price</th>
            </tr>
          </thead>
          <tbody>
            {ADD_ONS.map((row, i) => (
              <tr key={i} className="border-b border-slate-100 odd:bg-slate-50/60">
                <td className="px-3 py-1.5 text-center print:py-0">
                  <Box />
                </td>
                <td className="min-w-0 break-words px-2 py-1.5 text-slate-800 print:py-0">{row.item}</td>
                <td className="whitespace-nowrap px-3 py-1.5 text-right font-bold text-slate-900 print:py-0">
                  {row.price}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot className="font-serif">
            <tr className="border-t-2 bg-amber-50" style={{ borderColor: GOLD }}>
              <td className="px-3 py-2 text-center print:py-1">
                <Box />
              </td>
              <td className="px-2 py-2 print:py-1">
                <strong>Core bundle</strong>{" "}
                <span className="font-sans text-xs text-slate-600 print:text-[8pt]">
                  Platinum + storefront + standee + scratch/QR gifts
                </span>
              </td>
              <td className="whitespace-nowrap px-3 py-2 text-right text-base font-bold print:py-1 print:text-[10pt]" style={{ color: GOLD }}>
                ~$3,500
              </td>
            </tr>
            <tr className="bg-amber-50">
              <td className="px-3 py-2 text-center print:py-1">
                <Box />
              </td>
              <td className="px-2 py-2 print:py-1">
                <strong>Full bundle</strong>{" "}
                <span className="font-sans text-xs text-slate-600 print:text-[8pt]">
                  Core + header banner or homepage hero
                </span>
              </td>
              <td className="whitespace-nowrap px-3 py-2 text-right text-base font-bold print:py-1 print:text-[10pt]" style={{ color: GOLD }}>
                ~$4,500–5,000
              </td>
            </tr>
          </tfoot>
        </table>
        <p className="px-4 py-2 text-xs text-slate-500 print:py-1 print:text-[7.5pt]">
          * LED screen placement is best-effort, only if a screen is secured for the venue. Website
          hosting is free for year 1, then ${WEBSITE_OFFER.monthlyUsd}/month.
        </p>
      </section>

      <footer className="rounded-2xl border-2 bg-white p-4 print:rounded-lg print:p-2" style={{ borderColor: GOLD }}>
        <div className="flex flex-wrap gap-x-6 gap-y-3 text-sm print:flex-nowrap print:gap-4 print:text-[9pt]">
          <Blank label="Name" />
          <Blank label="Phone" />
          <Blank label="Date" />
        </div>
        <p className="mt-3 text-center font-serif text-sm text-slate-600 print:mt-1.5">
          <strong className="text-lg print:text-base" style={{ color: GOLD }}>
            GoDesi.com
          </strong>{" "}
          · The desi community network
        </p>
      </footer>
    </div>
  );
}
