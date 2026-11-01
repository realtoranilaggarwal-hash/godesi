import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { getCurrentUser, isStaff } from "@/lib/auth";
import { Card, inputClass } from "@/components/ui";
import { CopyTextButton } from "@/components/CopyTextButton";
import { whatsappLink, siteUrl } from "@/lib/format";
import { markOutreachAction } from "@/app/actions/outreach";
import { WEDDING_SLUG } from "@/lib/wedding";
import {
  WEDDING_LAUNCH_LIMIT,
  WEDDING_LAUNCH_MONTHS,
} from "@/lib/weddingLaunch";

export const metadata: Metadata = { title: "Owner outreach | Godesi admin" };
export const dynamic = "force-dynamic";

const PAGE_SIZE = 60;

/** The invite we send a business owner, kept short enough for WhatsApp. */
function inviteMessage(name: string, city: string, slug: string) {
  return [
    `Namaste ${name} 🙏`,
    "",
    `We list desi businesses in ${city} on Godesi (godesi.com) and your business already has a free page:`,
    `${siteUrl()}/business/${slug}`,
    "",
    "Claim it free to add your photos, timings, WhatsApp button and offers, and to get enquiries from desi customers near you. The listing costs nothing.",
  ].join("\n");
}

/** Wedding vendors hear about wedding requests and the launch offer instead. */
function weddingInviteMessage(name: string, city: string, slug: string) {
  return [
    `Namaste ${name} 🙏`,
    "",
    `Desi families in ${city} plan their weddings on GoDesi (godesi.com), and your business already has a free page:`,
    `${siteUrl()}/business/${slug}`,
    "",
    `Claim it free to add your photos and packages and get wedding requests on WhatsApp. The first ${WEDDING_LAUNCH_LIMIT} wedding vendors get Premium free for ${WEDDING_LAUNCH_MONTHS} months.`,
  ].join("\n");
}

/** Short enough for an Instagram DM. */
function instagramMessage(name: string, slug: string) {
  return `Hi ${name}! Love your work 💐 Your business is already listed on GoDesi.com, where desi families find wedding vendors. Claim it free to add your photos and get wedding requests: ${siteUrl()}/business/${slug} (first ${WEDDING_LAUNCH_LIMIT} wedding vendors get ${WEDDING_LAUNCH_MONTHS} months of Premium free)`;
}

/** Asking a banquet hall or temple office for the vendors they recommend. */
const VENUE_ASK = [
  "Namaste 🙏 I run GoDesi.com, the free directory desi families use to plan weddings and events.",
  "",
  "Could you share your preferred vendor list (decorators, caterers, DJs, photographers, mehndi, pandits)? We list them free so families booking your hall can find them, and we can feature your venue on our wedding page too.",
  "",
  `Vendors can also sign up themselves here: ${siteUrl()}/wedding/vendors`,
].join("\n");

