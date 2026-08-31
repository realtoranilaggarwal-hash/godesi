import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { BannerSlot } from "@prisma/client";
import {
  AD_PLACEMENTS,
  AD_SLOT_ORDER,
  formatAdPrice,
  formatCpm,
} from "@/lib/ads";
import { activeBanners, slotSoldCount } from "@/lib/banners";
import { requestCurrency } from "@/lib/currency";
import { getCurrentUser } from "@/lib/auth";
import { proxyImage } from "@/lib/proxyImage";
import { AdPreview } from "@/components/AdPreview";
import { PlacementMap } from "@/components/PlacementMap";
import { Alert, Card, LinkButton } from "@/components/ui";

export const dynamic = "force-dynamic";

function placementOf(value: string) {
  return AD_SLOT_ORDER.find((slot) => slot === value) ?? null;
}

export function generateMetadata({
  params,
}: {
  params: { slot: string };
}): Metadata {
  const slot = placementOf(params.slot.toUpperCase());
  if (!slot) return { title: "Banner spot" };

  const placement = AD_PLACEMENTS[slot];
  return {
    title: `Where the ${placement.name.toLowerCase()} shows on Godesi`,
    description: placement.blurb,
  };
}

export default async function PlacementPage({
  params,
}: {
  params: { slot: string };
}) {
  const slot: BannerSlot | null = placementOf(params.slot.toUpperCase());
  if (!slot) notFound();

  const placement = AD_PLACEMENTS[slot];
  const [user, currency, running, live] = await Promise.all([
    getCurrentUser(),
    requestCurrency(),
    slotSoldCount(slot),
    activeBanners(slot, 1),
  ]);

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <Link
          href="/advertise#placements"
          className="text-sm font-semibold text-indigo-600 hover:underline"
        >
          ← All banner spots
        </Link>
        <h1 className="mt-2 text-3xl font-bold">{placement.name}</h1>
        <p className="mt-1 text-sm font-medium text-slate-500">
          {placement.size.width} × {placement.size.height} px · {placement.slots}{" "}
          shown at a time ·{" "}
          {running
            ? `${running} advertiser${running > 1 ? "s" : ""} in rotation`
            : "no advertiser here yet"}
        </p>
        <p className="mt-3 text-slate-600">{placement.blurb}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <h2 className="text-lg font-bold">Where it sits on the page</h2>
          <p className="mb-3 mt-1 text-sm text-slate-600">
            The blue block is your banner.
          </p>
          <PlacementMap region={placement.region} />
        </Card>

        <Card>
          <h2 className="text-lg font-bold">What it looks like</h2>
          <p className="mb-3 mt-1 text-sm text-slate-600">
            {live[0]
              ? "Running here right now:"
              : `Your artwork, at ${placement.size.width} × ${placement.size.height}:`}
          </p>
          {live[0] ? (
            <div
              style={{
                aspectRatio: `${placement.size.width} / ${placement.size.height}`,
                maxWidth: placement.size.width,
              }}
              className="mx-auto overflow-hidden rounded-xl border border-slate-200"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={proxyImage(live[0].imageUrl)}
                alt={live[0].title}
                className="h-full w-full object-cover"
              />
            </div>
          ) : (
            <AdPreview
              width={placement.size.width}
              height={placement.size.height}
            />
          )}
          <ul className="mt-4 space-y-1 text-sm text-slate-600">
            {placement.highlights.map((item) => (
              <li key={item}>• {item}</li>
            ))}
          </ul>
        </Card>
      </div>

      <Card>
        <h2 className="text-lg font-bold">Pages it appears on</h2>
        <p className="mt-1 text-sm text-slate-600">
          Open any of these and look for the spot on the map above.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {placement.where.map((page) => (
            <Link
              key={page.label}
              href={page.href}
              className="rounded-full border border-slate-200 px-3 py-1 text-sm font-medium text-indigo-600 hover:bg-indigo-50"
            >
              {page.label} →
            </Link>
          ))}
        </div>
      </Card>

      <Card>
        <h2 className="text-lg font-bold">This spot never sells out</h2>
        <p className="mt-1 text-sm text-slate-600">
          Every advertiser who books this size joins a rotation: each page view
          picks one of them, weighted so nobody is starved of the views they
          paid for. A spot that already shows an ad is still open — you simply
          take your turn. Views and clicks are counted for each banner in{" "}
          <Link href="/dashboard/ads" className="font-semibold text-indigo-600">
            your dashboard
          </Link>
          .
        </p>
        <div className="mt-4 rounded-xl bg-slate-50 p-3">
          <p className="text-2xl font-bold">
            {formatAdPrice(placement, currency)}
            <span className="text-sm font-medium text-slate-500"> / month</span>
          </p>
          <p className="text-xs text-slate-500">
            or about {formatCpm(placement, currency)} per 1,000 views
          </p>
        </div>
        <LinkButton href={`/advertise?slot=${slot}#book`} className="mt-4">
          Book this spot
        </LinkButton>
      </Card>

      {user?.role === "ADMIN" ? (
        <Alert tone="success">
          Admin:{" "}
          <Link
            href={`/admin/banners?slot=${slot}`}
            className="font-semibold underline"
          >
            put a banner in this spot
          </Link>{" "}
          without payment.
        </Alert>
      ) : null}
    </div>
  );
}
