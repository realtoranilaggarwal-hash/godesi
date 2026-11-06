import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { siteUrl } from "@/lib/format";
import { PhotoAlbumGallery } from "@/components/PhotoAlbumGallery";

export const dynamic = "force-dynamic";

async function loadEvent(slug: string) {
  return db.event.findUnique({
    where: { slug },
    select: {
      slug: true,
      title: true,
      status: true,
      albumUrl: true,
      reviewsAlbumUrl: true,
      reviews: {
        where: { hidden: false },
        orderBy: [{ featured: "desc" }, { sortOrder: "asc" }],
      },
    },
  });
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const event = await loadEvent(params.slug);
  if (!event) return {};
  return {
    title: `Guest reviews — ${event.title}`,
    description: `What guests say about ${event.title}: ${event.reviews.length} reviews on GoDesi.`,
    alternates: { canonical: `${siteUrl()}/events/${event.slug}/reviews` },
    robots: event.reviews.length ? undefined : { index: false },
  };
}

export default async function EventReviewsPage({ params }: { params: { slug: string } }) {
  const event = await loadEvent(params.slug);
  if (!event || event.status !== "APPROVED") notFound();

  const count = event.reviews.length;
  const average = count
    ? event.reviews.reduce((sum, review) => sum + review.rating, 0) / count
    : 0;

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <nav className="text-sm text-slate-500">
        <Link href={`/events/${event.slug}`} className="hover:underline">
          ← {event.title}
        </Link>
      </nav>

      <header className="rounded-2xl bg-gradient-to-r from-orange-500 via-rose-600 to-fuchsia-600 p-5 text-white">
        <p className="text-xs font-bold uppercase tracking-widest opacity-80">⭐ Guest reviews</p>
        <h1 className="mt-1 break-words text-2xl font-black">{event.title}</h1>
        {count ? (
          <p className="mt-1 text-sm">
            {"★".repeat(Math.round(average))} {average.toFixed(1)} from {count} guest
            {count === 1 ? "" : "s"}
          </p>
        ) : null}
        <div className="mt-4 flex flex-wrap gap-2">
          <Link
            href={`/events/${event.slug}#tickets`}
            className="rounded-xl bg-white px-4 py-2 text-sm font-bold text-rose-700 hover:bg-rose-50"
          >
            🎟️ Buy tickets
          </Link>
          {event.reviewsAlbumUrl ? (
            <a
              href={event.reviewsAlbumUrl}
              target="_blank"
              rel="noopener"
              className="rounded-xl border border-white/70 px-4 py-2 text-sm font-bold text-white hover:bg-white/10"
            >
              See the original messages ↗
            </a>
          ) : null}
        </div>
      </header>

      {count ? (
        <div className="columns-1 gap-3 sm:columns-2 lg:columns-3">
          {event.reviews.map((review) => (
            <figure
              key={review.id}
              className="mb-3 min-w-0 break-inside-avoid rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
            >
              <p className="text-amber-500" aria-label={`${review.rating} stars`}>
                {"★".repeat(review.rating)}
              </p>
              <blockquote className="mt-2 break-words text-sm leading-relaxed text-slate-700">
                “{review.comment}”
              </blockquote>
              <figcaption className="mt-2 text-xs font-semibold text-slate-500">
                — {review.authorName}
                {review.source ? ` · ${review.source}` : ""}
              </figcaption>
            </figure>
          ))}
        </div>
      ) : (
        <p className="text-slate-600">No reviews yet.</p>
      )}

      <PhotoAlbumGallery url={event.albumUrl} heading="Party photos" />
    </div>
  );
}
