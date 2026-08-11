import type { Metadata } from "next";
import Link from "next/link";
import { SidebarBanners } from "@/components/Banners";
import { SocialWallCard } from "@/components/SocialWall";
import { Card, EmptyState } from "@/components/ui";
import { HASHTAG_LINKS, PLATFORM_LABELS, SOCIAL_TAG, socialWallPosts } from "@/lib/social";
import { wallItems } from "@/lib/wall";
import { WallCard } from "@/components/ActivityWall";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: `#${SOCIAL_TAG} — the community around Godesi`,
  description: `Posts tagged #${SOCIAL_TAG} from X, Instagram and more, picked by the Godesi team.`,
  alternates: { canonical: "/buzz" },
};

export default async function BuzzPage() {
  const [posts, live] = await Promise.all([socialWallPosts(40), wallItems(30)]);

  return (
    <div className="flex gap-6">
      <div className="min-w-0 flex-1 space-y-5">
        <section className="rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-800 to-fuchsia-700 px-5 py-8 text-white sm:px-8">
          <h1 className="text-3xl font-black">#{SOCIAL_TAG} around the web 🌍</h1>
          <p className="mt-2 max-w-2xl text-white/90">
            Everything happening around Godesi in one place — new members, new
            business cards, rooms and rentals, events and local news reports as
            they land, plus posts our team picked from X, Instagram, Facebook,
            LinkedIn, YouTube and Threads.
          </p>
          <div className="mt-4 flex flex-wrap gap-2 text-sm font-bold">
            <a
              href={`https://x.com/intent/tweet?text=${encodeURIComponent(
                `Listing my business on Godesi — the desi directory & marketplace: https://godesi.com #${SOCIAL_TAG}`,
              )}`}
              target="_blank"
              rel="noreferrer"
              className="rounded-xl bg-white/95 px-3 py-1.5 text-slate-900 hover:bg-white"
            >
              Post with #{SOCIAL_TAG}
            </a>
            <Link
              href="/signup"
              className="rounded-xl bg-white/20 px-3 py-1.5 text-white hover:bg-white/30"
            >
              List your business free
            </Link>
          </div>
        </section>

        <Card>
          <h2 className="text-sm font-bold text-slate-900">Follow the tag</h2>
          <div className="mt-2 flex flex-wrap gap-2">
            {Object.entries(HASHTAG_LINKS).map(([platform, href]) => (
              <a
                key={platform}
                href={href}
                target="_blank"
                rel="noreferrer"
                className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-200"
              >
                {PLATFORM_LABELS[platform as keyof typeof PLATFORM_LABELS]} ↗
              </a>
            ))}
          </div>
        </Card>

        {live.length ? (
          <section>
            <h2 className="text-lg font-bold">Live on Godesi 🟢</h2>
            <div className="mt-2 grid gap-3 sm:grid-cols-2">
              {live.map((item) => (
                <WallCard key={item.id} item={item} />
              ))}
            </div>
          </section>
        ) : (
          <EmptyState
            title="The wall is warming up"
            body="New members, cards, events and local reports appear here the moment they are posted."
          />
        )}

        {posts.length ? (
          <section>
            <h2 className="text-lg font-bold">Picked from other networks 💬</h2>
            <div className="mt-2 grid gap-3 sm:grid-cols-2">
              {posts.map((post) => (
                <SocialWallCard key={post.id} post={post} />
              ))}
            </div>
          </section>
        ) : null}

        <p className="rounded-2xl bg-slate-100 px-3 py-2 text-xs text-slate-600">
          Posts belong to their authors and are shown as a short quote with a link to
          the original. Nothing is scraped, and we remove any post on request.
        </p>
      </div>
      <SidebarBanners />
    </div>
  );
}
