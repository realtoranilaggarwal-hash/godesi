/**
 * GoDesi's own YouTube Shorts, embedded as promo cards across the site.
 * Client-safe: plain constants, no server imports.
 */

/** The owner's GoDesi Shorts playlist. */
export const GODESI_SHORTS_PLAYLIST =
  "https://youtube.com/playlist?list=PLWppF3dDiHeA";

export const WHAT_IS_GODESI_VIDEO_URL = "https://youtube.com/shorts/54hMwWcfJag";
export const RAFFLE_VIDEO_URL = "https://youtube.com/shorts/9raZ1qg0-3w";
export const GAMES_VIDEO_URL = "https://youtube.com/shorts/VDeEtBue2Lc";
export const JOURNALIST_VIDEO_URL = "https://youtube.com/shorts/W9hIVxStDKE";
export const MARKETS_VIDEO_URL = "https://youtube.com/shorts/1M6SzzhR5Ps";
export const ASTROLOGY_VIDEO_URL = "https://youtube.com/shorts/GTrijkpSCLI";
export const PROPOSAL_VIDEO_URL = "https://youtube.com/shorts/BS6vee4S9D4";
export const BIZCARD_VIDEO_URL = "https://youtube.com/shorts/YxLb_2KlZpc";
export const POOJA_VIDEO_URL = "https://youtube.com/shorts/QVV6HibyjOE";
export const TEMPLES_VIDEO_URL = "https://youtube.com/shorts/ehtKmLuwJY4";
export const BANNERS_VIDEO_URL = "https://youtube.com/shorts/iK2Y47_1NIQ";

/** `https://youtube.com/shorts/<id>` → `https://www.youtube.com/embed/<id>`. */
export function shortEmbedUrl(url: string) {
  const id = url.match(/\/shorts\/([\w-]{11})/)?.[1];
  return id ? `https://www.youtube.com/embed/${id}` : null;
}
