import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getCurrentUser, isStaff } from "@/lib/auth";
import { can } from "@/lib/permissions";
import { getCategoryTree } from "@/lib/directory";
import { specialtySet } from "@/lib/specialties";
import {
  readBusinessLinkAction,
  removeLinkedBusinessAction,
  saveLinkedBusinessAction,
} from "@/app/actions/businessLink";
import { Card, inputClass } from "@/components/ui";
import { deskFallback } from "@/lib/adminSections";

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
    sub?: string;
    services?: string;
    languages?: string;
    areas?: string;
    years?: string;
    hours?: string;
    suggestion?: string;
    type?: string;
    missing?: string;
  };
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/admin/listings/wire");
  if (!isStaff(user)) redirect("/dashboard");
  if (!can(user, "listings"))
    redirect(deskFallback(user, "Listing wire"));

  const picked = searchParams.sub ?? "";
  const ticked = new Set((searchParams.services ?? "").split("|").filter(Boolean));
  const services = specialtySet(picked);

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
          Paste a priest, IT company, caterer or temple page — their own
          website, a directory profile, anything public. We read the facts
          it publishes (name, trade, town, address) and you confirm them. The
          card goes up unclaimed and free, credited to where we found it, so the
          owner can claim it and fill in the rest.
        </p>
        <form action={readBusinessLinkAction} className="flex flex-wrap gap-2">
          <input
            name="link"
            required
            type="url"
            placeholder="https://example.com/…/priest-services/…"
            aria-label="Business page link"
            className={`${inputClass} min-w-0 flex-1`}
          />
          <button className="rounded-xl border border-indigo-300 px-4 py-2 text-sm font-bold text-indigo-700 hover:bg-indigo-50">
            Read the page
          </button>
        </form>
        <p className="mt-2 text-xs text-slate-500">
          A <b>Google Maps</b> link works too. Google shows a robot nothing but
          the name, so we take the street, town, phone, website and hours for
          that exact spot from OpenStreetMap instead — free, no key. Whatever it
          cannot find, you type from your own screen.
        </p>

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
            {/* Choosing the trade reloads the screen so its own service
                tick-boxes appear; it is a plain GET so nothing is saved yet. */}
            <form method="get" className="mb-3 flex flex-wrap items-end gap-2">
              {Object.entries(searchParams).map(([key, value]) =>
                value && key !== "sub" && key !== "error" && key !== "added" ? (
                  <input key={key} type="hidden" name={key} value={value} />
                ) : null,
              )}
              <div className="min-w-0 flex-1">
                <Field label="Trade" hint="Which shelf the card sits on">
                  <select name="sub" defaultValue={picked} className={inputClass}>
                    <option value="">No trade — top category only</option>
                    {categories.map((category) => (
                      <optgroup key={category.slug} label={category.name}>
                        {category.children.map((child) => (
                          <option key={child.slug} value={child.slug}>
                            {child.name}
                          </option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                </Field>
              </div>
              <button className="rounded-xl border border-indigo-300 px-3 py-2 text-sm font-bold text-indigo-700 hover:bg-indigo-50">
                Show its services
              </button>
            </form>

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
              <input type="hidden" name="subcategorySlug" value={picked} />
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
              <Field label="Years in business" hint="Optional">
                <input
                  name="experienceYears"
                  type="number"
                  min={0}
                  max={120}
                  defaultValue={searchParams.years ?? ""}
                  className={inputClass}
                />
              </Field>
              <Field label="Hours" hint="As the page states them">
                <input
                  name="hours"
                  defaultValue={searchParams.hours ?? ""}
                  placeholder="Mon–Sat 9am–7pm"
                  className={inputClass}
                />
              </Field>
              <div className="sm:col-span-2">
                <Field
                  label="Languages"
                  hint="Comma-separated — shown as tags people can filter by"
                >
                  <input
                    name="languages"
                    defaultValue={searchParams.languages ?? ""}
                    placeholder="English, Hindi, Gujarati"
                    className={inputClass}
                  />
                </Field>
              </div>

              {services ? (
                <div className="sm:col-span-2 rounded-xl border border-slate-200 p-3">
                  <p className="text-sm font-semibold text-slate-700">
                    {services.title}
                  </p>
                  <p className="mb-2 text-xs text-slate-500">
                    Pre-ticked from what the page says it does — untick anything
                    it does not. These become the card&apos;s tags and the
                    filters people search by.
                  </p>
                  <div className="grid gap-1 sm:grid-cols-2 lg:grid-cols-3">
                    {services.options.map((option) => (
                      <label
                        key={option}
                        className="flex items-start gap-2 text-xs text-slate-700"
                      >
                        <input
                          type="checkbox"
                          name="specialties"
                          value={option}
                          defaultChecked={ticked.has(option)}
                          className="mt-0.5"
                        />
                        <span>{option}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="sm:col-span-2 text-xs text-slate-500">
                  Pick a trade above and press <b>Show its services</b> to tick
                  what this business does.
                </p>
              )}

              {searchParams.areas ? (
                <div className="sm:col-span-2">
                  <Field
                    label="Areas served"
                    hint="Kept on the claim invite, not shown on the card"
                  >
                    <textarea
                      name="areas"
                      rows={2}
                      defaultValue={searchParams.areas}
                      className={inputClass}
                    />
                  </Field>
                </div>
              ) : null}

              <div className="sm:col-span-2">
                <Field
                  label="Description"
                  hint="Written from the facts above — edit it, it is ours not theirs"
                >
                  <textarea
                    name="description"
                    rows={3}
                    defaultValue={searchParams.suggestion ?? ""}
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
