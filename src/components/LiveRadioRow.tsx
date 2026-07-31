"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { openLiveMedia } from "@/lib/liveMedia";
import { LiveReportButton } from "@/components/LiveReportButton";
import { LiveVoteButton } from "@/components/LiveVoteButton";
import { LiveShareButton } from "@/components/LiveShareButton";
import { LiveFavoriteButton } from "@/components/LiveFavoriteButton";

/**
 * Slim station row. Radio has nothing to look at, so the embed lives in the
 * floating mini player and the list stays compact — twice as many stations fit
 * on a phone screen as the old card grid.
 */
export function LiveRadioRow({
  id,
  name,
  place,
  src,
  stream = false,
  featured = false,
  about = null,
  websiteUrl = null,
  nonProfit = false,
  votes = 0,
  saved = false,
  signedIn = false,
}: {
  id: string;
  name: string;
  place: string;
  src: string;
  stream?: boolean;
  featured?: boolean;
  about?: string | null;
  websiteUrl?: string | null;
  nonProfit?: boolean;
  votes?: number;
  saved?: boolean;
  signedIn?: boolean;
}) {
  const params = useSearchParams();
  const kind = stream ? "stream" : "radio";

  useEffect(() => {
    if (params.get("play") === id) openLiveMedia({ kind, id, name, src });
  }, [params, kind, id, name, src]);

  return (
    <li
      className={`flex min-w-0 flex-wrap items-center gap-2 rounded-xl border p-2 ${
        featured ? "border-amber-400 bg-amber-50/60" : "border-slate-200"
      }`}
    >
      <button
        type="button"
        onClick={() => openLiveMedia({ kind, id, name, src })}
        title={`Play ${name}`}
        className="shrink-0 rounded-lg bg-emerald-600 px-2.5 py-1.5 text-xs font-bold text-white hover:bg-emerald-700"
      >
        ▶ Play
      </button>

      <div className="min-w-0 flex-1 basis-40">
        <p className="truncate text-sm font-bold text-slate-900">
          {featured ? "⭐ " : ""}
          {name}
          {nonProfit ? (
            <span className="ml-2 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-800">
              Non-profit
            </span>
          ) : null}
        </p>
        <p className="truncate text-xs text-slate-500">
          {place}
          {about ? ` · ${about}` : ""}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        <LiveVoteButton channelKey={id} kind="radio" label={name} votes={votes} />
        <LiveFavoriteButton
          channelKey={id}
          kind="radio"
          label={name}
          saved={saved}
          signedIn={signedIn}
        />
        <LiveShareButton
          path={`/live-radio?play=${id}`}
          label={name}
          kind="radio"
        />
        {websiteUrl ? (
          <a
            href={websiteUrl}
            target="_blank"
            rel="noreferrer nofollow"
            className="text-xs font-semibold text-indigo-600 hover:underline"
          >
            Site ↗
          </a>
        ) : null}
        <LiveReportButton channelKey={id} kind="radio" label={name} />
      </div>
    </li>
  );
}
