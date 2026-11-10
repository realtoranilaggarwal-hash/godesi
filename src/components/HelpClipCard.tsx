import { HelpClip } from "@/components/HelpClip";
import { helpClipFor } from "@/lib/helpClips";
import { videoEmbedUrl } from "@/lib/video";

/**
 * Server wrapper so any page can offer the right clip by passing its category;
 * pages without one get the sitewide welcome clip, and nothing renders when
 * staff have not added any.
 */
export async function HelpClipCard({
  categorySlug = null,
  parentSlug = null,
  sitewide = true,
  className,
}: {
  categorySlug?: string | null;
  parentSlug?: string | null;
  /** False: only a clip made for this page, never the sitewide welcome clip. */
  sitewide?: boolean;
  /** Wrapper classes, for placing the card outside the sidebar. */
  className?: string;
}) {
  const clip = await helpClipFor(categorySlug, parentSlug, { sitewide });
  if (!clip) return null;

  const embedUrl = videoEmbedUrl(clip.url);
  if (!embedUrl) return null;

  const card = <HelpClip clip={clip} embedUrl={embedUrl} />;
  return className ? <div className={className}>{card}</div> : card;
}
