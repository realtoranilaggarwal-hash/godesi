import type { ReactNode } from "react";
import { GODESI_SHORTS_PLAYLIST, shortEmbedUrl } from "@/lib/godesiVideos";

/**
 * A GoDesi Short beside a heading and one line of text. The vertical player
 * stays small (about phone-thumbnail size) so the card never turns into a
 * big half-empty box.
 */
export function ShortVideoCard({
  video,
  heading,
  note,
  tone = "plain",
  showPlaylist = false,
  className = "",
  children,
}: {
  video: string;
  heading: string;
  note?: ReactNode;
  tone?: "plain" | "gradient";
  showPlaylist?: boolean;
  className?: string;
  children?: ReactNode;
}) {
  const src = shortEmbedUrl(video);
  if (!src) return null;
  const gradient = tone === "gradient";

  return (
    <section
      className={`flex flex-col items-center gap-4 rounded-2xl p-4 shadow-sm sm:flex-row sm:items-center sm:p-5 ${
        gradient
          ? "bg-gradient-to-r from-amber-500 via-orange-500 to-rose-600 text-white"
          : "border border-slate-200 bg-white text-slate-900"
      } ${className}`}
    >
      <div className="w-40 shrink-0 overflow-hidden rounded-xl bg-black shadow sm:w-44">
        <div className="relative aspect-[9/16]">
          <iframe
            src={`${src}?rel=0&playsinline=1`}
            title={heading}
            loading="lazy"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="absolute inset-0 h-full w-full border-0"
          />
        </div>
      </div>
      <div className="min-w-0 flex-1 text-center sm:text-left">
        <h2 className="break-words text-lg font-black leading-snug">{heading}</h2>
        {note ? (
          <p
            className={`mt-1 text-sm ${gradient ? "text-white/90" : "text-slate-600"}`}
          >
            {note}
          </p>
        ) : null}
        {children}
        <div className="mt-3 flex flex-wrap justify-center gap-x-4 gap-y-1 text-sm font-bold sm:justify-start">
          <a
            href={video}
            target="_blank"
            rel="noreferrer"
            className={gradient ? "text-white underline" : "text-indigo-700 underline"}
          >
            Watch on YouTube ↗
          </a>
          {showPlaylist ? (
            <a
              href={GODESI_SHORTS_PLAYLIST}
              target="_blank"
              rel="noreferrer"
              className={gradient ? "text-white underline" : "text-indigo-700 underline"}
            >
              All GoDesi Shorts ↗
            </a>
          ) : null}
        </div>
      </div>
    </section>
  );
}
