import Link from "next/link";
import { citySlug } from "@/lib/citySlug";

const linkClass = "underline-offset-2 hover:text-indigo-600 hover:underline";

/**
 * City, state and country rendered as links: the city opens its own hub — news,
 * businesses, events, rentals and temples tagged with that place — and the
 * country opens the filtered directory.
 */
export function PlaceLink({
  city,
  state,
  country,
  base = "/search",
  className = "",
}: {
  city?: string | null;
  state?: string | null;
  country?: string | null;
  /** The listing surface the filters belong to, e.g. "/search" or "/rooms". */
  base?: string;
  className?: string;
}) {
  const parts = [
    city ? (
      <Link key="city" href={`/city/${citySlug(city)}`} className={linkClass}>
        {city}
      </Link>
    ) : null,
    state ? <span key="state">{state}</span> : null,
    country ? (
      <Link
        key="country"
        href={`${base}?country=${encodeURIComponent(country)}`}
        className={linkClass}
      >
        {country}
      </Link>
    ) : null,
  ].filter((part) => part !== null);

  return (
    <span className={className}>
      {parts.map((part, index) => (
        <span key={index}>
          {index > 0 ? ", " : null}
          {part}
        </span>
      ))}
    </span>
  );
}
