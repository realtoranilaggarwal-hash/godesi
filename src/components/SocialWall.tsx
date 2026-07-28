import Link from "next/link";
import {
  HASHTAG_LINKS,
  PLATFORM_ICONS,
  PLATFORM_LABELS,
  SOCIAL_TAG,
  shortTime,
  socialWallPosts,
  type SocialWallPost,
} from "@/lib/social";

function Post({ post }: { post: SocialWallPost }) {
  return (
    <a
      href={post.url}
      target="_blank"
      rel="noreferrer"
      className="block rounded-xl border border-slate-200 bg-white p-3 transition hover:border-slate-300 hover:shadow-sm"
    >
      <div className="flex items-center gap-2">
        {post.avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={post.avatarUrl}
            alt={post.author}
            className="h-7 w-7 rounded-full object-cover"
          />
        ) : (
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-slate-800 to-slate-600 text-xs font-black text-white">
            {post.author.slice(0, 1).toUpperCase()}
          </span>
        )}
        <span className="min-w-0 flex-1 truncate text-xs font-bold text-slate-900">
          {post.author}
          {post.handle ? (
            <span className="ml-1 font-medium text-slate-500">{post.handle}</span>
          ) : null}
        </span>
        <span
          title={PLATFORM_LABELS[post.platform]}
          className="text-[11px] font-bold text-slate-400"
        >
          {PLATFORM_ICONS[post.platform]} · {shortTime(post.postedAt)}
        </span>
      </div>
      <p className="mt-2 line-clamp-4 text-xs text-slate-700">{post.text}</p>
      {post.imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={post.imageUrl}
          alt=""
          loading="lazy"
          className="mt-2 h-28 w-full rounded-lg object-cover"
        />
      ) : null}
    </a>
  );
}

/**
 * "#godesi around the web" rail. Posts are curated by staff from public links,
 * so nothing is scraped and every card sends the reader to the original author.
 */
export async function SocialWall({
  limit = 4,
  heading = `#${SOCIAL_TAG} around the web`,
}: {
  limit?: number;
  heading?: string;
}) {
  const posts = await socialWallPosts(limit);
  if (!posts.length) return null;

  return (
    <section className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-sm font-black text-slate-900">{heading}</h2>
        <a
          href={HASHTAG_LINKS.X}
          target="_blank"
          rel="noreferrer"
          className="text-[11px] font-bold text-indigo-600 hover:underline"
        >
          See all ↗
        </a>
      </div>
      <p className="mt-0.5 text-[11px] text-slate-500">
        Real posts from the community, picked by our team.
      </p>
      <div className="mt-2 space-y-2">
        {posts.map((post) => (
          <Post key={post.id} post={post} />
        ))}
      </div>
      <div className="mt-2 flex items-center justify-between gap-2">
        <Link
          href="/buzz"
          className="text-[11px] font-bold text-slate-600 hover:underline"
        >
          More #{SOCIAL_TAG} posts →
        </Link>
        <a
          href={`https://x.com/intent/tweet?text=${encodeURIComponent(
            `Found this on Godesi — the desi directory & marketplace: https://godesi.com #${SOCIAL_TAG}`,
          )}`}
          target="_blank"
          rel="noreferrer"
          className="rounded-full bg-slate-900 px-2.5 py-1 text-[11px] font-bold text-white hover:bg-slate-700"
        >
          Post with #{SOCIAL_TAG}
        </a>
      </div>
    </section>
  );
}

export { Post as SocialWallCard };
