"use client";

import Link from "next/link";
import { useState } from "react";
import { toggleLiveFavoriteAction } from "@/app/actions/liveChannels";

/** Star a station. Signed-out visitors keep listening; they just get the offer. */
export function LiveFavoriteButton({
  channelKey,
  kind,
  label,
  saved,
  signedIn,
}: {
  channelKey: string;
  kind: "radio" | "tv";
  label: string;
  saved: boolean;
  signedIn: boolean;
}) {
  const [on, setOn] = useState(saved);

  if (!signedIn) {
    return (
      <Link
        href={`/signup?next=${encodeURIComponent(
          kind === "tv" ? "/live-tv" : "/live-radio",
        )}`}
        title="Sign up free to save your favourite stations"
        className="rounded-lg border border-slate-300 px-2.5 py-1 text-xs font-bold text-slate-700 hover:bg-slate-50"
      >
        ☆ Save
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={async () => {
        setOn((current) => !current);
        const data = new FormData();
        data.set("channelKey", channelKey);
        data.set("kind", kind === "tv" ? "TV" : "RADIO");
        data.set("label", label);
        await toggleLiveFavoriteAction(data);
      }}
      title={on ? `Remove ${label} from your favourites` : `Save ${label}`}
      className={`rounded-lg border px-2.5 py-1 text-xs font-bold ${
        on
          ? "border-amber-300 bg-amber-50 text-amber-700"
          : "border-slate-300 text-slate-700 hover:bg-slate-50"
      }`}
    >
      {on ? "★ Saved" : "☆ Save"}
    </button>
  );
}
