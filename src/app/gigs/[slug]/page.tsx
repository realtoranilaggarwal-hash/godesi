import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { properName } from "@/lib/names";
import {
  GIG_SELECT,
  averageRating,
  faqList,
  includesList,
  sellerStats,
  sortPackages,
  usd,
} from "@/lib/gigs";
import { replyGigReviewAction } from "@/app/actions/gigs";
import { ActionForm } from "@/components/gigs/GigForms";
import { FeeNote, GigCard, SellerFace } from "@/components/gigs/GigCard";
import { Gallery, OrderBox } from "@/components/gigs/GigPagePieces";
import { Alert, Badge, Card, LinkButton, Stars, inputClass } from "@/components/ui";

export const dynamic = "force-dynamic";

async function load(slug: string) {
  return db.gig.findFirst({
    where: { slug, status: { not: "REMOVED" } },
    select: { ...GIG_SELECT, sellerId: true },
  });
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const gig = await load(params.slug);
  if (!gig) return { title: "Gig not found" };
  return {
    title: `${gig.title} — from ${usd(gig.priceMinor)} by ${properName(gig.seller.name)}`,
    description: gig.description.slice(0, 160),
    alternates: { canonical: `/gigs/${gig.slug}` },
    robots: gig.status === "ACTIVE" ? undefined : { index: false },
    openGraph: gig.images[0] ? { images: [gig.images[0]] } : undefined,
  };
}

function memberSince(date: Date) {
  return date.toLocaleDateString("en-US", { month: "short", year: "numeric", timeZone: "UTC" });
}

