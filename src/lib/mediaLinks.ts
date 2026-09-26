import { isAlbumLink } from "@/lib/photoAlbum";
import { isSupportedVideoUrl } from "@/lib/video";
import { isPlaylistLink } from "@/lib/youtubePlaylist";

/**
 * Members paste YouTube, Vimeo and Google Photos links into free-text boxes
 * (bio, experience, description), where they print as plain links. On save we
 * lift those links out of the text and into the fields that render them as a
 * player or gallery, so the text keeps only what is meant to be read.
 */

const URL_RE = /https?:\/\/[^\s<>"']+/g;

export type HarvestedMedia = {
  /** The text with media links removed and blank lines collapsed. */
  text: string;
  videos: string[];
  playlists: string[];
  albums: string[];
};

export function harvestMediaLinks(text: string): HarvestedMedia {
  const videos: string[] = [];
  const playlists: string[] = [];
  const albums: string[] = [];

  const cleaned = text.replace(URL_RE, (raw) => {
    const url = raw.replace(/[.,;:)]+$/, "");
    if (isPlaylistLink(url)) playlists.push(url);
    else if (isSupportedVideoUrl(url)) videos.push(url);
    else if (isAlbumLink(url)) albums.push(url);
    else return raw;
    return "";
  });

  const lines = cleaned
    .split(/\r?\n/)
    .map((line) => line.replace(/[ \t]+/g, " ").trim())
    .filter(Boolean);

  return { text: lines.join("\n"), videos, playlists, albums };
}

/** Appends fresh links to an existing list without repeats, up to `max`. */
export function mergeLinks(existing: string[], fresh: string[], max: number) {
  const seen = new Set(existing);
  const out = [...existing];
  for (const link of fresh) {
    if (out.length >= max) break;
    if (seen.has(link)) continue;
    seen.add(link);
    out.push(link);
  }
  return out;
}
