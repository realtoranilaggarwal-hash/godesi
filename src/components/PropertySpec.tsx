import Link from "next/link";
import { Card } from "@/components/ui";
import { formatMoney } from "@/lib/format";
import {
  AMENITIES,
  CONSTRUCTION_TYPES,
  FLOORING_TYPES,
  PARKING_TYPES,
  POSTED_BY_LABELS,
  PROPERTY_GROUP_LABELS,
  PROPERTY_HIGHLIGHTS,
  UTILITIES,
  bathsLabel,
  optionLabel,
  pricePerSqft,
  propertyTypeLabel,
  sizeLabel,
} from "@/lib/property";
import { FURNISHING_LABELS } from "@/lib/listings";
import type { Listing } from "@prisma/client";

function Chips({
  title,
  slugs,
  known,
}: {
  title: string;
  slugs: string[];
  known: { slug: string; label: string }[];
}) {
  const allowed = new Set(known.map((option) => option.slug));
  const shown = slugs.filter((slug) => allowed.has(slug));
  if (!shown.length) return null;
  return (
    <div>
      <h3 className="mb-2 text-sm font-bold text-slate-700">{title}</h3>
      <div className="flex flex-wrap gap-2">
        {shown.map((slug) => (
          <span
            key={slug}
            className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800"
          >
            ✓ {optionLabel(slug)}
          </span>
        ))}
      </div>
    </div>
  );
}

/** The spec sheet a property buyer scans before they ever message anyone. */
export function PropertySpec({ listing }: { listing: Listing }) {
  const size = sizeLabel(listing);
  const baths = bathsLabel(listing);
  const perSqft = pricePerSqft(listing);
  const parking = [
    listing.parkingCar ? `${listing.parkingCar} car` : null,
    listing.parkingBike ? `${listing.parkingBike} bike` : null,
  ]
    .filter(Boolean)
    .join(" · ");

  const rows: [string, React.ReactNode][] = [];
  if (listing.propertyGroup)
    rows.push(["Category", PROPERTY_GROUP_LABELS[listing.propertyGroup]]);
  if (listing.propertyType)
    rows.push(["Type", propertyTypeLabel(listing.propertyType)]);
  if (listing.postedByRole)
    rows.push(["Listed by", POSTED_BY_LABELS[listing.postedByRole]]);
  if (listing.saleType) rows.push(["Sale type", optionLabel(listing.saleType)]);
  if (listing.bedrooms) rows.push(["Bedrooms", String(listing.bedrooms)]);
  if (baths) rows.push(["Bathrooms", baths]);
  if (listing.balconies) rows.push(["Balconies", String(listing.balconies)]);
  if (size) rows.push(["Size", size]);
  if (perSqft)
    rows.push([
      "Price per sq ft",
      formatMoney(perSqft, listing.currency),
    ]);
  if (listing.yearBuilt) rows.push(["Year built", String(listing.yearBuilt)]);
  if (listing.carpetArea) rows.push(["Carpet area", String(listing.carpetArea)]);
  if (listing.furnishing)
    rows.push(["Furnishing", FURNISHING_LABELS[listing.furnishing]]);
  if (listing.floor !== null || listing.totalFloors !== null)
    rows.push([
      "Floor",
      `${listing.floor ?? "—"}${listing.totalFloors ? ` of ${listing.totalFloors}` : ""}`,
    ]);
  if (listing.facing) rows.push(["Facing", optionLabel(listing.facing)]);
  if (listing.propertyAge) rows.push(["Age", optionLabel(listing.propertyAge)]);
  if (listing.ownership) rows.push(["Ownership", optionLabel(listing.ownership)]);
  if (parking) rows.push(["Parking", parking]);
  if (listing.deposit)
    rows.push(["Security deposit", formatMoney(listing.deposit, listing.currency)]);
  if (listing.maintenance)
    rows.push([
      "Maintenance",
      `${formatMoney(listing.maintenance, listing.currency)} / month`,
    ]);
  if (listing.hoaFee)
    rows.push([
      "HOA / condo fee",
      `${formatMoney(listing.hoaFee, listing.currency)} / month`,
    ]);
  if (listing.propertyTax)
    rows.push([
      "Property tax",
      `${formatMoney(listing.propertyTax, listing.currency)} / year`,
    ]);
  if (listing.schoolDistrict)
    rows.push(["School district", listing.schoolDistrict]);
  if (listing.mlsNumber) rows.push(["MLS #", listing.mlsNumber]);
  if (listing.openHouseAt)
    rows.push([
      "Open house",
      `${listing.openHouseAt.toLocaleString(undefined, {
        weekday: "short",
        day: "numeric",
        month: "short",
        hour: "numeric",
        minute: "2-digit",
      })}${
        listing.openHouseEndsAt
          ? ` – ${listing.openHouseEndsAt.toLocaleTimeString(undefined, {
              hour: "numeric",
              minute: "2-digit",
            })}`
          : ""
      }`,
    ]);
  if (listing.negotiable) rows.push(["Price", "Negotiable"]);
  if (listing.underLoan) rows.push(["Loan", "Currently under loan"]);
  if (listing.availableFrom)
    rows.push([
      "Available from",
      listing.availableFrom.toLocaleDateString(undefined, {
        day: "numeric",
        month: "short",
        year: "numeric",
      }),
    ]);
  if (listing.tenantPref)
    rows.push(["Preferred tenant", optionLabel(listing.tenantPref)]);
  const place = [listing.area, listing.city, listing.state, listing.country]
    .filter(Boolean)
    .join(", ");
  if (place) rows.push(["Address", place]);

  if (!rows.length) return null;

  return (
    <Card className="space-y-4">
      <h2 className="font-bold">Property details</h2>
      <dl className="grid gap-2 sm:grid-cols-2">
        {rows.map(([label, value]) => (
          <div key={label} className="flex justify-between gap-3 text-sm">
            <dt className="text-slate-500">{label}</dt>
            <dd className="text-right font-semibold text-slate-800">{value}</dd>
          </div>
        ))}
      </dl>

      <Chips
        title="Worth knowing"
        slugs={listing.highlights}
        known={PROPERTY_HIGHLIGHTS}
      />
      <Chips title="Parking" slugs={listing.parkingTypes} known={PARKING_TYPES} />
      <Chips title="Flooring" slugs={listing.flooring} known={FLOORING_TYPES} />
      <Chips title="Built of" slugs={listing.construction} known={CONSTRUCTION_TYPES} />
      <Chips title="Utilities" slugs={listing.utilities} known={UTILITIES} />
      <Chips title="Amenities" slugs={listing.amenities} known={AMENITIES} />

      <div className="flex flex-wrap gap-3 text-sm font-semibold">
        {listing.mapUrl ? (
          <a
            href={listing.mapUrl}
            target="_blank"
            rel="noopener noreferrer nofollow"
            className="text-indigo-600 hover:underline"
          >
            📍 Open the map pin
          </a>
        ) : null}
        {listing.tourUrl ? (
          <a
            href={listing.tourUrl}
            target="_blank"
            rel="noopener noreferrer nofollow"
            className="text-indigo-600 hover:underline"
          >
            🕶️ Virtual tour
          </a>
        ) : null}
        {listing.propertyGroup ? (
          <Link
            href={`/real-estate?group=${listing.propertyGroup}`}
            className="text-indigo-600 hover:underline"
          >
            More {PROPERTY_GROUP_LABELS[listing.propertyGroup].toLowerCase()} →
          </Link>
        ) : null}
      </div>
    </Card>
  );
}
