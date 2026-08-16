import type { Metadata } from "next";
import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { requireStaff } from "@/lib/auth";
import { Card, inputClass } from "@/components/ui";
import { whatsappLink, siteUrl } from "@/lib/format";
import { markOutreachAction } from "@/app/actions/outreach";

export const metadata: Metadata = { title: "Owner outreach | Godesi admin" };
export const dynamic = "force-dynamic";

const PAGE_SIZE = 60;

/** The invite we send a business owner, kept short enough for WhatsApp. */
function inviteMessage(name: string, city: string, slug: string) {
  return [
    `Namaste ${name} 🙏`,
    "",
    `We list desi businesses in ${city} on Godesi (godesi.com) and your business already has a free page:`,
    `${siteUrl()}/b/${slug}`,
    "",
    "Claim it free to add your photos, timings, WhatsApp button and offers, and to get enquiries from desi customers near you. The listing costs nothing.",
  ].join("\n");
}

export default async function AdminOutreachPage({
  searchParams,
}: {
  searchParams: {
    city?: string;
    state?: string;
    status?: string;
    page?: string;
  };
}) {
  await requireStaff();

  const status = searchParams.status === "contacted" ? "contacted" : "todo";
  const page = Math.max(1, Number(searchParams.page ?? "1") || 1);

  const where: Prisma.BusinessWhereInput = {
    ownerId: null,
    // Starter rows we added: openly-licensed map data or a pasted public page.
    source: { not: null },
    ...(searchParams.city ? { city: searchParams.city } : {}),
    ...(searchParams.state ? { state: searchParams.state } : {}),
    ...(status === "contacted"
      ? { NOT: { invitedAt: null } }
      : { invitedAt: null }),
    // Only rows with a way to reach the owner: something they publish about
    // themselves, or the page a desk read their card from.
    OR: [
      { phone: { not: null } },
      { publicEmail: { not: null } },
      { websiteUrl: { not: null } },
      { sourceUrl: { not: null } },
    ],
  };

  const [rows, total, contactedCount, cities] = await Promise.all([
    db.business.findMany({
      where,
      orderBy: [{ city: "asc" }, { name: "asc" }],
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      select: {
        id: true,
        slug: true,
        name: true,
        city: true,
        state: true,
        phone: true,
        publicEmail: true,
        websiteUrl: true,
        categorySlug: true,
        subcategorySlug: true,
        sourceUrl: true,
        invitedAt: true,
        inviteChannel: true,
        inviteNote: true,
      },
    }),
    db.business.count({ where }),
    db.business.count({
      where: {
        ownerId: null,
        source: { not: null },
        NOT: { invitedAt: null },
      },
    }),
    db.business.groupBy({
      by: ["city", "state"],
      where: { ownerId: null, source: { not: null } },
      _count: { _all: true },
      orderBy: { city: "asc" },
    }),
  ]);

  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="space-y-4">
      <Card>
        <h1 className="text-xl font-black">📣 Owner outreach</h1>
        <p className="mt-1 text-sm text-slate-600">
          Unclaimed starter listings whose owner publishes a phone, email or
          website. Send the claim invite on WhatsApp or email, then mark it here
          so nobody gets contacted twice. Contact details come from what the
          business publishes about itself — nothing is scraped from another
          directory.
        </p>
        <p className="mt-2 text-sm font-semibold">
          {total} to contact · {contactedCount} already invited
        </p>
        <div className="mt-2 flex flex-wrap gap-2 text-sm">
          <Link
            href="/admin/outreach"
            className={`rounded-full px-3 py-1 font-bold ${status === "todo" ? "bg-slate-900 text-white" : "border border-slate-300"}`}
          >
            To contact
          </Link>
          <Link
            href="/admin/outreach?status=contacted"
            className={`rounded-full px-3 py-1 font-bold ${status === "contacted" ? "bg-slate-900 text-white" : "border border-slate-300"}`}
          >
            Already invited
          </Link>
        </div>
        <div className="mt-2 flex flex-wrap gap-1 text-xs">
          {cities.map((row) => (
            <Link
              key={`${row.city}-${row.state ?? ""}`}
              href={`/admin/outreach?city=${encodeURIComponent(row.city)}${status === "contacted" ? "&status=contacted" : ""}`}
              className={`rounded-full border px-2 py-0.5 font-semibold ${
                searchParams.city === row.city
                  ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                  : "border-slate-200 text-slate-600"
              }`}
            >
              {row.city}
              {row.state ? `, ${row.state}` : ""} ({row._count._all})
            </Link>
          ))}
        </div>
      </Card>

      {rows.map((row) => {
        const message = inviteMessage(row.name, row.city, row.slug);
        return (
          <Card key={row.id} className="space-y-2">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="font-bold">
                  {row.name}{" "}
                  <span className="font-normal text-slate-500">
                    · {row.city}
                    {row.state ? `, ${row.state}` : ""}
                  </span>
                </p>
                <p className="text-xs text-slate-500">
                  {row.subcategorySlug ?? row.categorySlug ?? "uncategorised"} ·{" "}
                  <Link href={`/b/${row.slug}`} className="text-indigo-600">
                    view page →
                  </Link>
                </p>
                {row.sourceUrl ? (
                  <p className="text-xs text-slate-500">
                    read from{" "}
                    <a
                      href={row.sourceUrl}
                      target="_blank"
                      rel="noreferrer nofollow"
                      className="text-indigo-600"
                    >
                      their listing →
                    </a>
                  </p>
                ) : null}
                <p className="text-xs text-slate-600">
                  {row.phone ?? "no phone"} · {row.publicEmail ?? "no email"}
                  {row.websiteUrl ? (
                    <>
                      {" · "}
                      <a
                        href={row.websiteUrl}
                        target="_blank"
                        rel="noreferrer nofollow"
                        className="text-indigo-600"
                      >
                        website ↗
                      </a>
                    </>
                  ) : null}
                </p>
                {row.invitedAt ? (
                  <p className="text-xs font-semibold text-emerald-700">
                    Invited {row.invitedAt.toLocaleDateString("en-US")} via{" "}
                    {row.inviteChannel ?? "—"}
                    {row.inviteNote ? ` · ${row.inviteNote}` : ""}
                  </p>
                ) : null}
              </div>
              <div className="flex flex-wrap gap-2 text-xs font-bold">
                {row.phone ? (
                  <a
                    href={whatsappLink(row.phone, message)}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-lg bg-emerald-500 px-3 py-1.5 text-white"
                  >
                    WhatsApp invite
                  </a>
                ) : null}
                {row.publicEmail ? (
                  <a
                    href={`mailto:${row.publicEmail}?subject=${encodeURIComponent(
                      `Your free Godesi listing — ${row.name}`,
                    )}&body=${encodeURIComponent(message)}`}
                    className="rounded-lg bg-indigo-600 px-3 py-1.5 text-white"
                  >
                    Email invite
                  </a>
                ) : null}
                {row.phone ? (
                  <a
                    href={`tel:${row.phone}`}
                    className="rounded-lg border border-slate-300 px-3 py-1.5 text-slate-700"
                  >
                    Call
                  </a>
                ) : null}
              </div>
            </div>

            <form
              action={markOutreachAction}
              className="grid gap-2 sm:grid-cols-4"
            >
              <input type="hidden" name="id" value={row.id} />
              <select
                name="channel"
                defaultValue="whatsapp"
                className={inputClass}
              >
                <option value="whatsapp">WhatsApp sent</option>
                <option value="email">Email sent</option>
                <option value="phone">Called</option>
                <option value="declined">Not interested</option>
                <option value="reset">Clear (contact again)</option>
              </select>
              <input
                name="note"
                defaultValue={row.inviteNote ?? ""}
                placeholder="Reply / note"
                className={`${inputClass} sm:col-span-2`}
              />
              <button
                type="submit"
                className="rounded-xl bg-slate-900 px-3 py-2 text-sm font-bold text-white"
              >
                Save
              </button>
            </form>
          </Card>
        );
      })}

      {!rows.length ? (
        <Card>
          <p className="text-sm text-slate-600">
            Nothing here. Import more starter listings with{" "}
            <code className="rounded bg-slate-100 px-1">
              npm run db:businesses
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
              <Link
                href={`/admin/outreach?page=${page - 1}${searchParams.city ? `&city=${encodeURIComponent(searchParams.city)}` : ""}${status === "contacted" ? "&status=contacted" : ""}`}
                className="text-indigo-600"
              >
                ← Previous
              </Link>
            ) : null}
            {page < pages ? (
              <Link
                href={`/admin/outreach?page=${page + 1}${searchParams.city ? `&city=${encodeURIComponent(searchParams.city)}` : ""}${status === "contacted" ? "&status=contacted" : ""}`}
                className="text-indigo-600"
              >
                Next →
              </Link>
            ) : null}
          </div>
        </Card>
      ) : null}
    </div>
  );
}
