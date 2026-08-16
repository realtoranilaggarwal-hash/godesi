import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getCurrentUser, isStaff } from "@/lib/auth";
import { can } from "@/lib/permissions";
import { getCategoryTree } from "@/lib/directory";
import {
  readBusinessLinkAction,
  removeLinkedBusinessAction,
  saveLinkedBusinessAction,
} from "@/app/actions/businessLink";
import { Card, inputClass } from "@/components/ui";

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block text-sm">
      <span className="font-semibold text-slate-700">{label}</span>
      {hint ? <span className="ml-1 text-slate-400">— {hint}</span> : null}
      <span className="mt-1 block">{children}</span>
    </label>
  );
}

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Listing wire" };

export default async function Page({
  searchParams,
}: {
  searchParams: {
    error?: string;
    added?: string;
    link?: string;
    host?: string;
    name?: string;
    about?: string;
    phone?: string;
    website?: string;
    address?: string;
    city?: string;
    state?: string;
    category?: string;
    type?: string;
    missing?: string;
  };
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/admin/listings/wire");
  if (!isStaff(user) || !can(user, "listings")) redirect("/dashboard");

  const [categories, added] = await Promise.all([
    getCategoryTree(),
    db.business.findMany({
      where: { sourceUrl: { not: null }, ownerId: null, status: "APPROVED" },
      orderBy: { createdAt: "desc" },
      take: 60,
      select: {
        id: true,
        slug: true,
        name: true,
        category: true,
        city: true,
        state: true,
        phone: true,
        source: true,
        sourceUrl: true,
      },
    }),
  ]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-2xl font-bold">Listing wire</h1>
        <Link href="/admin/listings" className="text-sm font-semibold text-indigo-700">
          Listings desk →
        </Link>
      </div>

      {searchParams.added ? (
        <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-800">
          Listing added. It is live and unclaimed — invite the owner from{" "}
          <Link href="/admin/outreach" className="underline">
            owner outreach
          </Link>
          .
        </p>
      ) : null}

      {searchParams.error ? (
        <p className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-800">
          {searchParams.error.slice(0, 300)}
        </p>
      ) : null}

      <Card id="confirm">
        <h2 className="mb-1 text-lg font-bold">Add one business from a link</h2>
        <p className="mb-3 text-sm text-slate-500">
          Paste a priest, IT company, caterer or temple page — a Sulekha
          provider page, their own website, anything public. We read the facts
          it publishes (name, trade, town, address) and you confirm them. The
          card goes up unclaimed and free, credited to where we found it, so the
          owner can claim it and fill in the rest.
        </p>
        <form action={readBusinessLinkAction} className="flex flex-wrap gap-2">
          <input
            name="link"
            required
            type="url"
            placeholder="https://us.sulekha.com/…/priest-services/…"
            aria-label="Business page link"
            className={`${inputClass} min-w-0 flex-1`}
          />
          <button className="rounded-xl border border-indigo-300 px-4 py-2 text-sm font-bold text-indigo-700 hover:bg-indigo-50">
            Read the page
          </button>
        </form>

        {searchParams.link ? (
          <div className="mt-4 border-t border-slate-100 pt-4">
            <p className="mb-2 text-sm font-semibold text-slate-700">
              From {searchParams.host}
              {searchParams.missing
                ? ` — could not read the ${searchParams.missing}, so fill that in`
                : " — check it and save"}
            </p>
            {searchParams.about ? (
              <div className="mb-3 rounded-xl bg-amber-50 p-3 text-xs text-amber-900">
                <p className="font-semibold">
                  What {searchParams.host} says about them — do not copy it
                </p>
                <p className="mt-1 whitespace-pre-line">
                  {searchParams.about.slice(0, 600)}
                </p>
                <p className="mt-1">
                  Write your own two lines in the description box below. Their
                  wording and photos are theirs.
                </p>
              </div>
            ) : null}
            <form
              action={saveLinkedBusinessAction}
              className="grid gap-3 sm:grid-cols-2"
            >
              <input type="hidden" name="sourceUrl" value={searchParams.link} />
              <div className="sm:col-span-2">
                <Field label="Business or person's name">
                  <input
                    name="name"
                    required
                    defaultValue={searchParams.name ?? ""}
                    className={inputClass}
                  />
                </Field>
              </div>
              <Field label="Category">
                <select
                  name="categorySlug"
                  required
                  defaultValue={searchParams.category ?? ""}
                  className={inputClass}
                >
                  <option value="">Pick a category</option>
                  {categories.map((category) => (
                    <option key={category.slug} value={category.slug}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="City">
                <input
                  name="city"
                  required
                  defaultValue={searchParams.city ?? ""}
                  className={inputClass}
                />
              </Field>
              <Field label="State" hint="Two letters">
                <input
                  name="state"
                  defaultValue={searchParams.state ?? ""}
                  className={inputClass}
                />
              </Field>
              <Field label="Address" hint="Optional">
                <input
                  name="address"
                  defaultValue={searchParams.address ?? ""}
                  className={inputClass}
                />
              </Field>
              <Field label="Their own website" hint="Optional, not the page above">
                <input
                  name="websiteUrl"
                  defaultValue={searchParams.website ?? ""}
                  placeholder="https://"
                  className={inputClass}
                />
              </Field>
              <Field label="Type">
                <select
                  name="profileType"
                  defaultValue={searchParams.type ?? "BUSINESS"}
                  className={inputClass}
                >
                  <option value="BUSINESS">Business / company</option>
                  <option value="PROFESSIONAL">
                    Individual (priest, realtor, tutor…)
                  </option>
                </select>
              </Field>
              <Field label="Phone on the page" hint="Optional">
                <input
                  name="phone"
                  defaultValue={searchParams.phone ?? ""}
                  className={inputClass}
                />
              </Field>
              <div className="sm:col-span-2">
                <label className="flex items-start gap-2 rounded-xl bg-slate-50 p-3 text-xs text-slate-600">
                  <input type="checkbox" name="publishPhone" className="mt-0.5" />
                  <span>
                    <b>Show this number on the card.</b> Only tick it if it is
                    the business&apos;s own published number and you are happy
                    for people to call it. Left unticked, we keep it for the
                    claim invite and the card shows no number until the owner
                    adds one.
                  </span>
                </label>
              </div>
              <div className="sm:col-span-2">
                <Field
                  label="Description"
                  hint="Your own words — two lines is plenty"
                >
                  <textarea
                    name="description"
                    rows={3}
                    placeholder="Hindi-speaking priest for griha pravesh, satyanarayan pooja and weddings across north Jersey."
                    className={inputClass}
                  />
                </Field>
              </div>
              <button className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-bold text-white sm:col-span-2">
                Add this listing
              </button>
            </form>
          </div>
        ) : null}
      </Card>

      <Card>
        <h2 className="mb-1 text-lg font-bold">
          Added from links ({added.length})
        </h2>
        <p className="mb-3 text-xs text-slate-500">
          Unclaimed cards we added by hand. Remove takes one off the site for
          good.
        </p>
        <ul className="divide-y divide-slate-100 text-sm">
          {added.map((business) => (
            <li
              key={business.id}
              className="flex flex-wrap items-center justify-between gap-2 py-2"
            >
              <div className="min-w-0">
                <Link
                  href={`/b/${business.slug}`}
                  className="font-semibold text-indigo-700"
                >
                  {business.name}
                </Link>
                <p className="text-xs text-slate-500">
                  {business.category} · {business.city}
                  {business.state ? `, ${business.state}` : ""} ·{" "}
                  {business.phone ? "number shown" : "no number yet"} · from{" "}
                  {business.source}
                </p>
              </div>
              <form action={removeLinkedBusinessAction}>
                <input type="hidden" name="id" value={business.id} />
                <button className="rounded-lg border border-rose-200 px-2 py-1 text-xs font-semibold text-rose-700">
                  remove
                </button>
              </form>
            </li>
          ))}
          {added.length === 0 ? (
            <li className="py-2 text-slate-500">
              Nothing added from a link yet.
            </li>
          ) : null}
        </ul>
      </Card>
    </div>
  );
}
