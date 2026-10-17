import Link from "next/link";
import { cachedCurrentUser } from "@/lib/auth";
import { chatterExcerpt, chatterFeed, chatterPath } from "@/lib/chatter";
import { properName } from "@/lib/names";
import { optionalRead } from "@/lib/resilient";
import { ChatterQuickPost } from "@/components/chatter/ChatterQuickPost";

/** Signed-in members only: slim one-line Chatter strip; rendered once per page load, never polled. */
export async function ChatterHomeBox() {
  const user = await optionalRead(() => cachedCurrentUser(), null);
  if (!user) return null;
  const feed = await optionalRead(() => chatterFeed({}), {
    posts: [],
    nextBefore: null,
  });
  const latest = feed.posts[0];

  return (
    <section className="flex flex-wrap items-center gap-x-3 gap-y-2 rounded-2xl border border-orange-200 bg-gradient-to-r from-orange-50 to-rose-50 px-3 py-2">
      <Link
        href="/chatter"
        className="flex shrink-0 items-center gap-1.5"
        aria-label="Open GoDesi Chatter"
      >
        <span
          aria-hidden
          className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-200 text-lg"
        >
          🧔
        </span>
        <span className="relative rounded-xl bg-white px-2 py-1 text-xs font-bold text-orange-800 shadow-sm before:absolute before:-left-1 before:top-1/2 before:h-2 before:w-2 before:-translate-y-1/2 before:rotate-45 before:bg-white">
          Be a Gapodi, talk your heart out! 💬
        </span>
      </Link>
      <ChatterQuickPost />
      {latest ? (
        <Link
          href={chatterPath(latest.id)}
          className="hidden max-w-xs truncate text-xs text-slate-600 hover:text-slate-900 xl:block"
        >
          <span className="font-semibold">
            {properName(latest.author.name)}:
          </span>{" "}
          {chatterExcerpt(latest.body, 60)}
        </Link>
      ) : null}
    </section>
  );
}
