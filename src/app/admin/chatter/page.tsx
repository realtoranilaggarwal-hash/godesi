import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { can } from "@/lib/permissions";
import { deskFallback } from "@/lib/adminSections";
import { moderateChatterPostAction } from "@/app/actions/chatter";
import { chatterPath } from "@/lib/chatter";
import { properName } from "@/lib/names";
import { Card } from "@/components/ui";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Chatter" };

const DAY = 24 * 60 * 60 * 1000;

const postInclude = {
  author: { select: { name: true, email: true, username: true } },
  reports: {
    orderBy: { createdAt: "desc" },
    take: 10,
    select: { id: true, reason: true },
  },
  _count: { select: { reports: true } },
} satisfies Prisma.ChatterPostInclude;

type Row = Prisma.ChatterPostGetPayload<{ include: typeof postInclude }>;

function loadPosts(
  args: Omit<Prisma.ChatterPostFindManyArgs, "include" | "select">,
): Promise<Row[]> {
  return db.chatterPost.findMany({ ...args, include: postInclude });
}

function Decision({
  id,
  decision,
  label,
  tone,
}: {
  id: string;
  decision: string;
  label: string;
  tone: string;
}) {
  return (
    <form action={moderateChatterPostAction}>
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="decision" value={decision} />
      <button
        type="submit"
        className={`rounded-lg px-3 py-1 text-xs font-semibold ${tone}`}
      >
        {label}
      </button>
    </form>
  );
}

function PostRow({ post }: { post: Row }) {
  return (
    <Card>
      <div className="flex flex-wrap items-baseline gap-2 text-sm">
        <strong>{properName(post.author.name)}</strong>
        <span className="text-xs text-slate-500">{post.author.email}</span>
        <span className="text-xs text-slate-400">
          {post.createdAt.toLocaleString("en-US")}
        </span>
        {post.parentId ? (
          <span className="text-xs text-slate-500">reply</span>
        ) : null}
        {post.hiddenAt ? (
          <span className="rounded bg-rose-100 px-1.5 text-xs font-semibold text-rose-700">
            hidden · {post.hiddenReason}
          </span>
        ) : (
          <Link
            href={chatterPath(post.id)}
            className="text-xs text-indigo-700 underline"
          >
            open
          </Link>
        )}
      </div>
      <p className="mt-2 whitespace-pre-wrap text-sm">{post.body}</p>
      {post.imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={post.imageUrl}
          alt=""
          className="mt-2 max-h-40 rounded border"
        />
      ) : null}
      {post._count.reports ? (
        <ul className="mt-2 list-disc pl-5 text-xs text-rose-700">
          {post.reports.map((report) => (
            <li key={report.id}>{report.reason}</li>
          ))}
        </ul>
      ) : null}
      <div className="mt-3 flex flex-wrap gap-2">
        {post.hiddenAt ? (
          <Decision
            id={post.id}
            decision="restore"
            label="Restore"
            tone="bg-emerald-600 text-white"
          />
        ) : (
          <Decision
            id={post.id}
            decision="hide"
            label="Remove"
            tone="bg-rose-600 text-white"
          />
        )}
        {post._count.reports && !post.hiddenAt ? (
          <Decision
            id={post.id}
            decision="dismiss"
            label="Dismiss reports"
            tone="border border-slate-300"
          />
        ) : null}
        <Decision
          id={post.id}
          decision="delete"
          label="Delete for good"
          tone="border border-rose-300 text-rose-700"
        />
      </div>
    </Card>
  );
}

export default async function AdminChatterPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/admin/chatter");
  if (
    user.role !== "ADMIN" &&
    !(user.role === "MODERATOR" && can(user, "chatter"))
  ) {
    redirect(deskFallback(user, "Chatter"));
  }

  const weekAgo = new Date(Date.now() - 7 * DAY);
  const [
    reported,
    hidden,
    recent,
    postsThisWeek,
    repliesThisWeek,
    posters,
    reportsThisWeek,
  ] = await Promise.all([
    loadPosts({
      where: { reports: { some: {} }, hiddenAt: null },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
    loadPosts({
      where: { hiddenAt: { not: null } },
      orderBy: { hiddenAt: "desc" },
      take: 30,
    }),
    loadPosts({
      where: { hiddenAt: null },
      orderBy: { createdAt: "desc" },
      take: 30,
    }),
    db.chatterPost.count({
      where: { parentId: null, createdAt: { gte: weekAgo } },
    }),
    db.chatterPost.count({
      where: { parentId: { not: null }, createdAt: { gte: weekAgo } },
    }),
    db.chatterPost.groupBy({
      by: ["authorId"],
      where: { createdAt: { gte: weekAgo } },
    }),
    db.chatterReport.count({ where: { createdAt: { gte: weekAgo } } }),
  ]);
  const stats = [
    { label: "Weekly active posters", value: posters.length },
    { label: "Posts this week", value: postsThisWeek },
    {
      label: "Replies per post",
      value: postsThisWeek ? (repliesThisWeek / postsThisWeek).toFixed(1) : "0",
    },
    { label: "Reports this week", value: reportsThisWeek },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Chatter</h1>
      <div className="grid gap-3 sm:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <p className="text-2xl font-black">{stat.value}</p>
            <p className="text-xs text-slate-500">{stat.label}</p>
          </Card>
        ))}
      </div>
      <section className="space-y-3">
        <h2 className="text-lg font-bold">Reported ({reported.length})</h2>
        {reported.length ? (
          reported.map((post) => <PostRow key={post.id} post={post} />)
        ) : (
          <p className="text-sm text-slate-500">No open reports.</p>
        )}
      </section>
      <section className="space-y-3">
        <h2 className="text-lg font-bold">Hidden ({hidden.length})</h2>
        {hidden.map((post) => (
          <PostRow key={post.id} post={post} />
        ))}
      </section>
      <section className="space-y-3">
        <h2 className="text-lg font-bold">Latest posts</h2>
        {recent.map((post) => (
          <PostRow key={post.id} post={post} />
        ))}
      </section>
    </div>
  );
}
