import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { getCurrentUser, can } from "@/lib/auth";
import { levelFor } from "@/lib/journalists";
import { JournalistBadge } from "@/components/JournalistBadge";
import { ReportVerdicts } from "@/components/ReportVerdicts";
import { ShareButtons } from "@/components/ShareButtons";
import { SidebarBanners } from "@/components/Banners";
import { Card } from "@/components/ui";
import { InArticleAd } from "@/components/InArticleAd";
import { SocialEmbed, isEmbeddable } from "@/components/SocialEmbed";
import { siteUrl } from "@/lib/format";

export const dynamic = "force-dynamic";

async function loadReport(id: string) {
  return db.newsItem.findUnique({
    where: { id },
    include: {
      submittedBy: {
        select: { id: true, name: true, username: true, avatarUrl: true },
      },
    },
  });
}

export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  const report = await loadReport(params.id);
  if (!report) return { title: "Report not found" };
  return {
    title: report.title,
    description: report.summary,
    openGraph: { images: report.imageUrl ? [report.imageUrl] : [] },
  };
}

function when(date: Date) {
  return date.toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default async function ReportPage({
  params,
}: {
  params: { id: string };
}) {
  const [report, user] = await Promise.all([
    loadReport(params.id),
    getCurrentUser(),
  ]);
  if (!report) notFound();

  const isStaff = user ? can(user, "news") : false;
  const isAuthor = report.submittedById === user?.id;
  if (report.status !== "PUBLISHED" && !isStaff && !isAuthor) notFound();

  const [counts, mine, approved, related] = await Promise.all([
    db.newsVerification.groupBy({
      by: ["verdict"],
      where: { newsId: report.id },
      _count: { _all: true },
    }),
    user
      ? db.newsVerification.findUnique({
          where: { newsId_userId: { newsId: report.id, userId: user.id } },
          select: { verdict: true },
        })
      : null,
    report.submittedById
      ? db.newsItem.count({
          where: { submittedById: report.submittedById, status: "PUBLISHED" },
        })
      : 0,
    db.newsItem.findMany({
      where: {
        status: "PUBLISHED",
        id: { not: params.id },
        OR: [
          { topic: report.topic },
          ...(report.city ? [{ city: report.city }] : []),
        ],
      },
      orderBy: { publishedAt: "desc" },
      take: 6,
      select: {
        id: true,
        title: true,
        summary: true,
        imageUrl: true,
        source: true,
        publishedAt: true,
      },
    }),
  ]);

  const count = (verdict: "CONFIRMED" | "DOUBTED" | "FAKE") =>
    counts.find((row) => row.verdict === verdict)?._count._all ?? 0;

  const place = [report.city, report.state, report.country]
    .filter(Boolean)
    .join(", ");

  /** Member reports carry their own photos; feed stories only the one image. */
  const hero = report.photoUrls.length ? null : report.imageUrl;

  return (
    <div className="flex gap-6">
      <article className="min-w-0 flex-1 space-y-4">
        <Card className="space-y-3">
          {report.status !== "PUBLISHED" ? (
            <p className="rounded-xl bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-900">
              {report.status === "PENDING"
                ? "With the news desk — only you and our team can see this."
                : "This report was not published."}
            </p>
          ) : null}

          <div className="flex flex-wrap items-center gap-2 text-xs">
            {report.category ? (
              <span className="rounded-full bg-indigo-100 px-2 py-0.5 font-bold text-indigo-700">
                {report.category}
              </span>
            ) : null}
            {place ? (
              <span className="rounded-full bg-slate-100 px-2 py-0.5 font-semibold text-slate-600">
                📍 {place}
              </span>
            ) : null}
            {report.happenedAt ? (
              <span className="text-slate-500">🕒 {when(report.happenedAt)}</span>
            ) : null}
          </div>

          <h1 className="text-2xl font-black leading-tight">{report.title}</h1>

          <p className="text-sm text-slate-500">
            {report.source} · {when(report.publishedAt)}
          </p>

          {hero ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={hero}
              alt={report.title}
              className="max-h-[26rem] w-full rounded-2xl object-cover"
            />
          ) : null}

          {report.submittedBy ? (
            <div className="flex flex-wrap items-center gap-2 text-sm text-slate-600">
              {report.submittedBy.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={report.submittedBy.avatarUrl}
                  alt=""
                  className="h-7 w-7 rounded-full object-cover"
                />
              ) : (
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-fuchsia-500 to-indigo-500 text-xs font-bold text-white">
                  {report.submittedBy.name.slice(0, 1).toUpperCase()}
                </span>
              )}
              {report.submittedBy.username ? (
                <Link
                  href={`/${report.submittedBy.username}`}
                  className="font-semibold hover:text-indigo-600"
                >
                  {report.submittedBy.name}
                </Link>
              ) : (
                <span className="font-semibold">{report.submittedBy.name}</span>
              )}
              <JournalistBadge level={levelFor(approved)} />
            </div>
          ) : null}

          <p className="whitespace-pre-line text-[15px] leading-relaxed text-slate-700">
            {report.summary}
          </p>

          <InArticleAd />

          {report.link && report.link !== report.sourceUrl ? (
            <a
              href={report.link}
              target="_blank"
              rel="noreferrer nofollow"
              className="inline-block rounded-xl bg-indigo-600 px-4 py-2 text-sm font-bold text-white hover:bg-indigo-700"
            >
              Read the full story at {report.source} →
            </a>
          ) : null}

          {report.photoUrls.length ? (
            <div className="grid gap-2 sm:grid-cols-2">
              {report.photoUrls.map((url) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={url}
                  src={url}
                  alt=""
                  className="w-full rounded-2xl object-cover"
                  loading="lazy"
                />
              ))}
            </div>
          ) : null}

          {report.videoUrl ? (
            <SocialEmbed url={report.videoUrl} label="Watch the video" />
          ) : null}

          {report.sourceUrl && isEmbeddable(report.sourceUrl) ? (
            <SocialEmbed url={report.sourceUrl} label="See the original post" />
          ) : null}

          <dl className="grid gap-2 rounded-2xl bg-slate-50 p-3 text-sm sm:grid-cols-2">
            {report.sourceType ? (
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Where the reporter saw it
                </dt>
                <dd className="font-semibold text-slate-700">
                  {report.sourceType}
                </dd>
              </div>
            ) : null}
            {report.sourceUrl ? (
              <div className="min-w-0">
                <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Source link
                </dt>
                <dd className="truncate">
                  <a
                    href={report.sourceUrl}
                    target="_blank"
                    rel="noreferrer nofollow"
                    className="font-semibold text-indigo-600 hover:underline"
                  >
                    {report.sourceUrl}
                  </a>
                </dd>
              </div>
            ) : null}
            {report.declaredAt ? (
              <div className="sm:col-span-2">
                <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Reporter&rsquo;s declaration
                </dt>
                <dd className="text-slate-600">
                  Witnessed or verified personally · media unedited · location
                  and time accurate · not AI-generated
                </dd>
              </div>
            ) : null}
          </dl>

          <ReportVerdicts
            newsId={report.id}
            counts={{
              confirmed: count("CONFIRMED"),
              doubted: count("DOUBTED"),
              fake: count("FAKE"),
            }}
            mine={mine?.verdict ?? null}
            canVote={Boolean(user)}
            isAuthor={isAuthor}
          />

          <ShareButtons
            url={`${siteUrl()}/news/${report.id}`}
            title={report.title}
          />

          <p className="text-xs text-slate-500">
            Godesi is not the publisher of member reports and does not witness
            them. Read our{" "}
            <Link href="/terms" className="font-semibold underline">
              terms
            </Link>
            . Something wrong?{" "}
            <Link href="/contact" className="font-semibold underline">
              Tell the news desk
            </Link>
            .
          </p>
        </Card>

        {related.length ? (
          <Card className="space-y-3">
            <h2 className="text-lg font-black">More desi news</h2>
            <div className="grid gap-3 sm:grid-cols-2 [&>*]:min-w-0">
              {related.map((item) => (
                <Link
                  key={item.id}
                  href={`/news/${item.id}`}
                  className="flex gap-3 rounded-2xl border border-slate-200 p-2 transition hover:border-indigo-300 hover:shadow-sm"
                >
                  {item.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.imageUrl}
                      alt=""
                      loading="lazy"
                      className="h-16 w-20 shrink-0 rounded-xl object-cover"
                    />
                  ) : null}
                  <span className="min-w-0">
                    <span className="line-clamp-2 block text-sm font-bold text-slate-900">
                      {item.title}
                    </span>
                    <span className="mt-1 block truncate text-xs text-slate-500">
                      {item.source}
                    </span>
                  </span>
                </Link>
              ))}
            </div>
          </Card>
        ) : null}

        <Card className="space-y-2">
          <h2 className="text-lg font-black">📣 Seen something in your city?</h2>
          <p className="text-sm text-slate-700">
            Godesi runs on what the community reports — a temple event, a new
            shop, a scam warning, a school win. Post it and your story appears on
            Godesi and across the desi network.
          </p>
          <div className="flex flex-wrap gap-2 text-sm font-bold">
            <Link
              href="/news/report"
              className="rounded-xl bg-indigo-600 px-3 py-2 text-white hover:bg-indigo-700"
            >
              Report local news
            </Link>
            <Link
              href="/events"
              className="rounded-xl border border-slate-200 px-3 py-2 text-slate-700 hover:bg-slate-50"
            >
              Desi events near you
            </Link>
            <Link
              href="/businesses"
              className="rounded-xl border border-slate-200 px-3 py-2 text-slate-700 hover:bg-slate-50"
            >
              Find a desi business
            </Link>
          </div>
        </Card>

        <Link
          href="/news"
          className="inline-block text-sm font-semibold text-indigo-600 hover:underline"
        >
          ← All news
        </Link>
      </article>

      <SidebarBanners />
    </div>
  );
}
