import Link from "next/link";
import { cachedCurrentUser } from "@/lib/auth";
import {
  chatterAge,
  chatterExcerpt,
  chatterFeed,
  chatterPath,
} from "@/lib/chatter";
import { properName } from "@/lib/names";
import { optionalRead } from "@/lib/resilient";
import { ChatterComposer } from "@/components/chatter/ChatterComposer";
import { VillageChatScene } from "@/components/chatter/VillageChatScene";

const STARTERS = [
  "🏏 Who's watching the match tonight?",
  "🍛 Best biryani in your city?",
  "🎬 Which Bollywood film should I watch?",
];

/** Signed-in members only: village chit-chat scene, quick composer and latest posts; rendered once per page load, never polled. */
export async function ChatterHomeBox() {
  const user = await optionalRead(() => cachedCurrentUser(), null);
  if (!user) return null;
  const feed = await optionalRead(() => chatterFeed({}), {
    posts: [],
    nextBefore: null,
  });
  const posts = feed.posts.slice(0, 3);

  return (
    <section className="overflow-hidden rounded-2xl border border-orange-200 bg-gradient-to-br from-orange-50 via-amber-50 to-rose-50">
      <div className="grid md:grid-cols-[220px_minmax(0,1fr)] lg:grid-cols-[240px_minmax(0,1fr)_minmax(0,1fr)]">
        <Link
          href="/chatter"
          className="relative block min-h-[190px] md:min-h-0"
          aria-label="Open GoDesi Chatter"
        >
          <VillageChatScene className="absolute inset-0 h-full w-full" />
        </Link>
        <div className="p-3">
          <div className="mb-2 flex items-baseline justify-between gap-2">
            <h2 className="text-base font-black text-slate-900">
              💬 Chai pe charcha{" "}
              <span className="text-xs font-semibold text-orange-700">
                Are you a Gapodi?
              </span>
            </h2>
            <Link
              href="/chatter"
              className="shrink-0 text-xs font-semibold text-indigo-700 underline"
            >
              Open Chatter
            </Link>
          </div>
          <ChatterComposer uploads={false} />
        </div>
        <ul className="space-y-1.5 border-t border-orange-100 p-3 md:col-span-2 lg:col-span-1 lg:border-l lg:border-t-0">
          {posts.map((post) => (
            <li key={post.id}>
              <Link
                href={chatterPath(post.id)}
                className="block rounded-xl bg-white/90 px-2.5 py-2 text-sm hover:bg-white"
              >
                <span className="font-bold text-slate-900">
                  {properName(post.author.name)}
                </span>{" "}
                <span className="text-xs text-slate-500">
                  · {chatterAge(post.createdAt)}
                </span>
                <span className="block text-slate-700">
                  {chatterExcerpt(post.body, 100)}
                </span>
              </Link>
            </li>
          ))}
          {STARTERS.slice(0, Math.max(0, 3 - posts.length)).map((starter) => (
            <li
              key={starter}
              className="rounded-xl border border-dashed border-orange-300 bg-white/60 px-2.5 py-2 text-sm text-slate-600"
            >
              {starter}{" "}
              <span className="text-xs text-orange-700">Say yours ←</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
