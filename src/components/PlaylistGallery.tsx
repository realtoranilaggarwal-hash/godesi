import { PlaylistPlayer } from "@/components/PlaylistPlayer";
import {
  FEED_LIMIT,
  playlistId,
  playlistPageUrl,
  playlistPreview,
} from "@/lib/youtubePlaylist";

/**
 * A member's public YouTube playlist: YouTube's playlist player (every video),
 * plus the newest ones as tiles when the feed is readable. YouTube serves the
 * videos and thumbnails; Godesi stores only the link.
 */
export async function PlaylistGallery({
  url,
  owner,
  heading = "Videos",
}: {
  url: string | null;
  owner: string;
  heading?: string;
}) {
  const id = playlistId(url);
  if (!id) return null;

  const { title, videos } = await playlistPreview(id);
  const page = playlistPageUrl(id);

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="text-lg font-bold text-slate-900">{heading}</h2>
        <a
          href={page}
          target="_blank"
          rel="noreferrer nofollow"
          className="text-sm font-semibold text-indigo-700 underline"
        >
          Open on YouTube →
        </a>
      </div>
      {title ? <p className="text-sm text-slate-500">{title}</p> : null}

      <div className="mt-3">
        <PlaylistPlayer playlistId={id} videos={videos} owner={owner} />
      </div>
      {videos.length >= FEED_LIMIT ? (
        <p className="mt-2 text-xs text-slate-500">
          Newest {FEED_LIMIT} shown as tiles — use the player&apos;s list (top
          right) or open on YouTube for the rest.
        </p>
      ) : null}
      {!videos.length ? (
        <p className="mt-2 text-xs text-slate-500">
          Use the player&apos;s list (top right) to pick a video. If nothing
          plays, make sure the playlist is Public or Unlisted on YouTube.
        </p>
      ) : null}
    </section>
  );
}
