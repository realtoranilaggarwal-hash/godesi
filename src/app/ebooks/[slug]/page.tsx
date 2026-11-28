import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { hasCourseAccess } from "@/app/actions/course";
import { buyMemberEbookAction, claimFreeMemberEbookAction, freePickUsed } from "@/app/actions/memberEbook";
import { MemberEbookShelf } from "@/components/MemberEbookShelf";
import {
  MEMBER_EBOOK_PRICE_MINOR,
  memberEbookBySlug,
  memberEbookCover,
  memberEbookKey,
  memberEbooksFor,
} from "@/lib/memberEbooks";
import { metaDescription } from "@/lib/seo";

export const dynamic = "force-dynamic";

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const book = memberEbookBySlug(params.slug);
  if (!book) return {};
  return {
    title: `${book.title} — ebook by ${book.ownerName}`,
    description: metaDescription(book.subtitle, "A practical PDF ebook hosted on GoDesi. GoDesi members pick one ebook free."),
    alternates: { canonical: `/ebooks/${book.slug}` },
  };
}

const ERRORS: Record<string, string> = {
  pick_used: "You already used your free pick from this shelf. You can still buy this one.",
  cancelled: "Checkout was cancelled — nothing was charged.",
  stripe_unavailable: "Card payments are temporarily unavailable — please try later.",
};

export default async function MemberEbookPage({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams: { error?: string; welcome?: string };
}) {
  const book = memberEbookBySlug(params.slug);
  if (!book) notFound();
  const user = await getCurrentUser();
  const shelf = memberEbooksFor(book.owner);
  const [owned, pickUsed, ownedSlugs] = user
    ? await Promise.all([
        hasCourseAccess(user.id, memberEbookKey(book.slug)),
        freePickUsed(book.owner, user.id),
        db.courseEnrollment
          .findMany({
            where: { userId: user.id, status: "PAID", courseSlug: { in: shelf.map((b) => memberEbookKey(b.slug)) } },
            select: { courseSlug: true },
          })
          .then((rows) => new Set(rows.map((r) => r.courseSlug.replace(/^ebook:/, "")))),
      ])
    : [false, false, new Set<string>()];
  const price = `$${(MEMBER_EBOOK_PRICE_MINOR / 100).toFixed(2)}`;
  const next = `/ebooks/${book.slug}`;
  const error = searchParams.error ? ERRORS[searchParams.error] : null;
  const primary =
    "rounded-2xl bg-amber-400 px-5 py-3 text-base font-black text-slate-950 shadow transition hover:scale-105";
  const secondary = "rounded-2xl border-2 border-white/70 px-5 py-3 text-base font-bold text-white hover:bg-white/10";

  return (
    <div className="space-y-8">
      <p className="text-sm text-slate-500">
        <Link href={`/${book.owner}#ebooks`} className="underline">
          ← {book.ownerName}&apos;s ebooks
        </Link>
      </p>
      <section className="overflow-hidden rounded-3xl bg-slate-900 p-6 text-white shadow-xl sm:p-10">
        <div className="flex flex-wrap items-start gap-6">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={memberEbookCover(book)}
            alt={`${book.title} cover`}
            className="w-40 shrink-0 rounded-xl shadow-lg sm:w-56"
          />
          <div className="min-w-0 flex-1 basis-64">
            <p className="text-xs font-bold uppercase tracking-widest text-amber-400">
              Ebook · {book.audience} · by {book.ownerName}
            </p>
            <h1 className="mt-2 text-2xl font-black leading-tight sm:text-4xl">{book.title}</h1>
            <p className="mt-2 text-sm text-white/85 sm:text-base">{book.subtitle}</p>
            {searchParams.welcome && owned ? (
              <p className="mt-4 rounded-xl bg-emerald-500/20 px-3 py-2 text-sm font-semibold text-emerald-200">
                🎉 It&apos;s yours. Download the PDF any time from this page.
              </p>
            ) : null}
            {error ? (
              <p className="mt-4 rounded-xl bg-red-500/20 px-3 py-2 text-sm font-semibold text-red-100">{error}</p>
            ) : null}
            <div className="mt-5 flex flex-wrap items-center gap-3">
              {owned ? (
                <a href={`${next}/pdf`} className={primary}>
                  ⬇ Download the PDF
                </a>
              ) : !user ? (
                <>
                  <Link href={`/signup?next=${next}`} className={primary}>
                    🎁 Join GoDesi free — get this ebook free
                  </Link>
                  <Link href={`/login?next=${next}`} className={secondary}>
                    Sign in
                  </Link>
                </>
              ) : (
                <>
                  {pickUsed ? null : (
                    <form action={claimFreeMemberEbookAction}>
                      <input type="hidden" name="ebook" value={book.slug} />
                      <button type="submit" className={primary}>
                        🎁 Pick this one free
                      </button>
                    </form>
                  )}
                  <form action={buyMemberEbookAction}>
                    <input type="hidden" name="ebook" value={book.slug} />
                    <button type="submit" className={pickUsed ? primary : secondary}>
                      Buy the PDF — {price}
                    </button>
                  </form>
                </>
              )}
            </div>
            {!owned ? (
              <p className="mt-3 text-xs text-white/70">
                Every GoDesi member gets 1 ebook free from this shelf. The others are {price} each.
              </p>
            ) : null}
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <p className="text-base font-semibold">{book.pitch}</p>
        <ul className="list-disc space-y-1 pl-5 text-sm text-slate-700">
          {book.bullets.map((b) => (
            <li key={b}>{b}</li>
          ))}
        </ul>
        {book.chapters.length ? (
          <>
            <h2 className="pt-2 text-lg font-bold">Chapters</h2>
            <ol className="space-y-1 text-sm text-slate-700">
              {book.chapters.map((c) => (
                <li key={c.title}>{c.title}</li>
              ))}
            </ol>
          </>
        ) : null}
      </section>

      <MemberEbookShelf
        books={shelf}
        ownedSlugs={ownedSlugs}
        pickUsed={pickUsed}
        signedIn={Boolean(user)}
        exclude={book.slug}
        heading={`More ebooks by ${book.ownerName}`}
      />
    </div>
  );
}