export default async function GigPage({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams: { cancelled?: string };
}) {
  const gig = await load(params.slug);
  if (!gig) notFound();

  const [user, more, similar, reviews, stats] = await Promise.all([
    getCurrentUser(),
    db.gig.findMany({
      where: { sellerId: gig.sellerId, status: "ACTIVE", NOT: { id: gig.id } },
      take: 3,
      select: GIG_SELECT,
    }),
    gig.tags.length
      ? db.gig.findMany({
          where: {
            status: "ACTIVE",
            sellerId: { not: gig.sellerId },
            tags: { hasSome: gig.tags },
          },
          orderBy: [{ ratingCount: "desc" }, { createdAt: "desc" }],
          take: 3,
          select: GIG_SELECT,
        })
      : Promise.resolve([]),
    db.gigReview.findMany({
      where: { gigId: gig.id },
      orderBy: { createdAt: "desc" },
      take: 20,
      include: { author: { select: { name: true, avatarUrl: true, location: true } } },
    }),
    sellerStats(gig.sellerId),
  ]);
  const isSeller = user?.id === gig.sellerId;
  const packages = sortPackages(gig.packages);
  const faq = faqList(gig.faq);
  const rating = averageRating(gig.ratingSum, gig.ratingCount);
  const breakdown = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => r.rating === star).length,
  }));
  const sellerName = properName(gig.seller.name);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <nav className="text-xs text-slate-500">
        <Link href="/gigs" className="underline">
          Gigs
        </Link>
        {gig.tags[0] ? (
          <>
            {" / "}
            <Link href={`/gigs?tag=${encodeURIComponent(gig.tags[0])}`} className="underline">
              {gig.tags[0]}
            </Link>
          </>
        ) : null}{" "}
        / {gig.title}
      </nav>

      {searchParams.cancelled ? (
        <Alert>Payment cancelled — nothing was charged.</Alert>
      ) : null}
      {gig.status === "PAUSED" ? (
        <Alert tone="info">This gig is paused; the seller is not taking new orders.</Alert>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <div className="order-2 space-y-6 lg:order-1">
          <header className="space-y-3">
            <h1 className="text-2xl font-black text-slate-900 sm:text-3xl">
              {gig.title}
            </h1>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
              <span className="flex items-center gap-2">
                <SellerFace seller={gig.seller} size="h-9 w-9" />
                {gig.seller.username ? (
                  <Link href={`/${gig.seller.username}`} className="font-bold text-slate-900 hover:underline">
                    {sellerName}
                  </Link>
                ) : (
                  <span className="font-bold">{sellerName}</span>
                )}
              </span>
              {stats.ratingCount ? (
                <span className="flex items-center gap-1">
                  <Stars rating={stats.rating} size={14} />
                  <strong>{stats.rating.toFixed(1)}</strong>
                  <span className="text-slate-500">({stats.ratingCount})</span>
                </span>
              ) : (
                <Badge tone="indigo">New seller</Badge>
              )}
              {stats.completed ? (
                <span className="text-slate-600">
                  {stats.completed} order{stats.completed === 1 ? "" : "s"} completed
                </span>
              ) : null}
              {stats.inProgress ? (
                <span className="text-slate-600">
                  {stats.inProgress} in progress
                </span>
              ) : null}
            </div>
          </header>

          <Gallery images={gig.images} title={gig.title} />

          <section>
            <h2 className="text-lg font-bold">About this gig</h2>
            <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-slate-700">
              {gig.description}
            </p>
            {gig.tags.length ? (
              <div className="mt-3 flex flex-wrap gap-2">
                {gig.tags.map((tag) => (
                  <Link
                    key={tag}
                    href={`/gigs?tag=${encodeURIComponent(tag)}`}
                    className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-200"
                  >
                    {tag}
                  </Link>
                ))}
              </div>
            ) : null}
          </section>

          <Card className="flex flex-wrap items-start gap-4">
            <SellerFace seller={gig.seller} size="h-16 w-16" />
            <div className="min-w-0 flex-1">
              <h2 className="text-lg font-bold">About the seller</h2>
              <p className="font-semibold">{sellerName}</p>
              {gig.seller.headline ? (
                <p className="text-sm text-slate-600">{gig.seller.headline}</p>
              ) : null}
              <dl className="mt-3 grid grid-cols-2 gap-2 text-sm sm:grid-cols-4">
                <div>
                  <dt className="text-xs text-slate-500">From</dt>
                  <dd className="font-semibold">{gig.seller.location ?? "—"}</dd>
                </div>
                <div>
                  <dt className="text-xs text-slate-500">Member since</dt>
                  <dd className="font-semibold">{memberSince(gig.seller.createdAt)}</dd>
                </div>
                <div>
                  <dt className="text-xs text-slate-500">Orders completed</dt>
                  <dd className="font-semibold">{stats.completed}</dd>
                </div>
                <div>
                  <dt className="text-xs text-slate-500">Rating</dt>
                  <dd className="font-semibold">
                    {stats.ratingCount ? `${stats.rating.toFixed(1)} ★ (${stats.ratingCount})` : "No reviews yet"}
                  </dd>
                </div>
              </dl>
              {gig.seller.username ? (
                <LinkButton href={`/${gig.seller.username}`} variant="secondary" className="mt-3 !py-1.5">
                  See {sellerName}&apos;s card
                </LinkButton>
              ) : null}
            </div>
          </Card>

          {packages.length > 1 ? (
            <section>
              <h2 className="text-lg font-bold">Compare packages</h2>
              <div className="mt-2 overflow-x-auto rounded-2xl border border-slate-200 bg-white">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 text-left">
                    <tr>
                      <th className="px-3 py-2 font-medium text-slate-500">Package</th>
                      {packages.map((p) => (
                        <th key={p.tier} className="px-3 py-2">
                          <p className="text-lg font-black">{usd(p.priceMinor)}</p>
                          <p className="font-bold">{p.name}</p>
                          <p className="text-xs font-normal text-slate-600">{p.description}</p>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-t border-slate-100">
                      <td className="px-3 py-2 text-slate-600">Delivery</td>
                      {packages.map((p) => (
                        <td key={p.tier} className="px-3 py-2 font-semibold">
                          {p.deliveryDays} day{p.deliveryDays === 1 ? "" : "s"}
                        </td>
                      ))}
                    </tr>
                    <tr className="border-t border-slate-100">
                      <td className="px-3 py-2 text-slate-600">Revisions</td>
                      {packages.map((p) => (
                        <td key={p.tier} className="px-3 py-2 font-semibold">
                          {p.revisions}
                        </td>
                      ))}
                    </tr>
                    <tr className="border-t border-slate-100 align-top">
                      <td className="px-3 py-2 text-slate-600">Included</td>
                      {packages.map((p) => (
                        <td key={p.tier} className="px-3 py-2">
                          <ul className="space-y-1">
                            {includesList(p.includes).map((item) => (
                              <li key={item} className="flex gap-1.5">
                                <span className="text-emerald-600">✓</span>
                                {item}
                              </li>
                            ))}
                          </ul>
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>
          ) : null}

          {faq.length ? (
            <section>
              <h2 className="text-lg font-bold">FAQ</h2>
              <div className="mt-2 divide-y divide-slate-200 rounded-2xl border border-slate-200 bg-white">
                {faq.map((row) => (
                  <details key={row.q} className="group px-4 py-3">
                    <summary className="cursor-pointer list-none font-semibold text-slate-900 marker:content-none">
                      <span className="mr-2 inline-block transition group-open:rotate-90">›</span>
                      {row.q}
                    </summary>
                    <p className="mt-2 whitespace-pre-line text-sm text-slate-700">{row.a}</p>
                  </details>
                ))}
              </div>
            </section>
          ) : null}

          <section id="reviews">
            <h2 className="text-lg font-bold">
              Reviews{gig.ratingCount ? ` (${gig.ratingCount})` : ""}
            </h2>
            {gig.ratingCount ? (
              <div className="mt-2 grid gap-4 sm:grid-cols-[auto_1fr]">
                <div className="flex items-center gap-2">
                  <span className="text-3xl font-black">{rating.toFixed(1)}</span>
                  <Stars rating={rating} size={18} />
                </div>
                <ul className="space-y-1 text-xs">
                  {breakdown.map(({ star, count }) => (
                    <li key={star} className="flex items-center gap-2">
                      <span className="w-12 text-slate-600">{star} star{star === 1 ? "" : "s"}</span>
                      <span className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
                        <span
                          className="block h-full bg-amber-400"
                          style={{ width: `${reviews.length ? (count / reviews.length) * 100 : 0}%` }}
                        />
                      </span>
                      <span className="w-6 text-right text-slate-600">{count}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <p className="mt-2 text-sm text-slate-600">
                No reviews yet. Reviews come only from buyers who paid for and
                completed an order here.
              </p>
            )}
            <div className="mt-3 space-y-3">
              {reviews.map((review) => (
                <Card key={review.id} className="space-y-2">
                  <div className="flex items-center gap-3">
                    <SellerFace seller={review.author} size="h-9 w-9" />
                    <div>
                      <p className="font-semibold">{properName(review.author.name)}</p>
                      <p className="text-xs text-slate-500">
                        {review.author.location ? `${review.author.location} · ` : ""}
                        {review.createdAt.toLocaleDateString("en-US", { dateStyle: "medium", timeZone: "UTC" })}
                      </p>
                    </div>
                    <Stars rating={review.rating} size={14} />
                  </div>
                  <p className="text-sm text-slate-700">{review.comment}</p>
                  {review.reply ? (
                    <div className="rounded-xl bg-slate-50 p-3 text-sm">
                      <p className="text-xs font-semibold text-slate-500">
                        {sellerName}&apos;s response
                      </p>
                      <p className="mt-1 text-slate-700">{review.reply}</p>
                    </div>
                  ) : isSeller ? (
                    <details>
                      <summary className="cursor-pointer text-xs font-semibold text-indigo-700">
                        Reply publicly
                      </summary>
                      <ActionForm action={replyGigReviewAction} submitLabel="Post reply" className="mt-2">
                        <input type="hidden" name="reviewId" value={review.id} />
                        <textarea name="reply" required minLength={2} maxLength={600} rows={2} className={inputClass} />
                      </ActionForm>
                    </details>
                  ) : null}
                </Card>
              ))}
            </div>
          </section>

          <FeeNote priceMinor={gig.priceMinor} audience="buyer" />

          {more.length ? (
            <section className="space-y-2">
              <h2 className="text-lg font-bold">More from {sellerName}</h2>
              <div className="grid gap-3 sm:grid-cols-3">
                {more.map((item) => (
                  <GigCard key={item.slug} gig={item} showSeller={false} />
                ))}
              </div>
            </section>
          ) : null}

          {similar.length ? (
            <section className="space-y-2">
              <h2 className="text-lg font-bold">Similar gigs</h2>
              <div className="grid gap-3 sm:grid-cols-3">
                {similar.map((item) => (
                  <GigCard key={item.slug} gig={item} />
                ))}
              </div>
            </section>
          ) : null}
        </div>

        <aside className="order-1 lg:order-2">
          <Card className="space-y-3 lg:sticky lg:top-24">
            {isSeller ? (
              <>
                <OrderBox slug={gig.slug} packages={packages} canOrder={false} />
                <p className="text-sm text-slate-600">This is your gig.</p>
                <LinkButton href="/dashboard/gigs" variant="secondary">
                  Manage my gigs
                </LinkButton>
              </>
            ) : gig.status !== "ACTIVE" ? (
              <>
                <OrderBox slug={gig.slug} packages={packages} canOrder={false} />
                <p className="text-sm text-slate-600">Not taking orders right now.</p>
              </>
            ) : !user ? (
              <>
                <OrderBox slug={gig.slug} packages={packages} canOrder={false} />
                <p className="text-sm text-slate-600">
                  Sign in to order. Your card is charged now and the money is
                  held by Godesi until you confirm the work.
                </p>
                <LinkButton href={`/login?next=/gigs/${gig.slug}`}>
                  Sign in to order
                </LinkButton>
              </>
            ) : (
              <OrderBox slug={gig.slug} packages={packages} canOrder />
            )}
            {gig.seller.username && !isSeller ? (
              <LinkButton href={`/${gig.seller.username}`} variant="ghost" className="w-full">
                Contact {sellerName} first
              </LinkButton>
            ) : null}
          </Card>
        </aside>
      </div>
    </div>
  );
}
