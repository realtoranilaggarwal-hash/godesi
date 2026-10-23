import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { PrintButton } from "@/components/PrintButton";

export const metadata: Metadata = { title: "Print shop poster" };

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
    </div>
  );
}
