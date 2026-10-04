import { thumbImage } from "@/lib/proxyImage";

/**
 * A card's picture. Cards with no logo — an unclaimed association seeded from a
 * public register, say — fall back to their category's emoji rather than a bare
 * initial, which reads as a broken image.
 */
export function LogoTile({
  name,
  icon,
  imageUrl,
  className = "h-12 w-12",
  emojiClassName = "text-2xl",
}: {
  name: string;
  icon?: string | null;
  imageUrl?: string | null;
  className?: string;
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
      role="img"
      aria-label={name}
      className={`${className} ${emojiClassName} flex shrink-0 items-center justify-center rounded-xl border border-indigo-100 bg-indigo-50 leading-none`}
    >
      {icon || "🏷️"}
    </span>
  );
}
