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

/** Latest Chatter posts plus a quick composer; rendered once per page load, never polled. */
export async function ChatterHomeBox() {
  const [user, feed] = await Promise.all([
    optionalRead(() => cachedCurrentUser(), null),
    optionalRead(() => chatterFeed({}), { posts: [], nextBefore: null }),
  ]);
  const posts = feed.posts.slice(0, 4);

  return (
    <section className="rounded-2xl border border-fuchsia-200 bg-gradient-to-br from-orange-50 via-rose-50 to-fuchsia-50 p-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-lg font-black text-slate-900">
          💬 GoDesi Chatter{" "}
          <span className="text-sm font-semibold text-fuchsia-700">
            Are you a Gapodi?
          </span>
        </h2>
        <Link
          href="/chatter"
          className="text-xs font-semibold text-indigo-700 underline"
        >
          Open Chatter
        </Link>
      </div>
      <div className="mt-3 grid gap-4 lg:grid-cols-2">
        <div>
          {user ? (
            <ChatterComposer uploads={false} />
          ) : (
            <p className="rounded-xl bg-white p-3 text-sm text-slate-700">
              Say something to the community: food, cricket, Bollywood, jobs,
              local news.{" "}
              <Link
                href={`/login?next=${encodeURIComponent("/chatter")}`}
                className="font-bold text-orange-700 underline"
              >
                Log in
              </Link>{" "}
              or{" "}
              <Link
                href="/signup"
                className="font-bold text-orange-700 underline"
              >
                join free
              </Link>{" "}
              to post.
            </p>
          )}
        </div>
        <ul className="space-y-2">
          {posts.length ? (
            posts.map((post) => (
              <li key={post.id}>
                <Link
                  href={chatterPath(post.id)}
                  className="block rounded-xl bg-white p-2.5 text-sm hover:bg-orange-50"
                >
                  <span className="font-bold text-slate-900">
                    {properName(post.author.name)}
                  </span>{" "}
                  <span className="text-xs text-slate-500">
                    · {chatterAge(post.createdAt)}
                  </span>
                  <span className="block text-slate-700">
                    {chatterExcerpt(post.body, 120)}
                  </span>
                </Link>
              </li>
            ))
          ) : (
            <li className="rounded-xl bg-white p-3 text-sm text-slate-600">
              No posts yet. Be the first to say hello!
            </li>
          )}
        </ul>
      </div>
    </section>
  );
}
