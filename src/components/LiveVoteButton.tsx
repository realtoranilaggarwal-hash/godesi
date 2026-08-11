"use client";

import { useEffect, useState } from "react";
import { voteLiveChannelAction } from "@/app/actions/liveChannels";

const STORE_KEY = "godesi-live-votes";

function voted(channelKey: string) {
  if (typeof window === "undefined") return false;
  try {
    const raw = window.localStorage.getItem(STORE_KEY);
    return raw ? (JSON.parse(raw) as string[]).includes(channelKey) : false;
  } catch {
    return false;
  }
}

function remember(channelKey: string) {
  try {
    const raw = window.localStorage.getItem(STORE_KEY);
    const list = raw ? (JSON.parse(raw) as string[]) : [];
    if (!list.includes(channelKey)) list.push(channelKey);
    window.localStorage.setItem(STORE_KEY, JSON.stringify(list));
  } catch {
    /* private browsing — the vote still counted server-side */
  }
}

/** "Love this station" — the tally ranks community favourites. */
export function LiveVoteButton({
  channelKey,
  kind,
  label,
  votes,
}: {
  channelKey: string;
  kind: "radio" | "tv";
  label: string;
  votes: number;
}) {
  const [count, setCount] = useState(votes);
  const [done, setDone] = useState(false);

  useEffect(() => {
    setDone(voted(channelKey));
  }, [channelKey]);

  return (
    <button
      type="button"
      disabled={done}
      onClick={async () => {
        setDone(true);
        setCount((current) => current + 1);
        remember(channelKey);
        const data = new FormData();
        data.set("channelKey", channelKey);
        data.set("kind", kind === "tv" ? "TV" : "RADIO");
        data.set("label", label);
        await voteLiveChannelAction(data);
      }}
      title={done ? "You voted for this one" : `Vote for ${label}`}
      className={`rounded-lg border px-2.5 py-1 text-xs font-bold ${
        done
          ? "border-rose-200 bg-rose-50 text-rose-600"
          : "border-slate-300 text-slate-700 hover:bg-slate-50"
      }`}
    >
      {done ? "❤️" : "🤍"} {count}
    </button>
  );
}
