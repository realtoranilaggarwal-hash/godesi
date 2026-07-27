import type { Metadata } from "next";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  AD_DURATIONS,
  AD_IMPRESSION_PACKS,
  AD_PLACEMENTS,
  AD_SLOT_ORDER,
  durationDiscount,
  formatAdImpressionPrice,
  formatAdPrice,
  formatCpm,
  packDiscount,
} from "@/lib/ads";
import { requestCurrency } from "@/lib/currency";
import { AdBookingForm } from "@/components/forms/AdBookingForm";
import { Alert, Card, LinkButton } from "@/components/ui";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Advertise on Godesi",
  description:
    "Reach desi buyers across the Godesi directory with header, sidebar and skyscraper banner placements.",
};

const ERRORS: Record<string, string> = {
  cancelled: "Checkout was cancelled — you have not been charged.",
  stripe_unavailable: "Card payments are not configured yet. Please email us.",
  stripe_session: "We could not start the checkout. Please try again.",
  coupon: "That coupon code is not valid for advertising.",
};

export default async function AdvertisePage({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  const [user, currency] = [await getCurrentUser(), requestCurrency()];

  const taken = await db.banner.groupBy({
    by: ["slot"],
    where: { status: "ACTIVE", active: true },
    _count: { _all: true },
  });
  const usedBySlot = new Map(taken.map((row) => [row.slot, row._count._all]));

  return (
    <div className="space-y-8">
      <section className="rounded-3xl bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 p-8 text-white">
        <p className="text-xs font-semibold uppercase tracking-widest text-white/80">
          Advertising
        </p>
        <h1 className="mt-2 text-3xl font-bold sm:text-4xl">Advertise on Godesi</h1>
        <p className="mt-3 max-w-2xl text-white/90">
          Put your brand in front of people actively looking for desi businesses,
          services, events and news. Choose a placement, upload your banner, and
          track impressions, clicks and CTR from your dashboard.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link
            href="#placements"
            className="rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-indigo-700 hover:bg-indigo-50"
          >
            See rates
          </Link>
          <Link
            href="/dashboard/ads"
            className="rounded-xl border border-white/70 px-5 py-2.5 text-sm font-semibold text-white hover:bg-white/10"
          >
            Advertiser dashboard
          </Link>
        </div>
      </section>

      {searchParams.error ? (
        <Alert>{ERRORS[searchParams.error] ?? "Something went wrong."}</Alert>
      ) : null}

      <section id="placements" className="grid gap-4 lg:grid-cols-3">
        {AD_SLOT_ORDER.map((slot) => {
          const placement = AD_PLACEMENTS[slot];
          const used = usedBySlot.get(slot) ?? 0;
          const available = Math.max(placement.slots - used, 0);

          return (
            <Card key={slot} className="flex flex-col">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-bold">{placement.name}</h2>
                  <p className="text-xs font-medium text-slate-500">
                    {placement.size.width} × {placement.size.height} px ·{" "}
                    {available} of {placement.slots} slots free
                  </p>
                </div>
              </div>

              <div
                className="mt-4 flex items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 text-xs font-semibold text-slate-400"
                style={{
                  aspectRatio: `${placement.size.width} / ${placement.size.height}`,
                }}
              >
                {placement.size.width} × {placement.size.height}
              </div>

              <p className="mt-4 text-sm text-slate-600">{placement.blurb}</p>

              <ul className="mt-3 space-y-1 text-sm text-slate-600">
                {placement.highlights.map((item) => (
                  <li key={item}>• {item}</li>
                ))}
              </ul>

              <div className="mt-4 rounded-xl bg-slate-50 p-3">
                <p className="text-2xl font-bold">
                  {formatAdPrice(placement, currency)}
                  <span className="text-sm font-medium text-slate-500"> / month</span>
                </p>
                <p className="text-xs text-slate-500">
                  or about {formatCpm(placement, currency)} per 1,000 impressions
                </p>
              </div>

              {user ? (
                <AdBookingForm
                  slot={slot}
                  durations={AD_DURATIONS.map((months) => {
                    const discount = durationDiscount(months);
                    return {
                      value: months,
                      label: `${months} month${months > 1 ? "s" : ""} — ${formatAdPrice(
                        placement,
                        currency,
                        months,
                      )}${discount ? ` (save ${Math.round(discount * 100)}%)` : ""}`,
                    };
                  })}
                  packs={AD_IMPRESSION_PACKS.map((impressions) => {
                    const discount = packDiscount(impressions);
                    return {
                      value: impressions,
                      label: `${impressions.toLocaleString()} views — ${formatAdImpressionPrice(
                        placement,
                        currency,
                        impressions,
                      )}${discount ? ` (save ${Math.round(discount * 100)}%)` : ""}`,
                    };
                  })}
                />
              ) : (
                <LinkButton
                  href={`/login?next=${encodeURIComponent("/advertise")}`}
                  className="mt-4 w-full"
                >
                  Sign in to buy
                </LinkButton>
              )}
            </Card>
          );
        })}
      </section>

      <Card>
        <h2 className="text-lg font-bold">How it works</h2>
        <ol className="mt-2 space-y-2 text-sm text-slate-600">
          <li>
            <strong>1. Book a slot.</strong> Pay monthly, or buy a pack of views and
            only pay for the impressions you get. Bigger bookings are discounted.
          </li>
          <li>
            <strong>2. Upload your creative.</strong> Add your banner image and
            destination URL in the advertiser dashboard.
          </li>
          <li>
            <strong>3. We approve it.</strong> Our team checks the creative, assigns
            your slot and switches it live — usually within a day.
          </li>
          <li>
            <strong>4. Track performance.</strong> Impressions, clicks, CTR and days
            or views remaining are updated live in your dashboard. Banners sharing a
            slot rotate on every page view, and a views pack retires itself once it is
            fully delivered.
          </li>
        </ol>
        <p className="mt-3 text-xs text-slate-500">
          Ads must follow our{" "}
          <Link href="/terms" className="text-indigo-600 underline">
            terms
          </Link>
          . We do not accept adult, gambling or misleading financial creatives.
        </p>
      </Card>
    </div>
  );
}
