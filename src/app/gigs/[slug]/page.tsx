import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { properName } from "@/lib/names";
import { GIG_SELECT, includesList, usd } from "@/lib/gigs";
import { buyGigAction } from "@/app/actions/gigs";
import { ActionForm } from "@/components/gigs/GigForms";
import { FeeNote, GigCard, SellerFace } from "@/components/gigs/GigCard";
import { Alert, Badge, Card, Field, LinkButton, inputClass } from "@/components/ui";

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
    title: `${gig.title} — ${usd(gig.priceMinor)} by ${properName(gig.seller.name)}`,
    description: gig.description.slice(0, 160),
    alternates: { canonical: `/gigs/${gig.slug}` },
    robots: gig.status === "ACTIVE" ? undefined : { index: false },
  };
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

  const [user, more] = await Promise.all([
    getCurrentUser(),
    db.gig.findMany({
      where: { sellerId: gig.sellerId, status: "ACTIVE", NOT: { id: gig.id } },
      take: 3,
      select: GIG_SELECT,
    }),
  ]);
  const isSeller = user?.id === gig.sellerId;
  const includes = includesList(gig.includes);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <nav className="text-xs text-slate-500">
        <Link href="/gigs" className="underline">
          Gigs
        </Link>{" "}
        / {gig.title}
      </nav>

      {searchParams.cancelled ? (
        <Alert>Payment cancelled — nothing was charged.</Alert>
      ) : null}
      {gig.status === "PAUSED" ? (
        <Alert tone="info">This gig is paused; the seller is not taking new orders.</Alert>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-4">
          <Card>
            <h1 className="text-2xl font-black text-slate-900 sm:text-3xl">
              {gig.title}
            </h1>
            <div className="mt-3 flex items-center gap-3">
              <SellerFace seller={gig.seller} size="h-12 w-12" />
              <div className="min-w-0">
                {gig.seller.username ? (
                  <Link
                    href={`/${gig.seller.username}`}
                    className="font-bold text-indigo-700 underline"
                  >
                    {properName(gig.seller.name)}
                  </Link>
                ) : (
                  <p className="font-bold">{properName(gig.seller.name)}</p>
                )}
                <p className="truncate text-sm text-slate-600">
                  {gig.seller.headline ?? gig.seller.location ?? ""}
                </p>
              </div>
            </div>
            <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-slate-700">
              {gig.description}
            </p>
            {includes.length ? (
              <div className="mt-4">
                <h2 className="font-bold">What you get</h2>
                <ul className="mt-1 space-y-1 text-sm text-slate-700">
                  {includes.map((item) => (
                    <li key={item} className="flex gap-2">
                      <span className="text-emerald-600">✓</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </Card>

          <FeeNote priceMinor={gig.priceMinor} audience="buyer" />

          {more.length ? (
            <section className="space-y-2">
              <h2 className="text-lg font-bold">
                More from {properName(gig.seller.name)}
              </h2>
              <div className="grid gap-3 sm:grid-cols-3">
                {more.map((item) => (
                  <GigCard key={item.slug} gig={item} showSeller={false} />
                ))}
              </div>
            </section>
          ) : null}
        </div>

        <aside>
          <Card className="sticky top-24 space-y-3">
            <div className="flex items-end justify-between">
              <span className="text-3xl font-black text-slate-900">
                {usd(gig.priceMinor)}
              </span>
              <Badge tone="indigo">
                ⏱ delivered in {gig.deliveryDays} day
                {gig.deliveryDays === 1 ? "" : "s"}
              </Badge>
            </div>

            {isSeller ? (
              <>
                <p className="text-sm text-slate-600">This is your gig.</p>
                <LinkButton href="/dashboard/gigs" variant="secondary">
                  Manage my gigs
                </LinkButton>
              </>
            ) : gig.status !== "ACTIVE" ? (
              <p className="text-sm text-slate-600">Not taking orders right now.</p>
            ) : !user ? (
              <>
                <p className="text-sm text-slate-600">
                  Sign in to order. Your card is charged now and the money is
                  held by Godesi until you confirm the work.
                </p>
                <LinkButton href={`/login?next=/gigs/${gig.slug}`}>
                  Sign in to order
                </LinkButton>
              </>
            ) : (
              <ActionForm
                action={buyGigAction}
                submitLabel={`Pay ${usd(gig.priceMinor)} securely`}
                pendingLabel="Opening checkout…"
              >
                <input type="hidden" name="slug" value={gig.slug} />
                <Field
                  label="What do you need?"
                  hint="Dates, names, links, files (share a Drive link) — everything the seller needs to start."
                  required
                >
                  <textarea
                    name="brief"
                    required
                    minLength={20}
                    rows={5}
                    className={inputClass}
                    placeholder="e.g. Date of birth 12 Mar 1990, 4:20am, Jaipur. Looking for career guidance for the next two years."
                  />
                </Field>
                <p className="text-xs text-slate-500">
                  Paid by card through Stripe. Full refund if the seller declines
                  or staff side with you in a dispute.
                </p>
              </ActionForm>
            )}
          </Card>
        </aside>
      </div>
    </div>
  );
}
