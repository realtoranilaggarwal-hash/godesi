import { thumbImage } from "@/lib/proxyImage";
import { categoryCover } from "@/lib/cityCovers";

const DEFAULT_ART = "/images/categories/default.jpg";

/**
 * A card's picture. Cards with no logo — an unclaimed association seeded from a
 * public register, say — fall back to the festive illustration for their
 * category (default bazaar art when the category has none) rather than an
 * emoji, so every tile keeps the desi-art look.
 */
export function LogoTile({
  name,
  imageUrl,
  categorySlug,
  className = "h-12 w-12",
}: {
  name: string;
  /** Kept for caller compatibility — art replaced the emoji fallback. */
  icon?: string | null;
  imageUrl?: string | null;
  categorySlug?: string | null;
  className?: string;
  /** Kept for caller compatibility — unused now that art replaces emoji. */
  emojiClassName?: string;
}) {
  if (imageUrl) {
    return (
      <span
        className={`${className} relative block shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-slate-900`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={thumbImage(imageUrl, 384)}
          alt=""
          aria-hidden
          loading="lazy"
          className="absolute inset-0 h-full w-full scale-110 object-cover opacity-60 blur-md"
        />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={thumbImage(imageUrl, 384)}
          alt=""
          loading="lazy"
          className="relative h-full w-full object-contain"
        />
      </span>
    );
  }

  return (
    <span
      className={`${className} relative block shrink-0 overflow-hidden rounded-xl border border-indigo-100`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={categoryCover(categorySlug) ?? DEFAULT_ART}
        alt={name}
        loading="lazy"
        className="h-full w-full object-cover"
      />
    </span>
  );
}
