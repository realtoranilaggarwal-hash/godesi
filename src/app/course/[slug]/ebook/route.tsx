import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { hasCourseAccess } from "@/app/actions/course";
import { courseBySlug } from "@/lib/courses";
import { renderCourseEbook } from "@/lib/courseEbook";
import { siteUrl } from "@/lib/format";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/** The course as a PDF ebook — only members with a PAID enrollment can download it. */
export async function GET(_request: Request, { params }: { params: { slug: string } }) {
  const course = courseBySlug(params.slug);
  if (!course) return new Response("Not found", { status: 404 });

  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.redirect(`${siteUrl()}/login?next=/course/${course.slug}/ebook`);
  }
  if (!(await hasCourseAccess(user.id, course.slug))) {
    return NextResponse.redirect(`${siteUrl()}/course/${course.slug}`);
  }

  const pdf = await renderCourseEbook(course, user.name?.trim() || user.email);
  return new Response(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="godesi-${course.slug}-ebook.pdf"`,
      "Cache-Control": "private, no-store",
    },
  });
}
