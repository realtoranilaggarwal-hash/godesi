import Link from "next/link";
import { wallItems, WALL_TAG, type WallItem } from "@/lib/wall";
import { shortTime } from "@/lib/social";

const KIND_TONE: Record<WallItem["kind"], string> = {
  member: "bg-fuchsia-100 text-fuchsia-700",
  business: "bg-orange-100 text-orange-700",
  listing: "bg-emerald-100 text-emerald-700",
  event: "bg-sky-100 text-sky-700",
  report: "bg-amber-100 text-amber-700",
  social: "bg-slate-200 text-slate-700",
};

export function WallCard({ item }: { item: WallItem }) {
  const body = (
    <>
      <div className="flex items-center gap-2">
        {item.avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.avatarUrl}
            alt=""
            loading="lazy"
            className="h-7 w-7 shrink-0 rounded-full object-cover"
          />
        ) : (
          <span
            aria-hidden
            className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm ${
              KIND_TONE[item.kind]
            }`}
          >
            {item.icon}
          </span>
        )}
        <span className="min-w-0 flex-1 truncate text-xs font-bold text-slate-900">
          {item.title}
        </span>
        <span className="shrink-0 text-[11px] font-semibold text-slate-400">
          {shortTime(item.at)}
        </span>
      </div>
      <p className="mt-1 line-clamp-2 text-xs text-slate-600">{item.text}</p>
      {item.imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={item.imageUrl}
          alt=""
          loading="lazy"
          className="mt-2 h-24 w-full rounded-lg object-cover"
        />
      ) : null}
    </>
  );

  const className =
    "block rounded-xl border border-slate-200 bg-white p-3 transition hover:border-slate-300 hover:shadow-sm";

  return item.external ? (
    <a href={item.href} target="_blank" rel="noreferrer" className={className}>
      {body}
    </a>
  ) : (
    <Link href={item.href} className={className}>
      {body}
    </Link>
  );
}

/**
 * Compact live wall for a sidebar or an empty column: the newest happenings on
 * Godesi scroll past on their own, and hovering pauses them so a card can be
 * read and tapped.
 */
export async function ActivityWall({
  limit = 12,
  heading = `#${WALL_TAG} live wall`,
  className = "",
}: {
  limit?: number;
  heading?: string;
  className?: string;
}) {
  const items = await wallItems(limit);
  if (items.length < 3) return null;

  return (
    <section
      className={`min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 p-3 ${className}`}
    >
      <div className="flex items-center justify-between gap-2">
        <h2 className="flex items-center gap-1.5 text-sm font-black text-slate-900">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
          </span>
          {heading}
        </h2>
        <Link
          href="/buzz"
          className="text-[11px] font-bold text-indigo-600 hover:underline"
        >
          See all →
        </Link>
      </div>

      <div className="wall-scroller mt-2 h-[420px]">
        <div className="wall-track space-y-2">
          {items.map((item) => (
            <WallCard key={item.id} item={item} />
          ))}
          {/* Second pass makes the loop seamless. */}
          {items.map((item) => (
            <WallCard key={`loop-${item.id}`} item={item} />
          ))}
        </div>
      </div>
    </section>
  );
}
