import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { hasCourseAccess } from "@/app/actions/course";
import { pdfText } from "@/lib/courseEbook";
import { siteUrl } from "@/lib/format";
import { memberEbookBySlug, memberEbookKey } from "@/lib/memberEbooks";
import { memberEbookPdf } from "@/lib/memberEbookPdf";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(_request: Request, { params }: { params: { slug: string } }) {
  const book = memberEbookBySlug(params.slug);
  if (!book) return new Response("Not found", { status: 404 });
  const user = await getCurrentUser();
  if (!user) return NextResponse.redirect(`${siteUrl()}/login?next=/ebooks/${book.slug}`);
  if (!(await hasCourseAccess(user.id, memberEbookKey(book.slug)))) {
    return NextResponse.redirect(`${siteUrl()}/ebooks/${book.slug}`);
  }
  const pdf = await memberEbookPdf(book, pdfText(user.name ?? "") || user.email);
  return new Response(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="godesi-${book.slug}.pdf"`,
      "Cache-Control": "private, no-store",
    },
  });
}
