import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { startLocalFeatureCheckout } from "@/app/actions/localFeature";
import { NYE_2027_EVENT_SLUG } from "@/lib/nyeSponsorLevels";
import {
  LOCAL_FEATURE_MIN_USD,
  LOCAL_FEATURE_PRESETS_USD,
  findLocalFeatureBusiness,
} from "@/lib/localFeature";
import { Alert, Button, Card, inputClass } from "@/components/ui";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Feature your business on GoDesi for a year — pay what you want",
  robots: { index: false, follow: false },
};

export default async function LocalFeaturePage({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams: { paid?: string; error?: string };
}) {
  const business = await findLocalFeatureBusiness(params.slug);
  if (!business) notFound();
  const featured = business.featuredUntil && business.featuredUntil > new Date();

  return (
    <div className="mx-auto max-w-xl space-y-4">
      <h1 className="text-2xl font-black">
        {searchParams.paid ? "Thank you for supporting local!" : "Support local, get featured for a year"}
      </h1>
      <Card className="space-y-3">
        <p className="text-sm font-semibold text-slate-500">
          {business.city}, NJ
        </p>
        <p className="text-lg font-bold">
          <Link href={`/business/${business.slug}`} className="hover:text-indigo-600">
            {business.name}
          </Link>
        </p>
        {searchParams.paid ? (
          <p className="rounded-xl bg-green-50 p-3 text-sm font-semibold text-green-800">
            We received your payment. {business.name} will show as Featured on GoDesi for the next 12
            months, and a receipt is on its way to your email. Anil or the GoDesi team will be in touch
            about your QR sticker.
          </p>
        ) : (
          <>
            <p className="text-sm text-slate-600">
              GoDesi is throwing a grand{" "}
              <Link href={`/events/${NYE_2027_EVENT_SLUG}`} className="font-semibold text-indigo-600 underline">
                New Year&apos;s Eve party
              </Link>{" "}
              for the community, and we&apos;re asking local Indian businesses in Iselin and New Jersey to
              chip in. Pay whatever you like (from ${LOCAL_FEATURE_MIN_USD}) and for the first year we will:
            </p>
            <ul className="list-disc space-y-1 pl-5 text-sm text-slate-700">
              <li>Feature {business.name} on GoDesi, above the free listings, for 12 months</li>
              <li>Put an &quot;As seen on GoDesi.com&quot; QR sticker on your shop board or counter</li>
              <li>Thank you as a local supporter of the GoDesi New Year&apos;s Eve party</li>
            </ul>
            {featured ? (
              <p className="text-xs text-slate-500">
                Already featured — a new payment adds another year to the end of the current term.
              </p>
            ) : null}
            {searchParams.error ? (
              <Alert>Please enter at least ${LOCAL_FEATURE_MIN_USD}.</Alert>
            ) : null}
            <form action={startLocalFeatureCheckout} className="space-y-3">
              <input type="hidden" name="slug" value={business.slug} />
              <div className="flex flex-wrap gap-2">
                {LOCAL_FEATURE_PRESETS_USD.map((usd) => (
                  <button
                    key={usd}
                    type="submit"
                    name="preset"
                    value={usd}
                    className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-bold hover:border-indigo-500 hover:bg-indigo-50"
                  >
                    Pay ${usd}
                  </button>
                ))}
              </div>
              <label className="block text-sm font-semibold text-slate-700">
                Or any amount in US dollars (minimum ${LOCAL_FEATURE_MIN_USD})
                <input
                  type="number"
                  name="amount"
                  min={LOCAL_FEATURE_MIN_USD}
                  step="1"
                  defaultValue={51}
                  required
                  className={`${inputClass} mt-1`}
                />
              </label>
              <Button type="submit" className="w-full">
                Pay by card and feature {business.name}
              </Button>
            </form>
          </>
        )}
      </Card>
      <p className="text-center text-sm text-slate-500">
        Rather pay by Zelle or cash, or want a sticker visit first? Call or WhatsApp Anil at{" "}
        <a href="tel:+17329837958">(732) 983-7958</a>.
      </p>
    </div>
  );
}
