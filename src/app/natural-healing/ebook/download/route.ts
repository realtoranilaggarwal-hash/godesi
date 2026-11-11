import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { siteUrl } from "@/lib/format";
import { WELLNESS_EBOOK_PATH } from "@/lib/wellness";

export const dynamic = "force-dynamic";

/**
 * Members only: logs the download (once per member, re-downloads reuse the row)
 * and serves the PDF. Bundled PDFs live in private/ebooks/ so the file cannot be
 * fetched without signing in; a full URL in pdfUrl is redirected to instead.
 */
export async function GET() {
  const user = await getCurrentUser();
  if (!user)
    return NextResponse.redirect(
      `${siteUrl()}/login?next=${encodeURIComponent(WELLNESS_EBOOK_PATH)}`,
      { status: 302 },
    );

  const ebook = await db.wellnessEbook.findFirst({
    where: { active: true },
    orderBy: { createdAt: "desc" },
    select: { id: true, slug: true, pdfUrl: true },
  });
  if (!ebook) return NextResponse.redirect(`${siteUrl()}${WELLNESS_EBOOK_PATH}`, { status: 302 });

  await db.ebookDownload
    .upsert({
      where: { userId_ebookId: { userId: user.id, ebookId: ebook.id } },
      create: { userId: user.id, ebookId: ebook.id },
      update: {},
    })
    .catch(() => null);

  if (/^https?:\/\//.test(ebook.pdfUrl)) return NextResponse.redirect(ebook.pdfUrl, { status: 302 });

  const file = path.join(process.cwd(), "private", "ebooks", path.basename(ebook.pdfUrl));
  const pdf = await readFile(file).catch(() => null);
  if (!pdf) return NextResponse.redirect(`${siteUrl()}${WELLNESS_EBOOK_PATH}`, { status: 302 });

  return new NextResponse(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${ebook.slug}.pdf"`,
      "Cache-Control": "private, no-store",
      "X-Robots-Tag": "noindex",
    },
  });
}
