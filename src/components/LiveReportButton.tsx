"use client";

import { useState } from "react";
import { reportLiveChannelAction } from "@/app/actions/liveChannels";

/** "Not working?" — visitors flag dead streams so the desk can swap them out. */
export function LiveReportButton({
  channelKey,
  kind,
  label,
}: {
  channelKey: string;
  kind: "radio" | "tv";
  label: string;
}) {
  const [open, setOpen] = useState(false);
  const [sent, setSent] = useState(false);

  if (sent) {
    return (
      <span className="text-xs font-semibold text-emerald-700">
        Thanks — reported ✓
      </span>
    );
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-xs font-semibold text-slate-500 hover:text-rose-600 hover:underline"
      >
        🚩 Not working?
      </button>
    );
  }

  return (
    <form
      action={async (formData: FormData) => {
        await reportLiveChannelAction(formData);
        setSent(true);
      }}
      className="flex w-full flex-wrap items-center gap-2"
    >
      <input type="hidden" name="channelKey" value={channelKey} />
      <input type="hidden" name="kind" value={kind === "tv" ? "TV" : "RADIO"} />
      <input type="hidden" name="label" value={label} />
      <input
        name="note"
        placeholder="What happens? (optional)"
        className="min-w-0 flex-1 rounded-lg border border-slate-300 px-2 py-1 text-xs"
      />
      <button
        type="submit"
        className="rounded-lg bg-rose-600 px-2.5 py-1 text-xs font-bold text-white"
      >
        Report
      </button>
      <button
        type="button"
        onClick={() => setOpen(false)}
        className="text-xs font-semibold text-slate-500"
      >
        Cancel
      </button>
    </form>
  );
}
