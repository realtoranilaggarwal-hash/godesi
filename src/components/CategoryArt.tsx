import { categoryCover } from "@/lib/cityCovers";

const DEFAULT_ART = "/images/categories/default.jpg";

/**
 * Category illustration — the generated desi artwork for the slug, falling
 * back to the default bazaar banner. This replaced the old emoji-cartoon
 * scenes so the whole site keeps one festive illustration style.
 */
export function CategoryArt({
  slug,
  className = "",
}: {
  slug: string;
  /** Accepted for caller compatibility — the photo art needs no emoji star. */
  icon?: string;
  className?: string;
}) {
  const src = categoryCover(slug) ?? DEFAULT_ART;
  // eslint-disable-next-line @next/next/no-img-element
  return (
    <img
      src={src}
      alt=""
      aria-hidden
      className={`aspect-[32/17] object-cover ${className}`}
    />
  );
}
