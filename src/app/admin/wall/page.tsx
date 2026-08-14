import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getCurrentUser, isStaff } from "@/lib/auth";
import { can } from "@/lib/permissions";
import {
  deleteWallTopicAction,
  saveWallTopicAction,
  toggleWallTopicAction,
} from "@/app/actions/wall";
import { Card, inputClass } from "@/components/ui";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "News wall" };

export default async function Page() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/admin/wall");
  if (!isStaff(user) || !can(user, "news")) redirect("/dashboard");

  const topics = await db.wallTopic.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-2xl font-bold">News wall</h1>
        <Link href="/wall" className="text-sm font-semibold text-indigo-700">
          View the wall →
        </Link>
      </div>

      <Card>
        <h2 className="mb-1 text-lg font-bold">Add a topic</h2>
        <p className="mb-3 text-sm text-slate-500">
          Each topic becomes one box on /wall, filled with live Google News
          headlines and public Mastodon posts. Lower sort numbers show first.
        </p>
        <form
          action={saveWallTopicAction}
          className="grid gap-2 sm:grid-cols-[6rem,1fr,1fr,6rem,auto]"
        >
          <input
            name="emoji"
            placeholder="🇮🇳"
            aria-label="Emoji"
            className={inputClass}
          />
          <input
            name="label"
            required
            placeholder="Shown on the box, e.g. H-1B visa"
            aria-label="Label"
            className={inputClass}
          />
          <input
            name="query"
            required
            placeholder="Searched for, e.g. h1b visa"
            aria-label="Keyword"
            className={inputClass}
          />
          <input
            name="sortOrder"
            type="number"
            min={0}
            max={9999}
            defaultValue={(topics.length + 1) * 10}
            aria-label="Sort order"
            className={inputClass}
          />
          <button className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-bold text-white">
            Add
          </button>
        </form>
      </Card>

      <Card>
        <h2 className="mb-3 text-lg font-bold">
          Topics ({topics.filter((topic) => topic.active).length} live of{" "}
          {topics.length})
        </h2>
        <ul className="divide-y divide-slate-100 text-sm">
          {topics.map((topic) => (
            <li key={topic.id} className="space-y-2 py-3">
              <form
                action={saveWallTopicAction}
                className="grid gap-2 sm:grid-cols-[6rem,1fr,1fr,6rem,auto]"
              >
                <input type="hidden" name="id" value={topic.id} />
                <input
                  name="emoji"
                  defaultValue={topic.emoji ?? ""}
                  aria-label="Emoji"
                  className={inputClass}
                />
                <input
                  name="label"
                  defaultValue={topic.label}
                  required
                  aria-label="Label"
                  className={inputClass}
                />
                <input
                  name="query"
                  defaultValue={topic.query}
                  required
                  aria-label="Keyword"
                  className={inputClass}
                />
                <input
                  name="sortOrder"
                  type="number"
                  min={0}
                  max={9999}
                  defaultValue={topic.sortOrder}
                  aria-label="Sort order"
                  className={inputClass}
                />
                <button className="rounded-xl border border-slate-300 px-3 py-2 text-xs font-semibold hover:bg-slate-50">
                  save
                </button>
              </form>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">
                  {topic.active ? "live" : "hidden"}
                </span>
                <form action={toggleWallTopicAction}>
                  <input type="hidden" name="id" value={topic.id} />
                  <button className="rounded-lg border border-slate-300 px-2 py-1 text-xs font-semibold hover:bg-slate-50">
                    {topic.active ? "hide" : "show"}
                  </button>
                </form>
                <form action={deleteWallTopicAction}>
                  <input type="hidden" name="id" value={topic.id} />
                  <button className="rounded-lg border border-rose-300 px-2 py-1 text-xs font-semibold text-rose-700 hover:bg-rose-50">
                    delete
                  </button>
                </form>
              </div>
            </li>
          ))}
          {topics.length === 0 ? (
            <li className="py-2 text-slate-500">
              No topics yet — the wall falls back to a built-in list.
            </li>
          ) : null}
        </ul>
      </Card>
    </div>
  );
}
