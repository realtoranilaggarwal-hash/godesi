import { AdminTabs } from "@/components/AdminTabs";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { can, getCurrentUser, isStaff } from "@/lib/auth";
import { featureNewsAction } from "@/app/actions/newsVotes";
import {
  deleteNewsAction,
  setClassifiedStatusAction,
  setEventStatusAction,
  setNewsStatusAction,
} from "@/app/actions/admin";
import { deleteBlogPostAction, toggleBlogPostAction } from "@/app/actions/blog";
import { BlogPostForm } from "@/components/forms/BlogPostForm";
import { SocialPostForm } from "@/components/forms/SocialPostForm";
import {
  deleteSocialPostAction,
  toggleSocialPostAction,
} from "@/app/actions/social";
import { PLATFORM_LABELS, SOCIAL_TAG } from "@/lib/social";
import { formatEventDate } from "@/lib/events";
import { Badge, Card } from "@/components/ui";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Content desk" };

export default async function ContentDeskPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (!isStaff(user)) redirect("/dashboard");

  const allowed = {
    events: can(user, "events"),
    listings: can(user, "listings"),
    news: can(user, "news"),
    blog: can(user, "blog"),
    reviews: can(user, "reviews"),
  };

  const [events, listings, newsItems, posts, socialPosts] = await Promise.all([
    db.event.findMany({
      orderBy: { createdAt: "desc" },
      take: 40,
      select: {
        id: true,
        slug: true,
        title: true,
        city: true,
        startsAt: true,
        timeZone: true,
        status: true,
      },
    }),
    db.listing.findMany({
      orderBy: { createdAt: "desc" },
      take: 30,
      select: { id: true, slug: true, title: true, city: true, status: true },
    }),
    db.newsItem.findMany({
      orderBy: [{ status: "asc" }, { publishedAt: "desc" }],
      take: 40,
      include: {
        submittedBy: { select: { name: true, email: true, avatarUrl: true } },
      },
    }),
    db.blogPost.findMany({ orderBy: { publishedAt: "desc" }, take: 40 }),
    allowed.blog
      ? db.socialPost.findMany({ orderBy: { postedAt: "desc" }, take: 30 })
      : Promise.resolve([]),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black">Content desk</h1>
        <p className="text-sm text-slate-600">
          Add and moderate events, listings, news and blog posts. Member
          details, payments and reward points stay with admins.
        </p>
      </div>

      <div className="flex flex-wrap gap-2 text-sm font-semibold">
        <Link
          href="/events/new"
          className="rounded-xl bg-indigo-600 px-3 py-2 text-white hover:bg-indigo-700"
        >
          + Post an event
        </Link>
        <Link
          href="/listings/new"
          className="rounded-xl border border-slate-300 px-3 py-2 hover:bg-slate-50"
        >
          + Post a listing
        </Link>
        <Link
          href="/resources/new"
          className="rounded-xl border border-slate-300 px-3 py-2 hover:bg-slate-50"
        >
          + Submit a resource link
        </Link>
        {allowed.events ? (
          <Link
            href="/admin/events/wire"
            className="rounded-xl border border-slate-300 px-3 py-2 hover:bg-slate-50"
          >
            Event wire
          </Link>
        ) : null}
        {allowed.listings ? (
          <Link
            href="/admin/listings/wire"
            className="rounded-xl border border-slate-300 px-3 py-2 hover:bg-slate-50"
          >
            Listing wire
          </Link>
        ) : null}
        {allowed.reviews ? (
          <Link
            href="/admin/reviews"
            className="rounded-xl border border-slate-300 px-3 py-2 hover:bg-slate-50"
          >
            Review desk
          </Link>
        ) : null}
      </div>

      <AdminTabs
        tabs={[
          ...(allowed.blog
            ? [
                { id: "social", label: `#${SOCIAL_TAG} wall` },
                { id: "blog", label: "Blog" },
              ]
            : []),
          ...(allowed.events ? [{ id: "events", label: "Events" }] : []),
          ...(allowed.listings ? [{ id: "listings", label: "Listings" }] : []),
          ...(allowed.news ? [{ id: "news", label: "News" }] : []),
        ]}
      />

      {allowed.blog ? (
        <Card id="social">
          <h2 className="mb-1 text-lg font-bold">#{SOCIAL_TAG} social wall</h2>
          <p className="mb-3 text-sm text-slate-600">
            Paste a real public post that mentions #{SOCIAL_TAG} — it shows in
            the sidebar rail and on{" "}
            <Link href="/buzz" className="font-semibold text-indigo-600">
              /buzz
            </Link>
            , linking back to the author.
          </p>
          <SocialPostForm />
          <ul className="mt-4 divide-y divide-slate-100 text-sm">
            {socialPosts.map((post) => (
              <li
                key={post.id}
                className="flex flex-wrap items-center justify-between gap-2 py-2"
              >
                <div className="min-w-0">
                  <a
                    href={post.url}
                    target="_blank"
                    rel="noreferrer"
                    className="font-medium text-indigo-600"
                  >
                    {post.author}
                    {post.handle ? ` ${post.handle}` : ""}
                  </a>
                  <p className="truncate text-xs text-slate-400">
                    {PLATFORM_LABELS[post.platform]} ·{" "}
                    {post.postedAt.toLocaleDateString("en-IN")} · {post.text}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge tone={post.active ? "green" : "slate"}>
                    {post.active ? "live" : "hidden"}
                  </Badge>
                  <form action={toggleSocialPostAction}>
                    <input type="hidden" name="id" value={post.id} />
                    <button
                      type="submit"
                      className="rounded-lg border border-slate-300 px-2 py-1 text-xs font-semibold hover:bg-slate-50"
                    >
                      {post.active ? "hide" : "show"}
                    </button>
                  </form>
                  <form action={deleteSocialPostAction}>
                    <input type="hidden" name="id" value={post.id} />
                    <button
                      type="submit"
                      className="rounded-lg border border-red-200 px-2 py-1 text-xs font-semibold text-red-600 hover:bg-red-50"
                    >
                      delete
                    </button>
                  </form>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      ) : null}

      {allowed.blog ? (
        <Card id="blog">
          <h2 className="mb-3 text-lg font-bold">Blog &amp; what&apos;s new</h2>
          <BlogPostForm />
          <ul className="mt-4 divide-y divide-slate-100 text-sm">
            {posts.map((post) => (
              <li
                key={post.id}
                className="flex flex-wrap items-center justify-between gap-2 py-2"
              >
                <div className="min-w-0">
                  <Link
                    href={`/blog/${post.slug}`}
                    className="font-medium text-indigo-600"
                  >
                    {post.title}
                  </Link>
                  <p className="text-xs text-slate-400">
                    {post.kind === "UPDATE" ? "What's new" : "Post"} ·{" "}
                    {post.publishedAt.toLocaleDateString("en-IN")}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge tone={post.published ? "green" : "slate"}>
                    {post.published ? "live" : "draft"}
                  </Badge>
                  <Link
                    href={`/admin/content/${post.id}`}
                    className="rounded-lg border border-indigo-200 px-2 py-1 text-xs font-semibold text-indigo-600 hover:bg-indigo-50"
                  >
                    edit
                  </Link>
                  <form action={toggleBlogPostAction}>
                    <input type="hidden" name="id" value={post.id} />
                    <button
                      type="submit"
                      className="rounded-lg border border-slate-300 px-2 py-1 text-xs font-semibold hover:bg-slate-50"
                    >
                      {post.published ? "unpublish" : "publish"}
                    </button>
                  </form>
                  <form action={deleteBlogPostAction}>
                    <input type="hidden" name="id" value={post.id} />
                    <button
                      type="submit"
                      className="rounded-lg border border-red-200 px-2 py-1 text-xs font-semibold text-red-600 hover:bg-red-50"
                    >
                      delete
                    </button>
                  </form>
                </div>
              </li>
            ))}
            {posts.length === 0 ? (
              <li className="py-2 text-slate-500">No posts yet.</li>
            ) : null}
          </ul>
        </Card>
      ) : null}

      {allowed.events ? (
        <Card id="events">
          <h2 className="mb-3 text-lg font-bold">Events</h2>
          <ul className="divide-y divide-slate-100 text-sm">
            {events.map((event) => (
              <li
                key={event.id}
                className="flex flex-wrap items-center justify-between gap-2 py-2"
              >
                <div>
                  <Link
                    href={`/events/${event.slug}`}
                    className="font-medium text-indigo-600"
                  >
                    {event.title}
                  </Link>
                  <p className="text-xs text-slate-500">
                    {formatEventDate(event.startsAt, event.timeZone)} · {event.city}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    tone={
                      event.status === "APPROVED"
                        ? "green"
                        : event.status === "PENDING"
                          ? "amber"
                          : "red"
                    }
                  >
                    {event.status}
                  </Badge>
                  <Link
                    href={`/admin/events/${event.id}`}
                    className="rounded-lg border border-indigo-200 px-2 py-1 text-xs font-semibold text-indigo-600 hover:bg-indigo-50"
                  >
                    edit
                  </Link>
                  {(["APPROVED", "REJECTED"] as const)
                    .filter((status) => status !== event.status)
                    .map((status) => (
                      <form key={status} action={setEventStatusAction}>
                        <input type="hidden" name="id" value={event.id} />
                        <input type="hidden" name="status" value={status} />
                        <button
                          type="submit"
                          className="rounded-lg border border-slate-300 px-2 py-1 text-xs font-semibold hover:bg-slate-50"
                        >
                          {status.toLowerCase()}
                        </button>
                      </form>
                    ))}
                </div>
              </li>
            ))}
            {events.length === 0 ? (
              <li className="py-2 text-slate-500">No events yet.</li>
            ) : null}
          </ul>
        </Card>
      ) : null}

      {allowed.listings ? (
        <Card id="listings">
          <h2 className="mb-1 text-lg font-bold">
            Property, rooms &amp; items
          </h2>
          <p className="mb-3 text-xs text-slate-500">
            Property has its own desk with filters, featured slots and leads at{" "}
            <Link
              href="/admin/properties"
              className="font-semibold text-indigo-600"
            >
              /admin/properties
            </Link>
            .
          </p>
          <ul className="divide-y divide-slate-100 text-sm">
            {listings.map((listing) => (
              <li
                key={listing.id}
                className="flex flex-wrap items-center justify-between gap-2 py-2"
              >
                <div>
                  <Link
                    href={`/listings/${listing.slug}`}
                    className="font-medium text-indigo-600"
                  >
                    {listing.title}
                  </Link>
                  <p className="text-xs text-slate-500">{listing.city}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    tone={listing.status === "APPROVED" ? "green" : "amber"}
                  >
                    {listing.status}
                  </Badge>
                  {(["APPROVED", "REJECTED"] as const)
                    .filter((status) => status !== listing.status)
                    .map((status) => (
                      <form key={status} action={setClassifiedStatusAction}>
                        <input type="hidden" name="id" value={listing.id} />
                        <input type="hidden" name="status" value={status} />
                        <button
                          type="submit"
                          className="rounded-lg border border-slate-300 px-2 py-1 text-xs font-semibold hover:bg-slate-50"
                        >
                          {status.toLowerCase()}
                        </button>
                      </form>
                    ))}
                </div>
              </li>
            ))}
            {listings.length === 0 ? (
              <li className="py-2 text-slate-500">No listings yet.</li>
            ) : null}
          </ul>
        </Card>
      ) : null}

      {allowed.news ? (
        <Card id="news">
          <h2 className="mb-3 text-lg font-bold">News</h2>
          <p className="mb-3 text-sm text-slate-500">
            Member submissions wait as PENDING until you publish them.
            Publishing rewards the contributor; ⭐ marks a story as important
            news.
          </p>
          <ul className="divide-y divide-slate-100 text-sm">
            {newsItems.map((item) => (
              <li
                key={item.id}
                className="flex flex-wrap items-center justify-between gap-2 py-2"
              >
                <div className="min-w-0">
                  <a
                    href={item.link}
                    target="_blank"
                    rel="noreferrer"
                    className="font-medium text-indigo-600"
                  >
                    {item.title}
                  </a>
                  <p className="flex items-center gap-1.5 text-xs text-slate-400">
                    {item.submittedBy ? (
                      <>
                        {item.submittedBy.avatarUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={item.submittedBy.avatarUrl}
                            alt=""
                            className="h-5 w-5 rounded-full object-cover"
                          />
                        ) : (
                          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-100 text-[10px] font-bold text-indigo-700">
                            {(item.submittedBy.name ?? item.submittedBy.email)
                              .slice(0, 1)
                              .toUpperCase()}
                          </span>
                        )}
                        {item.submittedBy.name ?? item.submittedBy.email}
                      </>
                    ) : (
                      item.source
                    )}
                    {" · "}
                    {item.score} votes
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    tone={
                      item.status === "PUBLISHED"
                        ? "green"
                        : item.status === "PENDING"
                          ? "amber"
                          : "red"
                    }
                  >
                    {item.status}
                  </Badge>
                  {(["PUBLISHED", "REJECTED"] as const)
                    .filter((status) => status !== item.status)
                    .map((status) => (
                      <form key={status} action={setNewsStatusAction}>
                        <input type="hidden" name="id" value={item.id} />
                        <input type="hidden" name="status" value={status} />
                        <button
                          type="submit"
                          className="rounded-lg border border-slate-300 px-2 py-1 text-xs font-semibold hover:bg-slate-50"
                        >
                          {status.toLowerCase()}
                        </button>
                      </form>
                    ))}
                  <form action={featureNewsAction}>
                    <input type="hidden" name="id" value={item.id} />
                    <button
                      type="submit"
                      className="rounded-lg border border-amber-300 px-2 py-1 text-xs font-semibold text-amber-700 hover:bg-amber-50"
                    >
                      {item.featured ? "unpin" : "⭐ important"}
                    </button>
                  </form>
                  <form action={deleteNewsAction}>
                    <input type="hidden" name="id" value={item.id} />
                    <button
                      type="submit"
                      className="rounded-lg border border-red-200 px-2 py-1 text-xs font-semibold text-red-600 hover:bg-red-50"
                    >
                      delete
                    </button>
                  </form>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      ) : null}
    </div>
  );
}
