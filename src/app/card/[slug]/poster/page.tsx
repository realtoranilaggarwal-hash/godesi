import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { PrintButton } from "@/components/PrintButton";
import {
  amazonSearchUrl,
  ebaySearchUrl,
  shopConfig,
} from "@/lib/shop";

export const metadata: Metadata = { title: "Print shop poster" };

const PRINT_SEARCHES = [
  { label: "Flyer / poster printing", query: "custom flyer printing service" },
  { label: "Business cards", query: "business card printing 500" },
  { label: "Vinyl banners", query: "custom vinyl banner printing" },
] as const;

export default async function CardPosterPage({
  params,
}: {
  params: { slug: string };
}) {
  const business = await db.business.findUnique({
    where: { slug: params.slug },
    select: {
      slug: true,
      name: true,
      status: true,
      category: true,
      city: true,
      state: true,
      logoUrl: true,
      referralOffer: true,
    },
  });
  if (!business || business.status !== "APPROVED") notFound();

  const { amazonTag, ebayCampaignId } = shopConfig();

  return (
    <div className="mx-auto max-w-lg space-y-4 px-4 py-6">
      {/* Print only the poster — site chrome hides via the style block below. */}
      <style>{`
        @media print {
          header, footer, nav, .no-print { display: none !important; }
          main { padding: 0 !important; max-width: none !important; }
          body { background: #fff !important; }
          @page { margin: 8mm; }
        }
      `}</style>

      <div className="no-print flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold">Shop poster</h1>
          <p className="text-sm text-slate-600">
            Print this, cut along the dashed edge and tape it at your counter —
            customers scan the QR to open your card{business.referralOffer ? " and see your deal" : ""}.
          </p>
        </div>
        <PrintButton className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-bold text-white hover:bg-slate-800 print:hidden">
          🖨️ Print / save as PDF
        </PrintButton>
      </div>
      <p className="no-print text-xs text-slate-500">
        <Link href={`/b/${business.slug}`} className="underline">
          ← Back to the card
        </Link>
      </p>

      {/* The printable poster */}
      <div className="rounded-xl border-4 border-dashed border-slate-300 bg-white p-6 text-center">
        <div className="rounded-lg bg-gradient-to-r from-orange-500 via-rose-600 to-fuchsia-600 px-4 py-2">
          <span className="text-sm font-extrabold uppercase tracking-widest text-white">
            Scan for my digital card
          </span>
        </div>

        <div className="mt-5 flex items-center justify-center gap-3">
          {business.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={business.logoUrl}
              alt=""
              className="h-14 w-14 rounded-xl border border-slate-200 object-cover"
            />
          ) : null}
          <div className="text-left">
            <p className="text-2xl font-extrabold leading-tight text-slate-900">
              {business.name}
            </p>
            <p className="text-sm font-semibold text-slate-600">
              {business.category}
              {business.city ? ` · ${business.city}` : ""}
              {business.state ? `, ${business.state}` : ""}
            </p>
          </div>
        </div>

        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`/api/qr/${business.slug}?card=1`}
          alt={`QR code for ${business.name}`}
          className="mx-auto mt-5 w-64 max-w-full"
        />

        {business.referralOffer ? (
          <div className="mx-auto mt-5 max-w-sm rounded-xl border-2 border-amber-400 bg-amber-50 px-4 py-3">
            <p className="text-[11px] font-bold uppercase tracking-widest text-amber-700">
              Mention GoDesi &amp; get
            </p>
            <p className="mt-1 text-lg font-extrabold text-slate-900">
              {business.referralOffer}
            </p>
          </div>
        ) : null}

        <p className="mt-5 text-base font-bold text-slate-900">
          godesi.com/b/{business.slug}
        </p>
        <p className="mt-1 text-xs text-slate-500">
          Call · WhatsApp · Save contact · Share your details — all from the card
        </p>
      </div>

      {/* Order prints online — affiliate links, hidden when printing */}
      {amazonTag || ebayCampaignId ? (
        <div className="no-print rounded-xl border border-slate-200 bg-slate-50 p-4">
          <h2 className="text-sm font-bold text-slate-900">
            🛒 No printer? Order prints online
          </h2>
          <p className="mt-0.5 text-xs text-slate-500">
            Flyers, cards and banners delivered to the shop.
          </p>
          <div className="mt-3 space-y-2">
            {PRINT_SEARCHES.map((shelf) => (
              <div key={shelf.label} className="flex items-center gap-2">
                <span className="w-32 shrink-0 text-xs font-semibold text-slate-700">
                  {shelf.label}
                </span>
                {amazonTag ? (
                  <a
                    href={amazonSearchUrl(shelf.query, amazonTag)}
                    target="_blank"
                    rel="noopener noreferrer nofollow sponsored"
                    className="flex-1 rounded-lg bg-slate-900 px-2 py-1.5 text-center text-[11px] font-bold text-white hover:bg-slate-800"
                  >
                    Amazon
                  </a>
                ) : null}
                {ebayCampaignId ? (
                  <a
                    href={ebaySearchUrl(shelf.query, ebayCampaignId)}
                    target="_blank"
                    rel="noopener noreferrer nofollow sponsored"
                    className="flex-1 rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-center text-[11px] font-bold text-slate-700 hover:bg-slate-50"
                  >
                    eBay
                  </a>
                ) : null}
              </div>
            ))}
          </div>
          <p className="mt-3 text-[10px] text-slate-400">
            As an Amazon Associate, GoDesi earns from qualifying purchases. Other
            links may also earn us a commission — it keeps the cards free.
          </p>
        </div>
      ) : null}
    </div>
  );
}
