import Link from "next/link";
import type { BusinessListItem } from "@/lib/businesses";
import { Badge, Card, Stars } from "@/components/ui";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { whatsappLink } from "@/lib/format";

export function BusinessCard({ business }: { business: BusinessListItem }) {
  return (
    <Card className="flex flex-col gap-3">
      <div className="flex items-start gap-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={business.logoUrl ?? "/placeholder-logo.svg"}
          alt=""
          className="h-12 w-12 shrink-0 rounded-xl border border-slate-200 object-cover"
        />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href={`/b/${business.slug}`}
              className="truncate font-semibold text-slate-900 hover:text-indigo-600"
            >
              {business.name}
            </Link>
            {business.plan !== "FREE" ? (
              <Badge tone="indigo">{business.plan}</Badge>
            ) : null}
          </div>
          <p className="text-sm text-slate-500">
            {business.category} · {business.city}
          </p>
          <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
            <Stars rating={business.rating} />
            <span>
              {business.reviewCount
                ? `${business.rating.toFixed(1)} (${business.reviewCount})`
                : "No reviews yet"}
            </span>
          </div>
        </div>
      </div>

      {business.specialties.length ? (
        <div className="flex flex-wrap gap-1.5">
          {business.featuredSpecialty ? (
            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-800">
              ⭐ {business.featuredSpecialty}
            </span>
          ) : null}
          {business.specialties
            .filter((item) => item !== business.featuredSpecialty)
            .slice(0, 4)
            .map((item) => (
              <span
                key={item}
                className="rounded-full bg-cyan-50 px-2 py-0.5 text-xs font-semibold text-cyan-800"
              >
                {item}
              </span>
            ))}
        </div>
      ) : null}

      {business.description ? (
        <p className="line-clamp-2 text-sm text-slate-600">{business.description}</p>
      ) : null}

      <div className="mt-auto flex gap-2">
        <Link
          href={`/b/${business.slug}`}
          className="flex-1 rounded-xl border border-slate-300 px-3 py-2 text-center text-sm font-semibold hover:bg-slate-50"
        >
          View card
        </Link>
        {business.whatsappNumber ? (
          <WhatsAppButton
            slug={business.slug}
            href={whatsappLink(
              business.whatsappNumber,
              `Hi ${business.name}, I found you on Godesi.`,
            )}
            label="WhatsApp"
            className="flex-1"
          />
        ) : (
          <Link
            href={`/b/${business.slug}?claim=1`}
            className="flex-1 rounded-xl bg-amber-500 px-3 py-2 text-center text-sm font-semibold text-white hover:bg-amber-600"
          >
            Claim
          </Link>
        )}
      </div>
    </Card>
  );
}
