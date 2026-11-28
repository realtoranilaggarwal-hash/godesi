import Link from "next/link";
import { MEMBER_EBOOK_PRICE_MINOR, memberEbookCover, type MemberEbook } from "@/lib/memberEbooks";

/** A member's ebook shelf: one free pick for every GoDesi member, the rest $9.99. */
export function MemberEbookShelf({
  books,
  ownedSlugs,
  pickUsed,
  signedIn,
  exclude,
  heading,
}: {
  books: MemberEbook[];
  ownedSlugs: Set<string>;
  pickUsed: boolean;
  signedIn: boolean;
  exclude?: string;
  heading?: string;
}) {
  const shown = books.filter((b) => b.slug !== exclude);
  if (!shown.length) return null;
  const price = `$${(MEMBER_EBOOK_PRICE_MINOR / 100).toFixed(2)}`;
  return (
    <section id="ebooks" className="space-y-3 scroll-mt-20">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-lg font-bold">{heading ?? `📚 Ebooks by ${shown[0].ownerName}`}</h2>
        <span className="text-xs text-slate-500">PDF · {price} each</span>
      </div>
      {pickUsed ? null : (
        <p className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          🎁 <strong>Member gift:</strong>{" "}
          {signedIn ? (
            "pick any 1 ebook below free. Just open it and tap “Pick this one free”."
          ) : (
            <>
              <Link href={`/signup?next=/${shown[0].owner}%23ebooks`} className="font-semibold underline">
                join GoDesi free
              </Link>{" "}
              (or{" "}
              <Link href={`/login?next=/${shown[0].owner}%23ebooks`} className="underline">
                sign in
              </Link>
              ) and pick any 1 ebook below free.
            </>
          )}
        </p>
      )}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {shown.map((book) => (
          <Link
            key={book.slug}
            href={`/ebooks/${book.slug}`}
            className="group overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={memberEbookCover(book)}
              alt={`${book.title} cover`}
              loading="lazy"
              className="aspect-[3/4] w-full object-cover"
            />
            <div className="p-2">
              <p className="line-clamp-2 text-sm font-semibold leading-snug group-hover:underline">{book.title}</p>
              <p className="mt-1 text-xs font-bold text-emerald-700">
                {ownedSlugs.has(book.slug) ? "✓ Yours — download" : pickUsed ? price : `Free pick or ${price}`}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
