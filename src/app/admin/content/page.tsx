import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getCurrentUser, isStaff } from "@/lib/auth";
import {
  deleteNewsAction,
  setEventStatusAction,
  setListingStatusAction,
  setNewsStatusAction,
} from "@/app/actions/admin";
import {
  deleteBlogPostAction,
  toggleBlogPostAction,
} from "@/app/actions/blog";
import { BlogPostForm } from "@/components/forms/BlogPostForm";
import { formatEventDate } from "@/lib/events";
import { Badge, Card } from "@/components/ui";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Content desk" };

export default async function ContentDeskPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (!isStaff(user)) redirect("/dashboard");

  const [events, listings, newsItems, posts] = await Promise.all([
    db.event.findMany({
      orderBy: { createdAt: "desc" },
      take: 40,
      select: {
        id: true,
        slug: true,
        title: true,
        city: true,
        startsAt: true,
        status: true,
      },
    }),
    db.listing.findMany({
      orderBy: { createdAt: "desc" },
      take: 30,
      select: { id: true, slug: true, title: true, city: true, status: true },
    }),
    db.newsItem.findMany({ orderBy: { publishedAt: "desc" }, take: 25 }),
    db.blogPost.findMany({ orderBy: { publishedAt: "desc" }, take: 40 }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black">Content desk</h1>
        <p className="text-sm text-slate-600">
          Add and moderate events, listings, news and blog posts. Member details,
          payments and reward points stay with admins.
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
      </div>

      <Card>
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

      <Card>
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
                  {formatEventDate(event.startsAt)} · {event.city}
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

      <Card>
        <h2 className="mb-3 text-lg font-bold">Property, rooms &amp; items</h2>
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
                <Badge tone={listing.status === "APPROVED" ? "green" : "amber"}>
                  {listing.status}
                </Badge>
                {(["APPROVED", "REJECTED"] as const)
                  .filter((status) => status !== listing.status)
                  .map((status) => (
                    <form key={status} action={setListingStatusAction}>
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

      <Card>
        <h2 className="mb-3 text-lg font-bold">News</h2>
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
                <p className="text-xs text-slate-400">{item.source}</p>
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
    </div>
  );
}
