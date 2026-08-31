import Link from "next/link";
import { formatEventDate, seatsLeft } from "@/lib/events";
import { Money } from "@/components/Money";
import { Badge } from "@/components/ui";
import { eventFeatureIcon } from "@/lib/eventOptions";
import {
  eventCategoryIcon,
  eventCategoryLabel,
} from "@/lib/eventCategories";
import { StaffEditLink } from "@/components/StaffEditLink";
import { thumbImage } from "@/lib/proxyImage";
import { eventTheme, placeLine } from "@/lib/eventTheme";
import { gradientFor } from "@/lib/categories";

export type EventListItem = {
  id: string;
  slug: string;
  title: string;
  startsAt: Date;
  timeZone?: string | null;
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
  /** Set when the event came from a public calendar; Godesi sells no seats. */
  sourceId?: string | null;
  category: { name: string; icon: string; color: string } | null;
  /** The event's own categories, e.g. garba-dandiya — the first one is shown. */
  genres?: string[];
};

/**
 * `compact` shrinks the poster and hides feature chips so rows stay even;
 * `tile` trims it further for the six-across home page rows.
 */
export function EventCard({
  event,
  variant = "default",
}: {
  event: EventListItem;
  variant?: "default" | "compact" | "tile";
}) {
  const left = seatsLeft(event);
  const imported = Boolean(event.sourceId);
  const tile = variant === "tile";
  const compact = variant === "compact" || tile;
  const theme = eventTheme(
    event.title,
    event.category?.icon,
    event.category?.color,
  );
  const posterHeight = tile ? "h-28" : compact ? "h-24" : "h-32";

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
        ) : null}

        <div
          className={`flex flex-1 flex-col gap-1 ${
            tile ? "p-2.5" : compact ? "p-3" : "p-4"
          }`}
        >
          <div className="flex items-center gap-2">
            {event.genres?.length && !tile ? (
              <Badge tone="indigo">
                {eventCategoryIcon(event.genres[0])}{" "}
                {eventCategoryLabel(event.genres[0])}
              </Badge>
            ) : event.category && !tile ? (
              <Badge tone="indigo">
                {event.category.icon} {event.category.name}
              </Badge>
            ) : null}
            {event.partnerStatus === "APPROVED" ? (
              <Badge tone="amber">🔥 Partner event</Badge>
            ) : null}
            {left === 0 && !imported ? <Badge tone="red">Sold out</Badge> : null}
          </div>
          <div className="flex items-start gap-2">
            {event.imageUrl ? null : (
              <span
                aria-hidden
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${gradientFor(
                  theme.color,
                )} text-base`}
              >
                {theme.icon}
              </span>
            )}
            <h3
              className={`line-clamp-2 font-bold leading-snug group-hover:text-indigo-600 ${
                tile ? "text-sm" : ""
              }`}
            >
              {event.title}
            </h3>
          </div>
          <p className={`text-slate-600 ${tile ? "text-xs" : "text-sm"}`}>
            📅 {formatEventDate(event.startsAt, event.timeZone)}
          </p>
          <p
            className={`line-clamp-1 text-slate-600 ${
              tile ? "text-xs" : "text-sm"
            }`}
          >
            📍{" "}
            {tile
              ? event.city
              : placeLine(
                  `${event.venue}${event.hallName ? ` — ${event.hallName}` : ""}`,
                  event.city,
                )}
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
          <div className="mt-auto flex items-center justify-between gap-1 pt-2">
            <span
              className={`font-bold text-indigo-600 ${tile ? "text-sm" : ""}`}
            >
              {event.price ? (
                <Money value={event.price} currency={event.currency} />
              ) : imported ? (
                // The organiser sets their own entry terms; we do not know them.
                "See organiser"
              ) : (
                "Free entry"
              )}
            </span>
            <span className="text-xs text-slate-500">
              {imported
                ? "Community calendar"
                : `${left} seat${left === 1 ? "" : "s"} left`}
            </span>
          </div>
        </div>
      </Link>
    </div>
  );
}
