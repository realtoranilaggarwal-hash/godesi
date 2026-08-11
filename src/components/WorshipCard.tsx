import Link from "next/link";
import type { Faith } from "@prisma/client";
import { Badge } from "@/components/ui";
import { FAITH_ICONS, FAITH_LABELS } from "@/lib/worship";

export type WorshipCardItem = {
  slug: string;
  name: string;
  faith: Faith;
  city: string;
  state: string | null;
  country: string;
  address: string | null;
  images: { url: string }[];
};

export function WorshipCard({ place }: { place: WorshipCardItem }) {
  return (
    <Link
      href={`/religious/${place.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
    >
      {place.images[0] ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={place.images[0].url}
          alt={place.name}
          className="h-36 w-full object-cover"
          loading="lazy"
        />
      ) : (
        <div className="flex h-36 items-center justify-center bg-gradient-to-br from-amber-400 via-orange-500 to-rose-500 text-5xl">
          {FAITH_ICONS[place.faith]}
        </div>
      )}
      <div className="flex flex-1 flex-col gap-1.5 p-4">
        <Badge tone="amber">{FAITH_LABELS[place.faith]}</Badge>
        <p className="font-bold leading-snug group-hover:text-indigo-600">{place.name}</p>
        <p className="text-sm text-slate-600">
          📍 {place.address ? `${place.address}, ` : ""}
          {place.city}
          {place.state ? `, ${place.state}` : ""} · {place.country}
        </p>
      </div>
    </Link>
  );
}
