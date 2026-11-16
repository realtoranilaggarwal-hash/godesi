/**
 * Parts of the site outside the directory tree that can have their own clip.
 * Stored in `HelpClip.categorySlug`; the `section:` prefix never clashes with
 * a category slug.
 */
export const CLIP_SECTIONS = [
  {
    slug: "section:elite",
    name: "GoDesi Elite (/desi-elite)",
    href: "/desi-elite",
  },
  {
    slug: "section:festivals",
    name: "Festivals (/festivals)",
    href: "/festivals",
  },
  {
    slug: "section:complaints",
    name: "Complaints (/complaints)",
    href: "/complaints",
  },
  { slug: "section:events", name: "Events (/events)", href: "/events" },
  { slug: "section:gigs", name: "Gigs (/gigs)", href: "/gigs" },
  { slug: "section:news", name: "News (/news)", href: "/news" },
  {
    slug: "section:astrology",
    name: "Astrology (/astrology)",
    href: "/astrology",
  },
  { slug: "section:rishta", name: "Rishta (/rishta)", href: "/rishta" },
  {
    slug: "section:live",
    name: "Live radio & TV (/live-radio, /live-tv)",
    href: "/live-radio",
  },
] as const;

/** Where a clip's "Browse this category" link goes; null for sitewide clips. */
export function clipBrowseHref(categorySlug: string | null): string | null {
  if (!categorySlug) return null;
  if (categorySlug.startsWith("section:")) {
    return (
      CLIP_SECTIONS.find((section) => section.slug === categorySlug)?.href ??
      null
    );
  }
  return `/categories/${categorySlug}`;
}

export type ClipSection = (typeof CLIP_SECTIONS)[number]["slug"];
