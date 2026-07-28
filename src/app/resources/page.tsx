import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";
import { requestCurrency } from "@/lib/currency";
import { getCategoryTree } from "@/lib/directory";
import {
  RESOURCE_KIND_LABELS,
  RESOURCE_PACKS,
  formatResourcePrice,
} from "@/lib/resources";
import { InlineBanner, SidebarBanners } from "@/components/Banners";
import { TagCloud } from "@/components/TagCloud";
import { formatEventDate } from "@/lib/events";
import { Alert, Badge, Card, EmptyState, LinkButton } from "@/components/ui";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Resources & important links",
  description:
    "Hand-picked links, tools and services for desi businesses, professionals and families — plus how to promote your own link.",
};

export default async function ResourcesPage({
  searchParams,
}: {
  searchParams: { paid?: string; tag?: string };
}) {
  const currency = requestCurrency();
  const tag = searchParams.tag?.trim().toLowerCase() || null;
  const [links, categories, taggedEvents] = await Promise.all([
    db.resourceLink.findMany({
      where: {
        status: "APPROVED",
        active: true,
        ...(tag ? { tags: { has: tag } } : {}),
      },
      orderBy: [{ categorySlug: "asc" }, { createdAt: "desc" }],
      take: 200,
      include: { category: { select: { name: true, icon: true } } },
    }),
    getCategoryTree(),
    tag
      ? db.event.findMany({
          where: { status: "APPROVED", tags: { has: tag }, startsAt: { gte: new Date() } },
          orderBy: { startsAt: "asc" },
          take: 6,
          select: { id: true, slug: true, title: true, city: true, startsAt: true },
        })
      : Promise.resolve([]),
  ]);

  const grouped = new Map<string, typeof links>();
  for (const link of links) {
    const key = link.category?.name ?? "General";
    const list = grouped.get(key) ?? [];
    list.push(link);
    grouped.set(key, list);
  }

  return (
    <div className="flex gap-6">
      <div className="min-w-0 flex-1 space-y-5">
        <section className="rounded-3xl bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 px-5 py-8 text-white sm:px-8">
          <p className="text-xs font-semibold uppercase tracking-widest text-white/80">
            Resources
          </p>
          <h1 className="mt-2 text-3xl font-bold sm:text-4xl">Important links 🔗</h1>
          <p className="mt-3 max-w-2xl text-white/90">
            Useful tools, services and guides for desi businesses, professionals and
            families. Sponsored and affiliate links are always labelled.
          </p>
          <div className="mt-5">
            <LinkButton href="/resources/new" variant="secondary">
              Advertise link — from {formatResourcePrice(currency, RESOURCE_PACKS[0])} /
              1,000 views
            </LinkButton>
          </div>
        </section>

        {tag ? (
          <Card className="flex flex-wrap items-center justify-between gap-3 bg-indigo-50/60">
            <p className="text-sm font-semibold text-indigo-900">
              Showing everything tagged <span className="font-black">#{tag}</span>{" "}
              — {links.length} link{links.length === 1 ? "" : "s"}
              {taggedEvents.length
                ? ` and ${taggedEvents.length} event${taggedEvents.length === 1 ? "" : "s"}`
                : ""}
            </p>
            <Link
              href="/resources"
              className="text-sm font-semibold text-indigo-700 underline"
            >
              Show all resources
            </Link>
          </Card>
        ) : null}

        <div className="lg:hidden">
          <TagCloud active={tag ?? undefined} />
        </div>

        {taggedEvents.length ? (
          <Card>
            <h2 className="text-lg font-bold">Events tagged #{tag}</h2>
            <ul className="mt-2 divide-y divide-slate-100">
              {taggedEvents.map((event) => (
                <li key={event.id} className="py-2">
                  <Link
                    href={`/events/${event.slug}`}
                    className="text-sm font-semibold text-indigo-700 hover:underline"
                  >
                    {event.title}
                  </Link>
                  <p className="text-xs text-slate-500">
                    {formatEventDate(event.startsAt)} · {event.city}
                  </p>
                </li>
              ))}
            </ul>
          </Card>
        ) : null}

        {searchParams.paid ? (
          <Alert tone="success">
            Payment received — your link goes live as soon as we review it.
          </Alert>
        ) : null}

        {links.length ? (
          Array.from(grouped.entries()).map(([group, groupLinks]) => (
            <Card key={group}>
              <h2 className="text-lg font-bold">{group}</h2>
              <ul className="mt-2 divide-y divide-slate-100">
                {groupLinks.map((link) => (
                  <li
                    key={link.id}
                    className="flex flex-wrap items-start justify-between gap-2 py-2"
                  >
                    <div className="min-w-0">
                      <a
                        href={`/api/links/${link.id}/click`}
                        target="_blank"
                        rel="noreferrer sponsored nofollow"
                        className="break-words text-sm font-semibold text-indigo-700 hover:underline"
                      >
                        {link.title}
                      </a>
                      {link.description ? (
                        <span className="text-sm text-slate-600">
                          {" "}
                          — {link.description}
                        </span>
                      ) : null}
                      {link.tags.length ? (
                        <p className="mt-1 flex flex-wrap gap-1.5">
                          {link.tags.map((item) => (
                            <Link key={item} href={`/resources?tag=${encodeURIComponent(item)}`}>
                              <Badge tone="indigo">#{item}</Badge>
                            </Link>
                          ))}
                        </p>
                      ) : null}
                    </div>
                    <Badge tone={link.kind === "EDITORIAL" ? "slate" : "amber"}>
                      {RESOURCE_KIND_LABELS[link.kind]}
                    </Badge>
                  </li>
                ))}
              </ul>
            </Card>
          ))
        ) : (
          <EmptyState
            title="No links published yet"
            body="Recommended links appear here and in the boxes on category and listing pages."
            action={<LinkButton href="/resources/new">Advertise link</LinkButton>}
          />
        )}

        <Card>
          <h2 className="text-lg font-bold">Promote your link here</h2>
          <p className="mt-1 text-sm text-slate-600">
            Your link appears in the “Recommended links” box on the category and listing
            pages you choose. We charge purely for views — once your purchased views are
            delivered, the link retires automatically.
          </p>
          <ul className="mt-2 space-y-1 text-sm text-slate-600">
            {RESOURCE_PACKS.map((pack) => (
              <li key={pack}>
                • {pack.toLocaleString()} views —{" "}
                <strong>{formatResourcePrice(currency, pack)}</strong>
              </li>
            ))}
          </ul>
          <p className="mt-2 text-xs text-slate-500">
            {categories.length} categories to choose from. Links are reviewed before they
            appear; anything misleading or adult is refunded and rejected.{" "}
            <Link href="/contact" className="font-semibold text-indigo-600">
              Questions?
            </Link>
          </p>
          <div className="mt-3">
            <LinkButton href="/resources/new">Advertise link</LinkButton>
          </div>
        </Card>

        <InlineBanner />
      </div>

      <aside className="hidden w-[300px] shrink-0 lg:block">
        <div className="sticky top-24 space-y-4">
          <TagCloud active={tag ?? undefined} />
          <SidebarBanners />
        </div>
      </aside>
    </div>
  );
}
