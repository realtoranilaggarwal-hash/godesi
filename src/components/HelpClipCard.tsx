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
}: {
  categorySlug?: string | null;
  parentSlug?: string | null;
}) {
  const clip = await helpClipFor(categorySlug, parentSlug);
  if (!clip) return null;

  const embedUrl = videoEmbedUrl(clip.url);
  if (!embedUrl) return null;

  return <HelpClip clip={clip} embedUrl={embedUrl} />;
}
