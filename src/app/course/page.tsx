import type { Metadata } from "next";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { AUTHOR_NAME, AUTHOR_PHOTO, COURSES } from "@/lib/courses";
import { Card } from "@/components/ui";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "GoDesi Courses — learn to earn, taught by Anil Aggarwal, Realtor",
  description:
    "Short practical courses on making money online and in real estate — marketing, life insurance, flipping, rentals, multifamily and more. Launch deal $9 each.",
  alternates: { canonical: "/course" },
};

/** The course catalog — every course sells separately. */
export default async function CourseCatalogPage() {
  const user = await getCurrentUser();
  const owned = user
    ? new Set(
        (
          await db.courseEnrollment.findMany({
            where: { userId: user.id, status: "PAID" },
            select: { courseSlug: true },
          })
        ).map((e) => e.courseSlug)
      )
    : new Set<string>();

  return (
    <div className="space-y-8">
      <section className="overflow-hidden rounded-3xl bg-gradient-to-br from-violet-700 via-fuchsia-600 to-amber-500 p-8 text-white shadow-xl sm:p-10">
        <div className="flex flex-wrap items-center gap-6">
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold uppercase tracking-widest text-amber-200">
              GoDesi Courses
            </p>
            <h1 className="mt-2 text-3xl font-black leading-tight sm:text-4xl">
              Learn to earn — real skills, real income, one payment.
            </h1>
            <p className="mt-3 max-w-2xl text-sm text-white/90 sm:text-base">
              Short, practical courses by <strong>{AUTHOR_NAME}</strong> — make
              money online, in insurance, and in real estate. Each course is
              $9 during the launch deal (list price $99) — one payment, yours
              for life.
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-3 text-xs font-bold">
              <span className="rounded-full bg-amber-300 px-3 py-1 text-amber-950">
                LAUNCH DEAL · $9 each · was $99
              </span>
              <span className="text-white/80">
                {COURSES.length} courses · more added as the catalog grows
              </span>
            </div>
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={AUTHOR_PHOTO}
            alt={AUTHOR_NAME}
            className="h-28 w-28 shrink-0 rounded-2xl border-4 border-white/40 object-cover shadow-lg sm:h-36 sm:w-36"
          />
        </div>
      </section>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {COURSES.map((course) => {
          const isOwned = owned.has(course.slug);
          return (
            <Link
              key={course.slug}
              href={`/course/${course.slug}`}
              className="group"
            >
              <Card className="h-full overflow-hidden p-0 transition group-hover:-translate-y-0.5 group-hover:shadow-lg">
                <div className="relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={course.cover}
                    alt={`${course.title} — by ${AUTHOR_NAME}`}
                    className="aspect-[4/3] w-full object-cover"
                    loading="lazy"
                  />
                  {isOwned ? (
                    <span className="absolute right-2 top-2 rounded-full bg-emerald-500 px-2.5 py-1 text-xs font-black text-white shadow">
                      OWNED ✓
                    </span>
                  ) : (
                    <span className="absolute right-2 top-2 rounded-full bg-amber-300 px-2.5 py-1 text-xs font-black text-amber-950 shadow">
                      $9 · was $99
                    </span>
                  )}
                </div>
                <div className="p-4">
                  <p className="text-base font-black leading-snug text-slate-900">
                    {course.emoji} {course.shortTitle}
                  </p>
                  <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-slate-500">
                    {course.tagline}
                  </p>
                  <div className="mt-3 flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-500">
                      {course.lessons.length} lessons · by {AUTHOR_NAME}
                    </span>
                    <span className="font-black text-indigo-600 group-hover:underline">
                      {isOwned ? "Open course →" : "See course →"}
                    </span>
                  </div>
                </div>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
