import type { Metadata } from "next";
import Link from "next/link";
import { findAlumni, topInstitutions, MIN_YEAR } from "@/lib/alumni";
import { Badge, Card, EmptyState } from "@/components/ui";
import { SidebarBanners } from "@/components/Banners";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Find your batchmates — school & college alumni | Godesi",
  description:
    "Search Godesi members by school, college or university and the year they passed, and reconnect with your batch.",
  alternates: { canonical: "/alumni" },
};

export default async function AlumniPage({
  searchParams,
}: {
  searchParams: { institution?: string; year?: string };
}) {
  const institution = (searchParams.institution ?? "").trim();
  const yearInput = (searchParams.year ?? "").trim();
  const year = Number.parseInt(yearInput, 10);
  const validYear = Number.isNaN(year) ? undefined : year;
  const searched = Boolean(institution || validYear);

  const [matches, popular] = await Promise.all([
    searched
      ? findAlumni({ institution, year: validYear })
      : findAlumni({ take: 24 }),
    topInstitutions(),
  ]);

  return (
    <div className="flex justify-center gap-6">
      <div className="min-w-0 max-w-4xl flex-1 space-y-5">
        <section className="rounded-3xl bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 p-6 text-white">
          <h1 className="text-2xl font-black sm:text-3xl">
            🎓 Find your batchmates
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-white/90">
            Add your school, college and passing year to your profile and your
            batch can find you here — and you can find them.
          </p>
          <form
            action="/alumni"
            className="mt-4 flex flex-col gap-2 sm:flex-row"
          >
            <input
              name="institution"
              defaultValue={institution}
              placeholder="School, college or university"
              className="min-w-0 flex-1 rounded-xl px-4 py-2.5 text-sm text-slate-900"
            />
            <input
              name="year"
              type="number"
              min={MIN_YEAR}
              max={new Date().getFullYear() + 8}
              defaultValue={yearInput}
              placeholder="Year passed"
              className="w-full rounded-xl px-4 py-2.5 text-sm text-slate-900 sm:w-36"
            />
            <button
              type="submit"
              className="rounded-xl bg-white px-5 py-2.5 text-sm font-bold text-indigo-700 hover:bg-indigo-50"
            >
              Search
            </button>
          </form>
          <div className="mt-3 flex flex-wrap gap-2 text-sm">
            <Link
              href="/dashboard/me"
              className="rounded-xl border border-white/70 px-4 py-2 font-semibold hover:bg-white/10"
            >
              ➕ Add my school &amp; college
            </Link>
            <Link
              href="/connect"
              className="rounded-xl border border-white/70 px-4 py-2 font-semibold hover:bg-white/10"
            >
              🤝 Friends near me
            </Link>
          </div>
        </section>

        {popular.length ? (
          <Card>
            <h2 className="text-sm font-bold text-slate-900">
              Biggest alumni groups on Godesi
            </h2>
            <div className="mt-2 flex flex-wrap gap-2">
              {popular.map((row) => (
                <Link
                  key={row.institution}
                  href={`/alumni?institution=${encodeURIComponent(row.institution)}`}
                  className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 hover:bg-indigo-100"
                >
                  {row.institution} · {row.members}
                </Link>
              ))}
            </div>
          </Card>
        ) : null}

        <h2 className="text-lg font-bold text-slate-900">
          {searched
            ? `${matches.length} member${matches.length === 1 ? "" : "s"} found`
            : "Recently added"}
        </h2>

        {matches.length ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {matches.map((row) => (
              <Card key={row.id} className="flex gap-3">
                {row.user.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={row.user.avatarUrl}
                    alt={row.user.name}
                    className="h-12 w-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-fuchsia-600 text-lg font-black text-white">
                    {row.user.name.slice(0, 1).toUpperCase()}
                  </div>
                )}
                <div className="min-w-0">
                  <Link
                    href={`/${row.user.username}`}
                    className="font-bold text-slate-900 hover:underline"
                  >
                    {row.user.name}
                  </Link>
                  {row.user.headline ? (
                    <p className="truncate text-xs text-slate-600">
                      {row.user.headline}
                    </p>
                  ) : null}
                  <p className="mt-1 text-sm text-slate-700">
                    🎓 {row.institution}
                    {row.degree ? ` · ${row.degree}` : ""}
                  </p>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {row.endYear ? (
                      <Badge tone="indigo">Batch of {row.endYear}</Badge>
                    ) : row.current ? (
                      <Badge tone="green">Studying now</Badge>
                    ) : null}
                    {row.fieldOfStudy ? <Badge>{row.fieldOfStudy}</Badge> : null}
                    {row.user.location ? (
                      <Badge>📍 {row.user.location}</Badge>
                    ) : null}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <EmptyState
            title="No one from that batch yet"
            body="Be the first — add your school, college and passing year to your profile and your batchmates will find you here."
            action={
              <Link
                href="/dashboard/me"
                className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
              >
                Add my education
              </Link>
            }
          />
        )}

        <p className="rounded-2xl bg-slate-50 p-3 text-xs text-slate-600">
          Only what members choose to publish appears here — institution,
          course, city and passing year. Remove it any time from your profile.
        </p>
      </div>

      <SidebarBanners />
    </div>
  );
}
