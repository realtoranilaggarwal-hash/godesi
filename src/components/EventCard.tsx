import Link from "next/link";
import { formatEventDate, seatsLeft } from "@/lib/events";
import { Money } from "@/components/Money";
import { gradientFor } from "@/lib/categories";
import { Badge } from "@/components/ui";
import { eventFeatureIcon } from "@/lib/eventOptions";
import { StaffEditLink } from "@/components/StaffEditLink";
import { thumbImage } from "@/lib/proxyImage";

export type EventListItem = {
  id: string;
  slug: string;
  title: string;
  startsAt: Date;
  venue: string;
  hallName?: string | null;
  city: string;
  features?: string[];
  partnerStatus?: string;
  imageUrl: string | null;
  price: number;
  currency: string;
  seatsTotal: number;
  seatsBooked: number;
  category: { name: string; icon: string; color: string } | null;
};

/** `compact` shrinks the poster and hides feature chips so rows stay even. */
export function EventCard({
  event,
  variant = "default",
}: {
  event: EventListItem;
  variant?: "default" | "compact";
}) {
  const left = seatsLeft(event);
  const compact = variant === "compact";
  const posterHeight = compact ? "h-24" : "h-32";

  return (
    <div className="relative flex">
      <StaffEditLink
        href={`/admin/events/${event.id}`}
        className="absolute right-2 top-2 z-10 shadow"
        label="✏️ Edit"
      />
      <Link
      href={`/events/${event.slug}`}
      className="group flex flex-1 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
    >
      {event.imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={thumbImage(event.imageUrl, 640)}
          alt={event.title}
          className={`${posterHeight} w-full object-cover`}
          loading="lazy"
        />
      ) : (
        <div
          className={`flex ${posterHeight} items-center justify-center bg-gradient-to-br ${gradientFor(
            event.category?.color ?? "rose",
          )} text-5xl`}
          aria-hidden
        >
          {event.category?.icon ?? "🎉"}
        </div>
      )}

      <div className={`flex flex-1 flex-col gap-1.5 ${compact ? "p-3" : "p-4"}`}>
        <div className="flex items-center gap-2">
          {event.category ? (
            <Badge tone="indigo">
              {event.category.icon} {event.category.name}
            </Badge>
          ) : null}
          {event.partnerStatus === "APPROVED" ? (
            <Badge tone="amber">🔥 Partner event</Badge>
          ) : null}
          {left === 0 ? <Badge tone="red">Sold out</Badge> : null}
        </div>
        <h3 className="line-clamp-2 font-bold leading-snug group-hover:text-indigo-600">
          {event.title}
        </h3>
        <p className="text-sm text-slate-600">📅 {formatEventDate(event.startsAt)}</p>
        <p className="line-clamp-1 text-sm text-slate-600">
          📍 {event.venue}
          {event.hallName ? ` — ${event.hallName}` : ""}, {event.city}
        </p>
        {event.features?.length && !compact ? (
          <div className="flex flex-wrap gap-1">
            {event.features.slice(0, 3).map((feature) => (
              <span
                key={feature}
                className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600"
              >
                {eventFeatureIcon(feature)} {feature}
              </span>
            ))}
          </div>
        ) : null}
        <div className="mt-auto flex items-center justify-between pt-2">
          <span className="font-bold text-indigo-600">
            {event.price ? (
              <Money value={event.price} currency={event.currency} />
            ) : (
              "Free entry"
            )}
          </span>
          <span className="text-xs text-slate-500">{left} seats left</span>
        </div>
      </div>
      </Link>
    </div>
  );
}
