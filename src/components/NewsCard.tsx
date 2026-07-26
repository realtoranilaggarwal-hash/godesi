export type NewsListItem = {
  id: string;
  title: string;
  summary: string;
  imageUrl: string | null;
  link: string;
  source: string;
  publishedAt: Date;
};

function timeAgo(date: Date) {
  const minutes = Math.round((Date.now() - date.getTime()) / 60000);
  if (minutes < 60) return `${Math.max(1, minutes)}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
}

export function NewsCard({ item }: { item: NewsListItem }) {
  return (
    <a
      href={item.link}
      target="_blank"
      rel="noreferrer"
      className="flex gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm transition hover:shadow-md"
    >
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
        <h3 className="line-clamp-2 font-semibold leading-snug">{item.title}</h3>
        <p className="mt-1 line-clamp-2 text-sm text-slate-600">{item.summary}</p>
        <p className="mt-1 text-xs text-slate-400">
          {item.source} · {timeAgo(item.publishedAt)}
        </p>
      </div>
    </a>
  );
}
