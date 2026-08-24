import type { Metadata } from "next";
import Link from "next/link";
import { memberPage } from "@/lib/membersQueries";
import { MemberTile } from "@/components/MemberTile";
import { Card } from "@/components/ui";

export const dynamic = "force-dynamic";

const PER_PAGE = 48;

export const metadata: Metadata = {
  title: "People on GoDesi",
  description:
    "Members of the GoDesi community — business owners, professionals and neighbours, newest first.",
  alternates: { canonical: "/people" },
};

export default async function PeoplePage({
  searchParams,
}: {
  searchParams: { page?: string };
}) {
  const asked = Number(searchParams.page ?? "1");
  const page = Number.isFinite(asked) && asked > 1 ? Math.floor(asked) : 1;
  const { members, total, pages } = await memberPage(page, PER_PAGE);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-black">People on GoDesi 👥</h1>
        <p className="mt-1 text-sm text-slate-600">
          {total.toLocaleString()} members, newest first. Pick a handle and you
          get your own page, QR code and short link at godesi.com/your-name.{" "}
          <Link href="/signup" className="font-semibold text-indigo-600">
            Join them free
          </Link>
          . Finished profiles also appear in{" "}
          <Link href="/professionals" className="font-semibold text-indigo-600">
            GoDesi Professionals
          </Link>
          .
        </p>
      </header>

      {members.length ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
          {members.map((member) => (
            <MemberTile key={member.id} member={member} />
          ))}
        </div>
      ) : (
        <Card>
          <p className="text-sm text-slate-600">
            No members yet.{" "}
            <Link href="/signup" className="font-semibold text-indigo-600">
              Be the first.
            </Link>
          </p>
        </Card>
      )}

      {pages > 1 ? (
        <nav className="flex items-center justify-between gap-3 text-sm font-semibold">
          {page > 1 ? (
            <Link
              href={`/people?page=${page - 1}`}
              className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-slate-800"
            >
              ← Newer
            </Link>
          ) : (
            <span />
          )}
          <span className="text-slate-500">
            Page {page} of {pages}
          </span>
          {page < pages ? (
            <Link
              href={`/people?page=${page + 1}`}
              className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-slate-800"
            >
              Older →
            </Link>
          ) : (
            <span />
          )}
        </nav>
      ) : null}
    </div>
  );
}
