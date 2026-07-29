import Link from "next/link";

const linkClass = "underline-offset-2 hover:text-indigo-600 hover:underline";

/**
 * City, state and country rendered with the city and country linked into the filtered
 * directory, so a visitor can jump from any card to everything else in that area.
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
      <Link
        key="city"
        href={`${base}?city=${encodeURIComponent(city)}`}
        className={linkClass}
      >
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
