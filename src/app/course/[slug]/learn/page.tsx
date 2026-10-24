import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { hasCourseAccess } from "@/app/actions/course";
import { AUTHOR_NAME, courseBySlug } from "@/lib/courses";
import { Alert, Card } from "@/components/ui";

export const dynamic = "force-dynamic";

export function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Metadata {
  const course = courseBySlug(params.slug);
  return {
    title: course ? `${course.title} — lessons` : "Course",
    robots: { index: false },
  };
}

/** The paid course area — only PAID enrollments get in. */
export default async function CourseLearnPage({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams: { welcome?: string };
}) {
  const course = courseBySlug(params.slug);
  if (!course) notFound();

  const user = await getCurrentUser();
  if (!user) redirect(`/login?next=/course/${course.slug}/learn`);
  if (!(await hasCourseAccess(user.id, course.slug))) {
    redirect(`/course/${course.slug}`);
  }

  return (
    <div className="space-y-6">
      {searchParams.welcome ? (
        <Alert tone="success">
          🎉 Payment received — welcome to the course! Your seat is unlocked
          for life. Start at lesson 1 below.
        </Alert>
      ) : null}

      <section className="rounded-3xl bg-gradient-to-br from-violet-700 via-fuchsia-600 to-amber-500 p-6 text-white sm:p-8">
        <p className="text-xs font-bold uppercase tracking-widest text-amber-200">
          {course.title} · by {AUTHOR_NAME}
        </p>
        <h1 className="mt-1 text-2xl font-black sm:text-3xl">
          Your lessons — {course.lessons.length} steps to a new income skill
        </h1>
      </section>

      <ol className="space-y-5">
        {course.lessons.map((lesson, i) => (
          <li key={lesson.title}>
            <Card className="p-5">
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-violet-100 text-sm font-black text-violet-700">
                  {i + 1}
                </span>
                <h2 className="flex-1 text-base font-bold sm:text-lg">
                  {lesson.title}
                </h2>
                <span className="text-xs text-slate-400">
                  {lesson.minutes} min
                </span>
              </div>
              <div className="mt-3 space-y-3 text-sm leading-relaxed text-slate-700">
                {lesson.paragraphs.map((p, j) => (
                  <p key={j}>{p}</p>
                ))}
                {lesson.bullets?.length ? (
                  <ul className="list-disc space-y-1.5 pl-5">
                    {lesson.bullets.map((b, j) => (
                      <li key={j}>{b}</li>
                    ))}
                  </ul>
                ) : null}
              </div>
            </Card>
          </li>
        ))}
      </ol>

      <Card className="border-amber-200 bg-amber-50 p-5">
        <h2 className="text-base font-bold">Keep learning</h2>
        <p className="mt-1 text-sm text-slate-600">
          Every GoDesi course is a $9 launch deal —{" "}
          <Link href="/course" className="font-semibold text-indigo-600">
            browse the catalog
          </Link>{" "}
          and stack the next skill.
        </p>
      </Card>
    </div>
  );
}
