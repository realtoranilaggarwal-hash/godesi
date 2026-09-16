import { PlaylistPlayer } from "@/components/PlaylistPlayer";
import {
  playlistId,
  playlistPageUrl,
  playlistPreview,
} from "@/lib/youtubePlaylist";

/**
 * Every video in a member's public YouTube playlist, read from YouTube's own
 * feed. YouTube serves the videos and thumbnails; Godesi stores only the link.
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

      {videos.length ? (
        <div className="mt-3">
          <PlaylistPlayer videos={videos} owner={owner} />
        </div>
      ) : (
        <p className="mt-3 text-sm text-slate-500">
          No videos could be read from this playlist — make sure it is Public or
          Unlisted, or{" "}
          <a
            href={page}
            target="_blank"
            rel="noreferrer nofollow"
            className="underline"
          >
            open it on YouTube
          </a>
          .
        </p>
      )}
    </section>
  );
}
