import { LiveReportButton } from "@/components/LiveReportButton";
import { LiveVoteButton } from "@/components/LiveVoteButton";
import { LiveShareButton } from "@/components/LiveShareButton";

/**
 * A channel that is not streaming right now. Embedding it would only show
 * YouTube's "video unavailable" box, so it is listed instead with a link to the
 * broadcaster's own live page.
 */
export function LiveOffAirRow({
  id,
  name,
  place,
  websiteUrl,
  votes,
}: {
  id: string;
  name: string;
  place: string;
  websiteUrl: string | null;
  votes: number;
}) {
  return (
    <li className="flex min-w-0 flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 p-2">
      <span className="shrink-0 rounded-lg bg-slate-200 px-2 py-1 text-[11px] font-bold text-slate-600">
        Off air
      </span>
      <div className="min-w-0 flex-1 basis-40">
        <p className="truncate text-sm font-bold text-slate-900">{name}</p>
        <p className="truncate text-xs text-slate-500">{place}</p>
      </div>
      <div className="flex flex-wrap items-center gap-1.5">
        <LiveVoteButton channelKey={id} kind="tv" label={name} votes={votes} />
        <LiveShareButton path={`/live-tv?play=${id}`} label={name} kind="tv" />
        {websiteUrl ? (
          <a
            href={websiteUrl}
            target="_blank"
            rel="noreferrer nofollow"
            className="text-xs font-semibold text-indigo-600 hover:underline"
          >
            Check on YouTube ↗
          </a>
        ) : null}
        <LiveReportButton channelKey={id} kind="tv" label={name} />
      </div>
    </li>
  );
}