export default async function AdminOutreachPage({
  searchParams,
}: {
  searchParams: {
    city?: string;
    state?: string;
    status?: string;
    page?: string;
    trade?: string;
  };
}) {
  const staff = await getCurrentUser();
  if (!staff) redirect("/login?next=/admin/outreach");
  if (!isStaff(staff)) redirect("/dashboard");

  const status = searchParams.status === "contacted" ? "contacted" : "todo";
  const page = Math.max(1, Number(searchParams.page ?? "1") || 1);
  const wedding = searchParams.trade === "wedding";
  const tradeQs = wedding ? "&trade=wedding" : "";

  const where: Prisma.BusinessWhereInput = {
    ownerId: null,
    // Starter rows we added: openly-licensed map data or a pasted public page.
    source: { not: null },
    ...(searchParams.city ? { city: searchParams.city } : {}),
    ...(searchParams.state ? { state: searchParams.state } : {}),
    ...(wedding ? { categorySlug: WEDDING_SLUG } : {}),
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
          website. Send the claim invite by text, WhatsApp or email — tap the
          phone number to open your messaging app with the invite pre-filled,
          or copy the text to paste anywhere — then mark it here so nobody
          gets contacted twice. Contact details come from what the business
          publishes about itself — nothing is scraped from another directory.
        </p>
        <p className="mt-2 text-sm font-semibold">
          {total} to contact · {contactedCount} already invited
        </p>
        <div className="mt-2 flex flex-wrap gap-2 text-sm">
          <Link
            href={`/admin/outreach${wedding ? "?trade=wedding" : ""}`}
            className={`rounded-full px-3 py-1 font-bold ${status === "todo" ? "bg-slate-900 text-white" : "border border-slate-300"}`}
          >
            To contact
          </Link>
          <Link
            href={`/admin/outreach?status=contacted${tradeQs}`}
            className={`rounded-full px-3 py-1 font-bold ${status === "contacted" ? "bg-slate-900 text-white" : "border border-slate-300"}`}
          >
            Already invited
          </Link>
          <Link
            href={wedding ? "/admin/outreach" : "/admin/outreach?trade=wedding"}
            className={`rounded-full px-3 py-1 font-bold ${wedding ? "bg-rose-600 text-white" : "border border-rose-300 text-rose-700"}`}
          >
            💍 Wedding vendors only
          </Link>
        </div>
        <div className="mt-2 flex flex-wrap gap-1 text-xs">
          {cities.map((row) => (
            <Link
              key={`${row.city}-${row.state ?? ""}`}
              href={`/admin/outreach?city=${encodeURIComponent(row.city)}${status === "contacted" ? "&status=contacted" : ""}${tradeQs}`}
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

      {wedding ? (
        <Card className="space-y-2 border-rose-200 bg-rose-50">
          <h2 className="font-black">💍 Wedding outreach kit</h2>
          <p className="text-sm text-slate-700">
            Wedding vendors answer WhatsApp and Instagram, not email. Each row
            below has a wedding invite and an Instagram DM ready to send.
          </p>
          <div className="flex flex-wrap gap-2 text-xs font-bold">
            <a
              href="/wedding/vendors/flyer"
              target="_blank"
              rel="noreferrer"
              className="rounded-lg bg-rose-600 px-3 py-1.5 text-white"
            >
              Expo QR flyer (print)
            </a>
            <Link
              href="/wedding/vendors"
              className="rounded-lg border border-rose-300 px-3 py-1.5 text-rose-700"
            >
              Vendor sign-up page
            </Link>
            <CopyTextButton
              text={VENUE_ASK}
              className="rounded-lg border border-rose-300 px-3 py-1.5 text-rose-700"
            >
              Copy banquet hall / temple ask
            </CopyTextButton>
            <Link
              href={`/admin/prospects?category=${WEDDING_SLUG}`}
              className="rounded-lg border border-rose-300 px-3 py-1.5 text-rose-700"
            >
              Wedding call list
            </Link>
          </div>
        </Card>
      ) : null}

      {rows.map((row) => {
        const message = (
          row.categorySlug === WEDDING_SLUG ? weddingInviteMessage : inviteMessage
        )(row.name, row.city, row.slug);
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
                  <Link href={`/business/${row.slug}`} className="text-indigo-600">
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
                  {row.phone ? (
                    <a
                      href={`sms:${row.phone}?&body=${encodeURIComponent(message)}`}
                      className="font-semibold text-indigo-600"
                      title="Tap to open your messaging app with the invite pre-filled"
                    >
                      {row.phone} 📱
                    </a>
                  ) : (
                    "no phone"
                  )}{" "}
                  · {row.publicEmail ?? "no email"}
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
                    href={`sms:${row.phone}?&body=${encodeURIComponent(message)}`}
                    className="rounded-lg bg-sky-600 px-3 py-1.5 text-white"
                  >
                    Text invite
                  </a>
                ) : null}
                <CopyTextButton
                  text={message}
                  className="rounded-lg border border-indigo-300 px-3 py-1.5 text-indigo-700"
                >
                  Copy invite text
                </CopyTextButton>
                {row.categorySlug === WEDDING_SLUG ? (
                  <CopyTextButton
                    text={instagramMessage(row.name, row.slug)}
                    className="rounded-lg border border-fuchsia-300 px-3 py-1.5 text-fuchsia-700"
                  >
                    Copy Instagram DM
                  </CopyTextButton>
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
                <option value="sms">Text sent</option>
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
                href={`/admin/outreach?page=${page - 1}${searchParams.city ? `&city=${encodeURIComponent(searchParams.city)}` : ""}${status === "contacted" ? "&status=contacted" : ""}${tradeQs}`}
                className="text-indigo-600"
              >
                ← Previous
              </Link>
            ) : null}
            {page < pages ? (
              <Link
                href={`/admin/outreach?page=${page + 1}${searchParams.city ? `&city=${encodeURIComponent(searchParams.city)}` : ""}${status === "contacted" ? "&status=contacted" : ""}${tradeQs}`}
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
