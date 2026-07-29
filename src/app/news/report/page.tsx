import type { Metadata } from "next";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { journalistStats, JOURNALIST_RULES } from "@/lib/journalists";
import { ReportForm } from "@/components/forms/ReportForm";
import { JournalistBadge } from "@/components/JournalistBadge";
import { SidebarBanners } from "@/components/Banners";
import { Card, LinkButton } from "@/components/ui";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Report local news",
  description:
    "Saw something in your desi neighbourhood? File a report for the Godesi news desk.",
};

export default async function ReportNewsPage() {
  const user = await getCurrentUser();
  const stats = user ? await journalistStats(user.id) : null;

  return (
    <div className="flex gap-6">
      <div className="min-w-0 flex-1 space-y-5">
        <section className="rounded-3xl bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 px-5 py-7 text-white sm:px-8">
          <h1 className="text-3xl font-black">Report local news 📰</h1>
          <p className="mt-2 max-w-2xl text-white/90">
            A festival, a store opening, a scam warning, a road closure — if it
            matters to desis around you, file it here. The news desk checks
            every report, then readers confirm or challenge it.
          </p>
          {stats?.level ? (
            <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
              <JournalistBadge level={stats.level} beat={stats.beat} />
              <span className="text-white/90">
                Trust score {stats.trust.score}/100 · {stats.approved} published
              </span>
            </div>
          ) : null}
        </section>

        <Card>
          {user ? (
            <ReportForm defaultCity={user.location ?? ""} />
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-slate-600">
                Sign in to file a report — it is free, and your name runs with
                the story.
              </p>
              <LinkButton href="/login?next=/news/report">
                Sign in to report
              </LinkButton>
            </div>
          )}
        </Card>

        <Card>
          <h2 className="text-lg font-bold">The ground rules 📋</h2>
          <ul className="mt-3 space-y-2 text-sm text-slate-600">
            {JOURNALIST_RULES.map((rule) => (
              <li key={rule} className="flex gap-2">
                <span aria-hidden>•</span>
                <span>{rule}</span>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-sm text-slate-600">
            Keep reporting and you climb from Contributor to Editor — and an
            Editor gets a{" "}
            <Link
              href="/journalists"
              className="font-semibold text-indigo-600 hover:underline"
            >
              Godesi press card
            </Link>
            .
          </p>
        </Card>
      </div>

      <SidebarBanners />
    </div>
  );
}
