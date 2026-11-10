/**
 * Parts of the site outside the directory tree that can have their own clip.
 * Stored in `HelpClip.categorySlug`; the `section:` prefix never clashes with
 * a category slug.
 */
export const CLIP_SECTIONS = [
  { slug: "section:elite", name: "GoDesi Elite (/desi-elite)" },
  { slug: "section:festivals", name: "Festivals (/festivals)" },
  { slug: "section:complaints", name: "Complaints (/complaints)" },
] as const;

export type ClipSection = (typeof CLIP_SECTIONS)[number]["slug"];
