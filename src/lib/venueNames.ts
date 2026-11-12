/**
 * Spelling-insensitive key for a venue name, so "Royal Albert's Palace",
 * "Royal Albert-s Palace" and "royal albert palace" are the same venue.
 * No database imports: the event form uses this in the browser too.
 */
export function venueNameKey(name: string) {
  return name
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/['’`]/g, "")
    .split(/[^a-z0-9]+/)
    .filter((word) => word.length > 1 && word !== "the")
    .map((word) =>
      word.length > 3 && word.endsWith("s") ? word.slice(0, -1) : word,
    )
    .join(" ");
}

/** Listed venues whose name looks like what the organiser typed. */
export function similarVenues<T extends { name: string }>(
  typed: string,
  venues: T[],
  limit = 3,
) {
  const key = venueNameKey(typed);
  if (key.length < 4) return [];
  return venues
    .filter((venue) => {
      const other = venueNameKey(venue.name);
      return other === key || other.includes(key) || key.includes(other);
    })
    .slice(0, limit);
}
