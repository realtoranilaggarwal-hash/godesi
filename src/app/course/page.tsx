import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { buyCourseAction, hasCourseAccess } from "@/app/actions/course";
import {
  COURSE_TAGLINE,
  COURSE_TITLE,
  LESSONS,
} from "@/lib/course";
import { Alert, Card } from "@/components/ui";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: `${COURSE_TITLE} — make money online with UGC & affiliate marketing`,
  description: COURSE_TAGLINE,
  alternates: { canonical: "/course" },
};

const HIGHLIGHTS = [
  {
    icon: "🎬",
    title: "UGC income",
    body: "Get paid $50–$500 a video making simple clips for brands — no followers needed.",
  },
  {
    icon: "🔗",
    title: "Affiliate money",
    body: "Earn a cut every time someone buys through your link — with the GoDesi partner program as a live example.",
  },
  {
    icon: "📱",
    title: "Free traffic",
    body: "The TikTok/short-video playbook: hooks, daily posting, and turning viewers into buyers.",
  },
  {
    icon: "🏠",
    title: "Scale up",
    body: "From renting attention to owning it — list, website, products — and from renting a home to owning one.",
  },
];

export default async function CoursePage({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  const user = await getCurrentUser();
  if (user && (await hasCourseAccess(user.id))) redirect("/course/learn");

  return (
    <div className="space-y-8">
      {/* Sales hero */}
      <section className="overflow-hidden rounded-3xl bg-gradient-to-br from-violet-700 via-fuchsia-600 to-amber-500 p-8 text-white shadow-xl sm:p-12">
        <p className="text-sm font-bold uppercase tracking-widest text-amber-200">
          {COURSE_TITLE}
        </p>
        <h1 className="mt-2 max-w-2xl text-3xl font-black leading-tight sm:text-4xl">
          Learn how people really make money online — for the price of a coffee.
        </h1>
        <p className="mt-3 max-w-2xl text-sm text-white/90 sm:text-base">
          {COURSE_TAGLINE}
        </p>
        <div className="mt-6 flex flex-wrap items-center gap-4">
          {user ? (
            <form action={buyCourseAction}>
              <button
                type="submit"
                className="rounded-2xl bg-white px-6 py-3 text-base font-black text-fuchsia-700 shadow-lg transition hover:scale-105"
              >
                Buy the course — $9{" "}
                <span className="text-sm font-bold text-fuchsia-400 line-through">
                  $99
                </span>
              </button>
            </form>
          ) : (
            <Link
              href="/login?next=/course"
              className="rounded-2xl bg-white px-6 py-3 text-base font-black text-fuchsia-700 shadow-lg transition hover:scale-105"
            >
              Buy the course — $9{" "}
              <span className="text-sm font-bold text-fuchsia-400 line-through">
                $99
              </span>
            </Link>
          )}
          <span className="rounded-full bg-amber-300 px-2.5 py-1 text-xs font-black text-amber-950">
            LAUNCH DEAL · was $99
          </span>
          <span className="text-xs text-white/80">
            One payment · lifetime access · {LESSONS.length} lessons
          </span>
        </div>
        {searchParams.error === "cancelled" ? (
          <p className="mt-3 text-xs font-semibold text-white/90">
            Checkout was cancelled — nothing was charged. Try again any time.
          </p>
        ) : null}
        {searchParams.error === "stripe_unavailable" ? (
          <p className="mt-3 text-xs font-semibold text-white/90">
            Card payments are temporarily unavailable — please try later.
          </p>
        ) : null}
      </section>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {HIGHLIGHTS.map((h) => (
          <Card key={h.title} className="p-4">
            <p className="text-2xl">{h.icon}</p>
            <p className="mt-1 text-sm font-bold">{h.title}</p>
            <p className="mt-1 text-xs text-slate-500">{h.body}</p>
          </Card>
        ))}
      </div>

      {/* Curriculum preview */}
      <Card className="p-5">
        <h2 className="text-lg font-bold">What you&apos;ll learn</h2>
        <p className="mb-3 text-sm text-slate-500">
          {LESSONS.length} short lessons — watch/read each in under 10 minutes.
        </p>
        <ol className="divide-y divide-slate-100">
          {LESSONS.map((lesson, i) => (
            <li key={lesson.title} className="flex items-center gap-3 py-2.5">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-violet-100 text-xs font-black text-violet-700">
                {i + 1}
              </span>
              <span className="flex-1 text-sm font-semibold">
                {lesson.title}
              </span>
              <span className="text-xs text-slate-400">
                {lesson.minutes} min
              </span>
            </li>
          ))}
        </ol>
      </Card>

      <Alert tone="info">
        <strong>Why $9 (was $99)?</strong> Cheap enough to buy on impulse,
        real enough to take seriously — exactly the anchor-pricing tactic
        lesson 6 teaches. One payment, the lessons stay yours forever.
      </Alert>
    </div>
  );
}
