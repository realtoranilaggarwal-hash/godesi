/**
 * Google map of an address (Maps Embed API, free, no usage cap). Renders
 * nothing until NEXT_PUBLIC_GOOGLE_MAPS_KEY is set, so pages degrade to the
 * plain "Open in maps" link.
 */
export function MapEmbed({
  query,
  title,
  className = "",
}: {
  /** Address or "venue, city" text for the map to search. */
  query: string;
  title: string;
  className?: string;
}) {
  const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY;
  if (!key || !query.trim()) return null;
  const src = `https://www.google.com/maps/embed/v1/place?key=${encodeURIComponent(key)}&q=${encodeURIComponent(query)}`;
  return (
    <iframe
      title={`Map: ${title}`}
      src={src}
      loading="lazy"
      allowFullScreen
      referrerPolicy="no-referrer-when-downgrade"
      className={`h-56 w-full rounded-xl border border-slate-200 ${className}`}
    />
  );
}
