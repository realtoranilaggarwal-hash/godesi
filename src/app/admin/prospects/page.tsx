import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { getCurrentUser, isStaff } from "@/lib/auth";
import { Card, inputClass } from "@/components/ui";
import { CATEGORY_TREE } from "@/lib/categories";
import { siteUrl, whatsappLink } from "@/lib/format";
import { pitchFor } from "@/lib/prospectEmails";
import {
  publishProspectCardAction,
  releaseProspectAction,
  saveProspectCallAction,
  takeProspectsAction,
} from "@/app/actions/prospects";

export const metadata: Metadata = { title: "Call list | Godesi admin" };
export const dynamic = "force-dynamic";

const PAGE_SIZE = 40;

const STATUSES = [
  { key: "NEW", label: "Not called yet" },
  { key: "CALLED", label: "Called, no answer" },
  { key: "CALL_BACK", label: "Call back" },
  { key: "INTERESTED", label: "Interested" },
  { key: "LISTED", label: "Listed on Godesi 🎉" },
  { key: "NOT_INTERESTED", label: "Not interested" },
  { key: "WRONG_NUMBER", label: "Wrong number" },
] as const;


export default async function AdminProspectsPage({
  searchParams,
}: {
  searchParams: {
    status?: string;
    category?: string;
    city?: string;
    source?: string;
    q?: string;
    mine?: string;
    page?: string;
  };
}) {
  const staff = await getCurrentUser();
  if (!staff) redirect("/login?next=/admin/prospects");
  if (!isStaff(staff)) redirect("/dashboard");

  const status = STATUSES.find((entry) => entry.key === searchParams.status)?.key;
  const page = Math.max(1, Number(searchParams.page ?? "1") || 1);
  const query = (searchParams.q ?? "").trim();

  const where: Prisma.ProspectWhereInput = {
    ...(status ? { status } : {}),
    ...(searchParams.category ? { categorySlug: searchParams.category } : {}),
    ...(searchParams.city ? { city: searchParams.city } : {}),
    ...(searchParams.source ? { source: searchParams.source } : {}),
    ...(searchParams.mine === "1" ? { ownerId: staff.id } : {}),
    ...(query
      ? {
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { trade: { contains: query, mode: "insensitive" } },
            { city: { contains: query, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  const [rows, total, counts, beats, sources] = await Promise.all([
    db.prospect.findMany({
      where,
      // The ones we can ring first, then alphabetical so a list can be worked.
      orderBy: [{ phone: "desc" }, { name: "asc" }],
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: { owner: { select: { id: true, name: true } } },
    }),
    db.prospect.count({ where }),
    db.prospect.groupBy({ by: ["status"], _count: { _all: true } }),
    db.prospect.groupBy({
      by: ["categorySlug"],
      _count: { _all: true },
      orderBy: { _count: { categorySlug: "desc" } },
    }),
    db.prospect.groupBy({
      by: ["source"],
      _count: { _all: true },
      orderBy: { _count: { source: "desc" } },
    }),
  ]);

  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const countOf = (key: string) =>
    counts.find((row) => row.status === key)?._count._all ?? 0;
  const beatName = (slug: string | null) =>
    CATEGORY_TREE.find((entry) => entry.slug === slug)?.name ?? slug ?? "unsorted";

  /** Keeps the current filters when only one of them changes. */
  const link = (change: Record<string, string | undefined>) => {
    const next = new URLSearchParams();
    const merged = {
      status: searchParams.status,
      category: searchParams.category,
      city: searchParams.city,
      source: searchParams.source,
      q: query || undefined,
      mine: searchParams.mine,
      ...change,
    };
    for (const [key, value] of Object.entries(merged)) {
      if (value) next.set(key, value);
    }
    const search = next.toString();
    return search ? `/admin/prospects?${search}` : "/admin/prospects";
  };

  return (
    <div className="space-y-4">
      <Card className="space-y-3">
        <h1 className="text-xl font-black">☎️ Call list</h1>
        <p className="text-sm text-slate-600">
          Businesses that already pay to advertise elsewhere — the warmest leads
          we have. A row with a number can go up as a starter card: it shows the
          name, trade, town and street only, and{" "}
          <strong>the phone and email stay hidden</strong> until the owner claims
          the page and takes a plan — which is exactly what you ring them to do.
          Nothing written or photographed by anyone else is copied, and the page
          stays out of Google until the owner fills it in. Read the details back
          on the call and correct them if the owner says otherwise.{" "}
          <Link
            href="/admin/handbook/call-list"
            className="font-semibold text-indigo-600"
          >
            How to work this list →
          </Link>{" "}
          <Link
            href="/admin/handbook/emails"
            className="font-semibold text-indigo-600"
          >
            Emails and scripts for every category →
          </Link>
        </p>
        <p className="text-sm font-semibold">
          {total} shown · {countOf("NEW")} not called · {countOf("CALL_BACK")} to
          call back · {countOf("INTERESTED")} interested · {countOf("LISTED")}{" "}
          listed
        </p>

        <div className="flex flex-wrap gap-2 text-sm">
          <Link
            href={link({ status: undefined })}
            className={`rounded-full px-3 py-1 font-bold ${
              status ? "border border-slate-300" : "bg-slate-900 text-white"
            }`}
          >
            All
          </Link>
          {STATUSES.map((entry) => (
            <Link
              key={entry.key}
              href={link({ status: entry.key })}
              className={`rounded-full px-3 py-1 font-bold ${
                status === entry.key
                  ? "bg-slate-900 text-white"
                  : "border border-slate-300"
              }`}
            >
              {entry.label} ({countOf(entry.key)})
            </Link>
          ))}
          <Link
            href={link({ mine: searchParams.mine === "1" ? undefined : "1" })}
            className={`rounded-full px-3 py-1 font-bold ${
              searchParams.mine === "1"
                ? "bg-indigo-600 text-white"
                : "border border-indigo-300 text-indigo-700"
            }`}
          >
            Mine
          </Link>
        </div>

        {sources.length > 1 ? (
          <div className="flex flex-wrap gap-1 text-xs">
            <span className="py-0.5 font-semibold text-slate-500">Found on</span>
            {sources.map((row) => (
              <Link
                key={row.source}
                href={link({
                  source: searchParams.source === row.source ? undefined : row.source,
                })}
                className={`rounded-full border px-2 py-0.5 font-semibold ${
                  searchParams.source === row.source
                    ? "border-slate-500 bg-slate-100"
                    : "border-slate-200 text-slate-600"
                }`}
              >
                {row.source} ({row._count._all})
              </Link>
            ))}
          </div>
        ) : null}

        <div className="flex flex-wrap gap-1 text-xs">
          {beats.map((row) => (
            <Link
              key={row.categorySlug ?? "none"}
              href={link({ category: row.categorySlug ?? undefined })}
              className={`rounded-full border px-2 py-0.5 font-semibold ${
                searchParams.category === row.categorySlug
                  ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                  : "border-slate-200 text-slate-600"
              }`}
            >
              {beatName(row.categorySlug)} ({row._count._all})
            </Link>
          ))}
        </div>

        <div className="grid gap-2 sm:grid-cols-2">
          <form action="/admin/prospects" className="flex gap-2">
            {status ? <input type="hidden" name="status" value={status} /> : null}
            {searchParams.category ? (
              <input type="hidden" name="category" value={searchParams.category} />
            ) : null}
            <input
              name="q"
              defaultValue={query}
              placeholder="Search name, trade or town"
              className={inputClass}
            />
            <button
              type="submit"
              className="rounded-xl bg-slate-900 px-3 py-2 text-sm font-bold text-white"
            >
              Find
            </button>
          </form>

          <form action={takeProspectsAction} className="flex gap-2">
            <input
              type="hidden"
              name="categorySlug"
              value={searchParams.category ?? ""}
            />
            <input
              name="howMany"
              type="number"
              min={1}
              max={50}
              defaultValue={20}
              className={inputClass}
            />
            <button
              type="submit"
              className="whitespace-nowrap rounded-xl bg-emerald-600 px-3 py-2 text-sm font-bold text-white"
            >
              Give me this many to call
            </button>
          </form>
        </div>

        <p className="text-xs text-slate-500">
          <a href={`/admin/prospects/export${link({}).replace("/admin/prospects", "")}`} className="font-semibold text-indigo-600">
            Download this list as a spreadsheet →
          </a>{" "}
          Build or refresh it with{" "}
          <code className="rounded bg-slate-100 px-1">
            npm run db:prospects -- localfiles
          </code>{" "}
          (or <code className="rounded bg-slate-100 px-1">deshvidesh</code>,{" "}
          <code className="rounded bg-slate-100 px-1">jabwewed</code>, or{" "}
          <code className="rounded bg-slate-100 px-1">h1b nj</code> for the US IT
          firms).
        </p>
      </Card>

      {rows.map((row) => {
        const pitch = pitchFor(row.categorySlug);
        const context = {
          business: row.name,
          city: row.city,
          cardUrl: row.listedSlug
            ? `${siteUrl()}/b/${row.listedSlug}?claim=1`
            : null,
          from: staff.name ?? "the Godesi team",
        };

        return (
        <Card key={row.id} className="space-y-2">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <p className="font-bold">
                {row.name}{" "}
                <span className="font-normal text-slate-500">
                  · {row.city ?? "town unknown"}
                  {row.state ? `, ${row.state}` : ""}
                </span>
              </p>
              <p className="text-xs text-slate-500">
                {row.trade} · {beatName(row.categorySlug)}
                {row.owner ? ` · ${row.owner.name}'s` : " · unassigned"}
              </p>
              <p className="text-xs text-slate-600">
                {row.phone ?? "no phone"} · {row.email ?? "no email"}
                {row.address ? ` · ${row.address}` : ""}
              </p>
              <p className="text-xs text-slate-500">
                {row.websiteUrl ? (
                  <a
                    href={row.websiteUrl}
                    target="_blank"
                    rel="noreferrer nofollow"
                    className="text-indigo-600"
                  >
                    their website ↗
                  </a>
                ) : (
                  "no website"
                )}
                {" · found on "}
                <a
                  href={row.sourceUrl}
                  target="_blank"
                  rel="noreferrer nofollow"
                  className="text-indigo-600"
                >
                  {row.source} ↗
                </a>
              </p>
              {row.draftAbout || row.draftLogoUrl ? (
                <details className="mt-1 text-xs text-slate-600">
                  <summary className="cursor-pointer font-semibold text-slate-700">
                    Draft from their own website — read it back, don&apos;t
                    publish it
                  </summary>
                  {row.draftAbout ? (
                    <p className="mt-1 italic">“{row.draftAbout}”</p>
                  ) : null}
                  {row.draftLogoUrl ? (
                    <a
                      href={row.draftLogoUrl}
                      target="_blank"
                      rel="noreferrer nofollow"
                      className="text-indigo-600"
                    >
                      their logo ↗
                    </a>
                  ) : null}
                  <p className="mt-1 text-slate-500">
                    These are the owner&apos;s own words and own logo from their
                    own site. Offer them on the call — they go on a card only if
                    the owner says yes, and they upload the picture themselves.
                  </p>
                </details>
              ) : null}
              {row.calledAt ? (
                <p className="text-xs font-semibold text-emerald-700">
                  Last call {row.calledAt.toLocaleDateString("en-US")}
                  {row.note ? ` · ${row.note}` : ""}
                </p>
              ) : null}
              {row.listedSlug ? (
                <p className="text-xs font-semibold text-emerald-700">
                  Card live:{" "}
                  <Link href={`/b/${row.listedSlug}`} className="text-indigo-600">
                    /b/{row.listedSlug}
                  </Link>{" "}
                  ·{" "}
                  <Link
                    href={`/admin/business/${row.listedSlug}`}
                    className="text-indigo-600"
                  >
                    edit or feature it →
                  </Link>
                </p>
              ) : null}
              <details className="mt-1 text-xs text-slate-600">
                <summary className="cursor-pointer font-semibold text-slate-700">
                  {pitch.icon} What to say to a {pitch.label.toLowerCase()} row
                </summary>
                <p className="mt-1 font-semibold text-slate-700">{pitch.hook}</p>
                <p className="mt-1 whitespace-pre-line rounded-xl bg-slate-50 p-2">
                  {pitch.call(context)}
                </p>
                <p className="mt-1 font-semibold text-slate-700">
                  Email — subject: {pitch.subject(context)}
                </p>
                <p className="mt-1 whitespace-pre-line rounded-xl bg-slate-50 p-2">
                  {pitch.email(context)}
                </p>
                {pitch.objections.map((objection) => (
                  <p key={objection.question} className="mt-1">
                    <strong>{objection.question}</strong> {objection.answer}
                  </p>
                ))}
              </details>
            </div>

            <div className="flex flex-wrap gap-2 text-xs font-bold">
              {row.phone ? (
                <>
                  <a
                    href={`tel:${row.phone}`}
                    className="rounded-lg bg-slate-900 px-3 py-1.5 text-white"
                  >
                    Call
                  </a>
                  <a
                    href={whatsappLink(row.phone, pitch.call(context))}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-lg bg-emerald-500 px-3 py-1.5 text-white"
                  >
                    WhatsApp
                  </a>
                </>
              ) : null}
              {row.phone && !row.listedSlug ? (
                <form action={publishProspectCardAction}>
                  <input type="hidden" name="id" value={row.id} />
                  <button
                    type="submit"
                    className="rounded-lg bg-amber-500 px-3 py-1.5 text-white"
                  >
                    Put a card up
                  </button>
                </form>
              ) : null}
              {row.email ? (
                <a
                  href={`mailto:${row.email}?subject=${encodeURIComponent(
                    pitch.subject(context),
                  )}&body=${encodeURIComponent(pitch.email(context))}`}
                  className="rounded-lg bg-indigo-600 px-3 py-1.5 text-white"
                >
                  Email
                </a>
              ) : null}
            </div>
          </div>

          <form
            action={saveProspectCallAction}
            className="grid gap-2 sm:grid-cols-5"
          >
            <input type="hidden" name="id" value={row.id} />
            <select name="status" defaultValue={row.status} className={inputClass}>
              {STATUSES.map((entry) => (
                <option key={entry.key} value={entry.key}>
                  {entry.label}
                </option>
              ))}
            </select>
            <input
              name="note"
              defaultValue={row.note ?? ""}
              placeholder="What they said"
              className={`${inputClass} sm:col-span-2`}
            />
            <input
              name="listedSlug"
              defaultValue={row.listedSlug ?? ""}
              placeholder="Their card /b/…"
              className={inputClass}
            />
            <button
              type="submit"
              className="rounded-xl bg-slate-900 px-3 py-2 text-sm font-bold text-white"
            >
              Save call
            </button>
          </form>

          {row.owner && (staff.role === "ADMIN" || row.owner.id === staff.id) ? (
            <form action={releaseProspectAction}>
              <input type="hidden" name="id" value={row.id} />
              <button
                type="submit"
                className="text-xs font-semibold text-slate-500 underline"
              >
                Put back in the pool
              </button>
            </form>
          ) : null}
        </Card>
        );
      })}

      {!rows.length ? (
        <Card>
          <p className="text-sm text-slate-600">
            Nothing here yet. Build the list with{" "}
            <code className="rounded bg-slate-100 px-1">
              npm run db:prospects -- localfiles
            </code>
            .
          </p>
        </Card>
      ) : null}

      {pages > 1 ? (
        <Card className="flex items-center justify-between text-sm font-semibold">
          <span>
            Page {page} of {pages}
          </span>
          <div className="flex gap-3">
            {page > 1 ? (
              <Link href={link({ page: String(page - 1) })} className="text-indigo-600">
                ← Previous
              </Link>
            ) : null}
            {page < pages ? (
              <Link href={link({ page: String(page + 1) })} className="text-indigo-600">
                Next →
              </Link>
            ) : null}
          </div>
        </Card>
      ) : null}
    </div>
  );
}
