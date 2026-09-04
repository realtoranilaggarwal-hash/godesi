import Link from "next/link";
import { formatEventDate, seatsLeft } from "@/lib/events";
import { Money } from "@/components/Money";
import { Badge } from "@/components/ui";
import { eventFeatureIcon } from "@/lib/eventOptions";
import { eventCategoryIcon, eventCategoryLabel } from "@/lib/eventCategories";
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
 * `featured` wraps the card in a gold frame with a ribbon and shows the whole
 * poster (letterboxed, never cropped) at a larger size.
 */
export function EventCard({
  event,
  variant = "default",
  featured = false,
  side = false,
}: {
  event: EventListItem;
  variant?: "default" | "compact" | "tile";
  featured?: boolean;
  /** Featured only: poster on the left, details on the right, spanning the grid row. */
  side?: boolean;
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
  const posterHeight = tile ? "h-28" : compact ? "h-28" : "h-40";

  return (
    <div
      className={`relative flex ${featured && side ? "sm:col-span-full" : ""} ${
        featured
          ? "rounded-[20px] bg-gradient-to-br from-amber-300 via-yellow-500 to-amber-600 p-[3px] shadow-lg shadow-amber-200/60"
          : ""
      }`}
    >
      {featured ? (
        <span className="absolute -left-1.5 top-4 z-10 rounded-r-md bg-gradient-to-r from-amber-500 to-yellow-400 py-1 pl-3 pr-2.5 text-[11px] font-black uppercase tracking-wide text-slate-900 shadow after:absolute after:-bottom-1.5 after:left-0 after:border-r-[6px] after:border-t-[6px] after:border-r-transparent after:border-t-amber-700 after:content-['']">
          ⭐ Featured
        </span>
      ) : null}
      <StaffEditLink
        href={`/admin/events/${event.id}`}
        className="absolute right-2 top-2 z-10 shadow"
        label="✏️ Edit"
      />
      <Link
        href={`/events/${event.slug}`}
        className={`group flex flex-1 flex-col overflow-hidden bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${
          featured
            ? `rounded-[17px] ${side && event.imageUrl ? "sm:grid sm:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]" : ""}`
            : "rounded-2xl border border-slate-200"
        }`}
      >
        {event.imageUrl && featured ? (
          <div
            className={`relative h-56 w-full overflow-hidden bg-slate-900 ${
              side ? "sm:h-full sm:min-h-[260px]" : ""
            }`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={thumbImage(event.imageUrl, 640)}
              alt=""
              aria-hidden
              className="absolute inset-0 h-full w-full scale-110 object-cover opacity-60 blur-xl"
              loading="lazy"
            />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={thumbImage(event.imageUrl, 1080)}
              alt={event.title}
              className={`relative h-full w-full object-contain ${
                side ? "sm:absolute sm:inset-0" : ""
              }`}
              loading="lazy"
            />
          </div>
        ) : event.imageUrl ? (
          <div
            className={`relative ${posterHeight} w-full overflow-hidden bg-slate-900`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={thumbImage(event.imageUrl, 384)}
              alt=""
              aria-hidden
              className="absolute inset-0 h-full w-full scale-110 object-cover opacity-60 blur-lg"
              loading="lazy"
            />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={thumbImage(event.imageUrl, 640)}
              alt={event.title}
              className="relative h-full w-full object-contain"
              loading="lazy"
            />
          </div>
        ) : null}

        <div
          className={`flex flex-1 flex-col gap-1 ${
            tile ? "p-2.5" : compact ? "p-3" : "p-4"
          } ${featured && !event.imageUrl ? "pt-12" : ""}`}
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
            {left === 0 && !imported ? (
              <Badge tone="red">Sold out</Badge>
            ) : null}
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
