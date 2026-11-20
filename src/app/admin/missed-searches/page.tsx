import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getCurrentUser, isStaff } from "@/lib/auth";
import { dismissSearchMissAction } from "@/app/actions/searchMiss";
import { Card } from "@/components/ui";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Missed searches" };

export default async function Page({
  searchParams,
}: {
  searchParams: { sort?: string };
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/admin/missed-searches");
  if (!isStaff(user)) redirect("/dashboard");

  const byCount = searchParams.sort === "count";
  const misses = await db.searchMiss.findMany({
    orderBy: byCount
      ? [{ count: "desc" }, { lastAt: "desc" }]
      : [{ lastAt: "desc" }],
    take: 200,
  });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Missed searches</h1>
      <p className="text-sm text-slate-600">
        Searches where GoDesi showed fewer than 3 results, so visitors also saw
        Google&apos;s results. Find the business on Google, add it to the{" "}
        <Link href="/admin/prospects" className="font-semibold text-indigo-600">
          call list
        </Link>{" "}
        or give it a starter card, then click Done.
      </p>
      <div className="flex gap-2 text-sm">
        <Link
          href="/admin/missed-searches"
          className={`rounded-full border px-3 py-1 ${byCount ? "border-slate-300" : "border-indigo-600 bg-indigo-50 font-semibold"}`}
        >
          Newest first
        </Link>
        <Link
          href="/admin/missed-searches?sort=count"
          className={`rounded-full border px-3 py-1 ${byCount ? "border-indigo-600 bg-indigo-50 font-semibold" : "border-slate-300"}`}
        >
          Most searched
        </Link>
      </div>
      <Card>
        {misses.length ? (
          <ul className="divide-y divide-slate-100 text-sm">
            {misses.map((miss) => {
              const words = [miss.query, miss.city].filter(Boolean).join(" ");
              return (
                <li
                  key={miss.id}
                  className="flex flex-wrap items-center justify-between gap-2 py-2"
                >
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-900">
                      “{miss.query}”
                      {miss.city ? (
                        <span className="font-normal text-slate-500">
                          {" "}
                          in {miss.city}
                        </span>
                      ) : null}
                    </p>
                    <p className="text-xs text-slate-500">
                      Searched {miss.count}×{" "}
                      {miss.page === "find" ? "on Search everything" : miss.page === "ask" ? "in Ask GoDesi" : "on Cards"}{" "}
                      · GoDesi had {miss.lastResults} result
                      {miss.lastResults === 1 ? "" : "s"} · last{" "}
                      {miss.lastAt.toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <a
                      href={`https://www.google.com/search?q=${encodeURIComponent(words)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-full border border-slate-300 px-3 py-1 text-xs font-semibold hover:bg-slate-50"
                    >
                      Look up on Google
                    </a>
                    <form action={dismissSearchMissAction}>
                      <input type="hidden" name="id" value={miss.id} />
                      <button
                        type="submit"
                        className="rounded-full bg-slate-800 px-3 py-1 text-xs font-semibold text-white hover:bg-slate-900"
                      >
                        Done
                      </button>
                    </form>
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="text-sm text-slate-500">
            No missed searches yet. They appear here when someone searches
            GoDesi and finds fewer than 3 results.
          </p>
        )}
      </Card>
    </div>
  );
}
