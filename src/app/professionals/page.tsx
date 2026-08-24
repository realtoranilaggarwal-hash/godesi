import type { Metadata } from "next";
import Link from "next/link";
import { professionalPage } from "@/lib/professionalsQueries";
import { ProfessionalCard } from "@/components/ProfessionalCard";
import { Card, LinkButton, inputClass } from "@/components/ui";

export const dynamic = "force-dynamic";

const PER_PAGE = 36;

export const metadata: Metadata = {
  title: "GoDesi Professionals — desi founders, agents, doctors and engineers",
  description:
    "The free GoDesi Professionals directory: every member who has completed their profile, searchable by trade and city. Recognition beyond it is GoDesi Elite.",
  alternates: { canonical: "/professionals" },
};

export default async function ProfessionalsPage({
  searchParams,
}: {
  searchParams: { q?: string; city?: string; open?: string; page?: string };
}) {
  const asked = Number(searchParams.page ?? "1");
  const page = Number.isFinite(asked) && asked > 1 ? Math.floor(asked) : 1;
  const { people, total, pages } = await professionalPage(
    searchParams,
    page,
    PER_PAGE,
  );
  const query = new URLSearchParams({
    ...(searchParams.q ? { q: searchParams.q } : {}),
    ...(searchParams.city ? { city: searchParams.city } : {}),
    ...(searchParams.open ? { open: searchParams.open } : {}),
  });
  const pageHref = (target: number) =>
    `/professionals?${new URLSearchParams({ ...Object.fromEntries(query), page: String(target) })}`;

  return (
    <div className="space-y-6">
      <Card className="border-indigo-200 bg-gradient-to-br from-indigo-50 via-white to-white">
        <h1 className="text-2xl font-black sm:text-3xl">
          👔 GoDesi Professionals
        </h1>
        <p className="mt-2 max-w-3xl text-sm text-slate-700">
          Every member who completes their profile is listed here
          automatically — free, no application, no waiting for approval. Add a
          photo, a line about what you do and your skills, and you appear.{" "}
          <b>{total.toLocaleString()}</b> professionals so far.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <LinkButton href="/dashboard/me">Complete my profile</LinkButton>
          <LinkButton
            href="/desi-elite"
            className="bg-white text-slate-900 ring-1 ring-slate-300"
          >
            🏆 GoDesi Elite (recognition)
          </LinkButton>
        </div>
      </Card>

      <form className="grid gap-2 sm:grid-cols-4" action="/professionals">
        <input
          name="q"
          defaultValue={searchParams.q ?? ""}
          placeholder="Search name, work or skill"
          className={inputClass}
        />
        <input
          name="city"
          defaultValue={searchParams.city ?? ""}
          placeholder="City"
          className={inputClass}
        />
        <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
          <input
            type="checkbox"
            name="open"
            value="1"
            defaultChecked={searchParams.open === "1"}
            className="h-4 w-4"
          />
          Open to work only
        </label>
        <button
          type="submit"
          className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-bold text-white"
        >
          Filter
        </button>
      </form>

      {people.length ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {people.map((person) => (
            <ProfessionalCard key={person.id} person={person} />
          ))}
        </div>
      ) : (
        <Card>
          <p className="text-sm text-slate-600">
            No profile matches that yet.{" "}
            <Link href="/dashboard/me" className="font-semibold text-indigo-600">
              Complete yours
            </Link>{" "}
            and it shows up here within minutes.
          </p>
        </Card>
      )}

      {pages > 1 ? (
        <nav className="flex items-center justify-between gap-3 text-sm font-semibold">
          {page > 1 ? (
            <Link
              href={pageHref(page - 1)}
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
              href={pageHref(page + 1)}
              className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-slate-800"
            >
              Older →
            </Link>
          ) : (
            <span />
          )}
        </nav>
      ) : null}

      <Card className="border-amber-200 bg-amber-50/50">
        <h2 className="text-lg font-black">
          Want more than a listing? Get recognised. 🏆
        </h2>
        <p className="mt-1 max-w-3xl text-sm text-slate-700">
          GoDesi Elite is the reviewed one: our team interviews you and
          publishes a full profile with video, a permanent Elite badge and
          placement above every free listing. $500 for a year — $250 for five
          years while the launch offer runs.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <LinkButton href="/desi-elite/apply">Apply for Elite</LinkButton>
          <LinkButton
            href="/desi-elite"
            className="bg-white text-slate-900 ring-1 ring-slate-300"
          >
            See Elite members
          </LinkButton>
        </div>
      </Card>
    </div>
  );
}
