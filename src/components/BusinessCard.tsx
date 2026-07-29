import Link from "next/link";
import type { BusinessListItem } from "@/lib/businesses";
import { Badge, Card, Stars } from "@/components/ui";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { PlaceLink } from "@/components/PlaceLink";
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
            {business.category} ·{" "}
            <PlaceLink city={business.city} country={business.country} />
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

      {business.vehicle ? (
        <div className="flex flex-wrap gap-1.5">
          {[
            String(business.vehicle.year),
            business.vehicle.mileage !== null
              ? `${business.vehicle.mileage.toLocaleString()} ${business.vehicle.mileageUnit}`
              : null,
            business.vehicle.fuelType,
            business.vehicle.ownership,
            business.vehicle.price !== null
              ? `${business.vehicle.currency === "INR" ? "₹" : "$"}${business.vehicle.price.toLocaleString()}${business.vehicle.negotiable ? " (neg.)" : ""}`
              : null,
          ]
            .filter((tag): tag is string => Boolean(tag))
            .map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-lime-100 px-2 py-0.5 text-xs font-bold text-lime-900"
              >
                {tag}
              </span>
            ))}
        </div>
      ) : null}

      {business.serviceOptions.length || business.priceFrom || business.priceHourly ? (
        <div className="flex flex-wrap gap-1.5">
          {business.verifiedProvider ? (
            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-800">
              ✅ Verified provider
            </span>
          ) : null}
          {[business.priceFrom, business.priceHourly]
            .filter((tag): tag is string => Boolean(tag))
            .map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-bold text-emerald-800"
              >
                {tag}
              </span>
            ))}
          {business.serviceOptions.slice(0, 4).map((option) => (
            <span
              key={option}
              className="rounded-full bg-violet-50 px-2 py-0.5 text-xs font-semibold text-violet-800"
            >
              {option}
            </span>
          ))}
        </div>
      ) : null}

      {business.certifications.length || business.yearsExperience !== null ? (
        <p className="text-xs font-semibold text-slate-500">
          {[
            business.yearsExperience !== null
              ? `${business.yearsExperience} yrs experience`
              : null,
            business.certifications.slice(0, 3).join(" · ") || null,
          ]
            .filter(Boolean)
            .join(" · ")}
        </p>
      ) : null}

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
