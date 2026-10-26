import { NextResponse } from "next/server";
import { AUTHOR_NAME, COURSES } from "@/lib/courses";
import { siteUrl } from "@/lib/format";
import { FEED_HEADERS } from "@/lib/publicEvents";

/** Public course catalog so Anil's other sites can list the courses. */
export function GET() {
  const base = siteUrl();
  const absolute = (path: string) => (path.startsWith("/") ? `${base}${path}` : path);
  return NextResponse.json(
    {
      author: AUTHOR_NAME,
      items: COURSES.map((course) => ({
        slug: course.slug,
        title: course.title,
        shortTitle: course.shortTitle,
        tagline: course.tagline,
        emoji: course.emoji,
        cover: absolute(course.cover),
        priceMinor: course.priceMinor,
        listPriceMinor: course.listPriceMinor,
        lessons: course.lessons.length,
        url: `${base}/course/${course.slug}`,
      })),
    },
    { headers: FEED_HEADERS },
  );
}
