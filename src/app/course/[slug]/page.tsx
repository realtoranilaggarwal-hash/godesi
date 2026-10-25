import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { buyCourseAction, hasCourseAccess } from "@/app/actions/course";
import {
  AUTHOR_NAME,
  AUTHOR_PHOTO,
  AUTHOR_PROFILE_HREF,
  courseBySlug,
} from "@/lib/courses";
import { Alert, Card } from "@/components/ui";

export const dynamic = "force-dynamic";

export function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Metadata {
  const course = courseBySlug(params.slug);
  if (!course) return {};
  return {
    title: `${course.title} — by ${AUTHOR_NAME}`,
    description: course.tagline,
    alternates: { canonical: `/course/${course.slug}` },
  };
}

export default async function CourseSalesPage({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams: { error?: string };
}) {
  const course = courseBySlug(params.slug);
  if (!course) notFound();

  const user = await getCurrentUser();
  if (user && (await hasCourseAccess(user.id, course.slug))) {
    redirect(`/course/${course.slug}/learn`);
  }

  const price = (course.priceMinor / 100).toFixed(0);
  const listPrice = (course.listPriceMinor / 100).toFixed(0);

  const buyButton = (
    <>
      Buy the course — ${price}{" "}
      <span className="text-sm font-bold text-fuchsia-400 line-through">
        ${listPrice}
      </span>
    </>
  );

  return (
    <div className="space-y-8">
      <section className="overflow-hidden rounded-3xl bg-gradient-to-br from-violet-700 via-fuchsia-600 to-amber-500 p-8 text-white shadow-xl sm:p-12">
        <div className="flex flex-wrap items-center gap-6">
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold uppercase tracking-widest text-amber-200">
              {course.title}
            </p>
            <h1 className="mt-2 max-w-2xl text-3xl font-black leading-tight sm:text-4xl">
              {course.pitch}
            </h1>
            <p className="mt-3 max-w-2xl text-sm text-white/90 sm:text-base">
              {course.tagline}
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-4">
              {user ? (
                <form action={buyCourseAction}>
                  <input type="hidden" name="course" value={course.slug} />
                  <button
                    type="submit"
                    className="rounded-2xl bg-white px-6 py-3 text-base font-black text-fuchsia-700 shadow-lg transition hover:scale-105"
                  >
                    {buyButton}
                  </button>
                </form>
              ) : (
                <Link
                  href={`/login?next=/course/${course.slug}`}
                  className="rounded-2xl bg-white px-6 py-3 text-base font-black text-fuchsia-700 shadow-lg transition hover:scale-105"
                >
                  {buyButton}
                </Link>
              )}
              <span className="rounded-full bg-amber-300 px-2.5 py-1 text-xs font-black text-amber-950">
                LAUNCH DEAL · was ${listPrice}
              </span>
              <span className="text-xs text-white/80">
                One payment · lifetime access · {course.lessons.length} lessons
              </span>
            </div>
            {searchParams.error === "cancelled" ? (
              <p className="mt-3 text-xs font-semibold text-white/90">
                Checkout was cancelled — nothing was charged. Try again any
                time.
              </p>
            ) : null}
            {searchParams.error === "stripe_unavailable" ? (
              <p className="mt-3 text-xs font-semibold text-white/90">
                Card payments are temporarily unavailable — please try later.
              </p>
            ) : null}
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={course.cover}
            alt={`${course.title} cover`}
            className="w-full max-w-[240px] shrink-0 rounded-2xl border-4 border-white/30 object-cover shadow-lg sm:max-w-[300px]"
          />
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {course.highlights.map((h) => (
          <Card key={h.title} className="p-4">
            <p className="text-2xl">{h.icon}</p>
            <p className="mt-1 text-sm font-bold">{h.title}</p>
            <p className="mt-1 text-xs text-slate-500">{h.body}</p>
          </Card>
        ))}
      </div>

      <Card className="p-5">
        <h2 className="text-lg font-bold">What you&apos;ll learn</h2>
        <p className="mb-3 text-sm text-slate-500">
          {course.lessons.length} short lessons — each under 10 minutes.
        </p>
        <ol className="divide-y divide-slate-100">
          {course.lessons.map((lesson, i) => (
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

      <Link href={AUTHOR_PROFILE_HREF} className="group block">
        <Card className="flex flex-wrap items-center gap-4 p-5 transition group-hover:border-amber-400">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={AUTHOR_PHOTO}
            alt={AUTHOR_NAME}
            className="h-16 w-16 rounded-2xl object-cover"
          />
          <div className="text-sm">
            <p className="font-bold">
              Taught by {AUTHOR_NAME}{" "}
              <span className="font-semibold text-amber-600 group-hover:underline">
                View profile →
              </span>
            </p>
            <p className="mt-0.5 text-slate-500">
              New Jersey realtor, insurance professional and investor — teaching
              the part-time income paths he uses himself.
            </p>
          </div>
        </Card>
      </Link>

      <Alert tone="info">
        <strong>Why ${price} (was ${listPrice})?</strong> Cheap enough to buy
        on impulse, real enough to take seriously. One payment, the lessons
        stay yours forever.{" "}
        <Link href="/course" className="font-semibold underline">
          See all courses →
        </Link>
      </Alert>
    </div>
  );
}
