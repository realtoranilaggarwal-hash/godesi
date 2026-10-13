import { db } from "@/lib/db";

export type HelpClipCard = {
  id: string;
  title: string;
  note: string | null;
  url: string;
  thumbnailUrl: string | null;
};

/** The still frame YouTube publishes for a video, so the card is not blank. */
export function clipThumbnail(url: string): string | null {
  let parsed: URL;
  try {
    parsed = new URL(url.trim());
  } catch {
    return null;
  }

  const host = parsed.hostname.replace(/^www\./, "").toLowerCase();
  if (host.includes("vimeo")) return null;

  const id =
    host === "youtu.be"
      ? parsed.pathname.slice(1)
      : (parsed.searchParams.get("v") ??
        parsed.pathname.match(/^\/(?:embed|shorts|live|v)\/([\w-]+)/)?.[1] ??
        null);

  return id ? `https://i.ytimg.com/vi/${id}/hqdefault.jpg` : null;
}

/**
 * The clip for a page: the most specific match wins, so a subcategory clip
 * beats its parent's and both beat the sitewide welcome clip.
 */
export async function helpClipFor(
  categorySlug?: string | null,
  parentSlug?: string | null,
): Promise<HelpClipCard | null> {
  const scopes = [categorySlug, parentSlug].filter(
    (slug): slug is string => Boolean(slug),
  );

  const clips = await db.helpClip.findMany({
    where: {
      active: true,
      OR: [{ categorySlug: null }, { categorySlug: { in: scopes } }],
    },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    select: { id: true, title: true, note: true, url: true, categorySlug: true },
  });
  if (clips.length === 0) return null;

  const best =
    scopes
      .map((slug) => clips.find((clip) => clip.categorySlug === slug))
      .find(Boolean) ?? clips.find((clip) => clip.categorySlug === null);
  if (!best) return null;

  return {
    id: best.id,
    title: best.title,
    note: best.note,
    url: best.url,
    thumbnailUrl: clipThumbnail(best.url),
  };
}
