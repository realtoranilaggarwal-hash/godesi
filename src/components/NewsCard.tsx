import Link from "next/link";
import { featureNewsAction, voteNewsAction } from "@/app/actions/newsVotes";

export type NewsListItem = {
  id: string;
  title: string;
  summary: string;
  imageUrl: string | null;
  link: string;
  source: string;
  publishedAt: Date;
  featured?: boolean;
  score?: number;
  submittedBy?: {
    name: string;
    username: string | null;
    avatarUrl: string | null;
  } | null;
};

function timeAgo(date: Date) {
  const minutes = Math.round((Date.now() - date.getTime()) / 60000);
  if (minutes < 60) return `${Math.max(1, minutes)}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
}

function Poster({
  poster,
}: {
  poster: NonNullable<NewsListItem["submittedBy"]>;
}) {
  const avatar = poster.avatarUrl ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={poster.avatarUrl}
      alt=""
      className="h-6 w-6 rounded-full object-cover"
      loading="lazy"
    />
  ) : (
    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-fuchsia-500 to-indigo-500 text-[11px] font-bold text-white">
      {poster.name.slice(0, 1).toUpperCase()}
    </span>
  );

  const label = (
    <span className="flex items-center gap-1.5 text-xs text-slate-500">
      {avatar}
      <span className="font-semibold text-slate-600">{poster.name}</span>
    </span>
  );

  return poster.username ? (
    <Link href={`/${poster.username}`} className="hover:opacity-80">
      {label}
    </Link>
  ) : (
    label
  );
}

/** Up/down vote buttons; signed-out members are sent to login. */
function Votes({
  item,
  vote,
  canVote,
}: {
  item: NewsListItem;
  vote: number;
  canVote: boolean;
}) {
  const buttonClass = (active: boolean) =>
    `rounded-lg border px-2 py-0.5 text-xs font-bold ${
      active
        ? "border-indigo-400 bg-indigo-50 text-indigo-700"
        : "border-slate-200 text-slate-500 hover:bg-slate-50"
    }`;

  if (!canVote) {
    return (
      <div className="flex items-center gap-1">
        <Link href="/login?next=/news" className={buttonClass(false)}>
          ▲
        </Link>
        <span className="text-xs font-bold text-slate-600">{item.score ?? 0}</span>
        <Link href="/login?next=/news" className={buttonClass(false)}>
          ▼
        </Link>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1">
      <form action={voteNewsAction}>
        <input type="hidden" name="id" value={item.id} />
        <input type="hidden" name="value" value="1" />
        <button type="submit" aria-label="Upvote" className={buttonClass(vote > 0)}>
          ▲
        </button>
      </form>
      <span className="text-xs font-bold text-slate-600">{item.score ?? 0}</span>
      <form action={voteNewsAction}>
        <input type="hidden" name="id" value={item.id} />
        <input type="hidden" name="value" value="-1" />
        <button type="submit" aria-label="Downvote" className={buttonClass(vote < 0)}>
          ▼
        </button>
      </form>
    </div>
  );
}

export function NewsCard({
  item,
  vote = 0,
  canVote = false,
  canFeature = false,
}: {
  item: NewsListItem;
  /** This member's vote: 1, -1 or 0. */
  vote?: number;
  canVote?: boolean;
  canFeature?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border bg-white p-3 shadow-sm transition hover:shadow-md ${
        item.featured ? "border-amber-300 ring-1 ring-amber-200" : "border-slate-200"
      }`}
    >
      <a href={item.link} target="_blank" rel="noreferrer" className="flex gap-3">
        {item.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.imageUrl}
            alt=""
            className="h-20 w-28 shrink-0 rounded-xl object-cover"
            loading="lazy"
          />
        ) : (
          <div className="flex h-20 w-28 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500 to-indigo-500 text-2xl">
            📰
          </div>
        )}
        <div className="min-w-0">
          {item.featured ? (
            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-700">
              ⭐ Important
            </span>
          ) : null}
          <h3 className="line-clamp-2 font-semibold leading-snug">{item.title}</h3>
          <p className="mt-1 line-clamp-2 text-sm text-slate-600">{item.summary}</p>
          <p className="mt-1 text-xs text-slate-400">
            {item.source} · {timeAgo(item.publishedAt)}
          </p>
        </div>
      </a>
      <div className="mt-2 flex items-center justify-between gap-2 border-t border-slate-100 pt-2">
        {item.submittedBy ? (
          <Poster poster={item.submittedBy} />
        ) : (
          <span className="text-xs text-slate-400">Godesi news desk</span>
        )}
        <div className="flex items-center gap-2">
          {canFeature ? (
            <form action={featureNewsAction}>
              <input type="hidden" name="id" value={item.id} />
              <button
                type="submit"
                className="rounded-lg border border-amber-300 px-2 py-0.5 text-xs font-bold text-amber-700 hover:bg-amber-50"
              >
                {item.featured ? "Unpin" : "⭐ Important"}
              </button>
            </form>
          ) : null}
          <Votes item={item} vote={vote} canVote={canVote} />
        </div>
      </div>
    </div>
  );
}
