"use client";

import { useState } from "react";
import { playlistEmbedUrl, type PlaylistVideo } from "@/lib/youtubePlaylist";

/**
 * YouTube's playlist player on top — it carries every video in the playlist
 * with its own list drawer — and, when the feed could be read, the newest
 * videos as tiles below; tap a tile to jump the player to that video.
 */
export function PlaylistPlayer({
  playlistId,
  videos,
  owner,
}: {
  playlistId: string;
  videos: PlaylistVideo[];
  owner: string;
}) {
  const [current, setCurrent] = useState<PlaylistVideo | null>(null);

  const src = current
    ? `https://www.youtube-nocookie.com/embed/${current.id}?list=${playlistId}`
    : playlistEmbedUrl(playlistId);

  return (
    <div className="space-y-3">
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-black">
        <div className="relative aspect-video">
          <iframe
            key={src}
            src={src}
            title={current?.title || `${owner} playlist`}
            loading="lazy"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="absolute inset-0 h-full w-full"
          />
        </div>
      </div>
      {videos.length ? (
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5">
          {videos.map((video) => (
            <button
              key={video.id}
              type="button"
              onClick={() => setCurrent(video)}
              title={video.title}
              className={`overflow-hidden rounded-xl border-2 bg-slate-100 text-left transition hover:-translate-y-0.5 ${
                video.id === current?.id
                  ? "border-indigo-500"
                  : "border-transparent"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={video.thumbnail}
                alt={video.title}
                loading="lazy"
                className="aspect-video w-full object-cover"
              />
              <span className="line-clamp-2 px-1.5 py-1 text-[11px] font-semibold leading-tight text-slate-700">
                {video.title}
              </span>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
