import type { Metadata } from "next";
import Link from "next/link";
import {
  type BulletinRow,
  CURRENT_BULLETIN,
  formatBulletinDate,
} from "@/lib/visaBulletin";
import { subcategorySlug } from "@/lib/categories";
import { PriorityDateChecker } from "@/components/PriorityDateChecker";
import { ShareButtons } from "@/components/ShareButtons";
import { SidebarBanners } from "@/components/Banners";
import { siteUrl } from "@/lib/format";
import { Card } from "@/components/ui";
import {
  VISA_NEWS_REVALIDATE,
  immigrationHelpers,
  visaHeadlines,
} from "@/lib/visaNews";

const bulletin = CURRENT_BULLETIN;

export const revalidate = VISA_NEWS_REVALIDATE;

function shortDate(date: Date) {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "America/New_York",
  });
}

export const metadata: Metadata = {
  title: `Visa Bulletin ${bulletin.month} for India — EB-2, EB-3, green card dates`,
  description: `${bulletin.month} Visa Bulletin cut-off dates for India and the rest of the world: EB-1, EB-2, EB-3 and family categories, a priority-date checker, plus H-1B and USCIS links.`,
  alternates: { canonical: "/visa-bulletin" },
};

const USEFUL_LINKS = [
  {
    href: "https://egov.uscis.gov/",
    label: "USCIS case status",
    note: "Enter the receipt number from your I-797.",
  },
  {
    href: "https://egov.uscis.gov/processing-times/",
    label: "USCIS processing times",
    note: "How long I-140, I-485, I-765 and H-1B take at each centre.",
  },
  {
    href: "https://www.uscis.gov/visabulletininfo",
    label: "Which chart USCIS uses this month",
    note: "Final action vs dates for filing, updated monthly.",
  },
  {
    href: "https://www.uscis.gov/working-in-the-united-states/h-1b-specialty-occupations",
    label: "H-1B rules on USCIS",
    note: "Cap, lottery registration, extensions and transfers.",
  },
  {
    href: "https://travel.state.gov/content/travel/en/legal/visa-law0/visa-bulletin.html",
    label: "Official Visa Bulletin (State Department)",
    note: "Every month's bulletin, including archives.",
  },
];

function Chart({
  title,
  rows,
  highlight,
}: {
  title: string;
  rows: BulletinRow[];
  highlight?: string;
}) {
  return (
    <Card>
      <h2 className="font-bold">{title}</h2>
      {highlight ? (
        <p className="mt-1 text-xs font-semibold text-emerald-700">
          {highlight}
        </p>
      ) : null}
      <div className="mt-3 overflow-x-auto">
        <table className="w-full min-w-[28rem] text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-xs uppercase text-slate-500">
              <th className="py-2 pr-3">Category</th>
              <th className="py-2 pr-3">🇮🇳 India</th>
              <th className="py-2">Rest of world</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.category} className="border-b border-slate-100">
                <td className="py-2 pr-3">
                  <span className="font-semibold">{row.category}</span>
                  <span className="block text-xs text-slate-500">
                    {row.label}
                  </span>
                </td>
                <td className="py-2 pr-3 font-bold text-indigo-700">
                  {formatBulletinDate(row.india)}
                </td>
                <td className="py-2">{formatBulletinDate(row.rest)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

export default async function VisaBulletinPage() {
  const [headlines, helpers] = await Promise.all([
    visaHeadlines(),
    immigrationHelpers().catch(() => []),
  ]);

  const filingNote =
    bulletin.uscisEmploymentChart === "DATES_FOR_FILING"
      ? `USCIS is accepting employment-based I-485s on this chart in ${bulletin.month}.`
      : undefined;
  const finalNote =
    bulletin.uscisEmploymentChart === "FINAL_ACTION"
      ? `USCIS is accepting employment-based I-485s on this chart in ${bulletin.month}.`
      : undefined;

  return (
    <div className="flex gap-6">
      <div className="min-w-0 flex-1 space-y-5">
        <section className="rounded-3xl bg-gradient-to-r from-indigo-600 via-blue-600 to-sky-500 px-5 py-8 text-white sm:px-8">
          <p className="text-xs font-semibold uppercase tracking-widest text-white/80">
            Green card tracker
          </p>
          <h1 className="mt-2 text-3xl font-black sm:text-4xl">
            Visa Bulletin {bulletin.month} — India 🛂
          </h1>
          <p className="mt-3 max-w-2xl text-white/90">
            Where the green card line stands this month for people born in
            India, next to everyone else (Pakistan, Bangladesh, Nepal and Sri
            Lanka use the &quot;rest of world&quot; column). Check your own
            priority date below.
          </p>
        </section>

        <Card>
          <h2 className="mb-3 font-bold">Is my priority date current?</h2>
          {bulletin.uscisEmploymentChart ? null : (
            <p className="mb-3 rounded-xl bg-amber-50 px-3 py-2 text-xs text-amber-800">
              USCIS has not yet said which employment chart it accepts I-485s on
              for {bulletin.month}; until it does, use final action dates. Check{" "}
              <a
                href="https://www.uscis.gov/visabulletininfo"
                target="_blank"
                rel="noreferrer noopener"
                className="underline"
              >
                uscis.gov/visabulletininfo
              </a>
              .
            </p>
          )}
          <PriorityDateChecker bulletin={bulletin} />
        </Card>

        <Chart
          title="Employment — final action dates"
          rows={bulletin.employment.finalAction}
          highlight={finalNote}
        />
        <Chart
          title="Employment — dates for filing"
          rows={bulletin.employment.filing}
          highlight={filingNote}
        />
        <Chart
          title="Family — final action dates"
          rows={bulletin.family.finalAction}
        />
        <Chart
          title="Family — dates for filing"
          rows={bulletin.family.filing}
        />

        {headlines.length ? (
          <Card>
            <h2 className="font-bold">📰 Latest visa & immigration news</h2>
            <p className="mb-3 text-xs text-slate-500">
              Headlines from news sites across the web, refreshed every few
              hours. Each one opens on the publisher&apos;s own site.
            </p>
            <ul className="divide-y divide-slate-100">
              {headlines.map((item) => (
                <li key={item.link} className="py-2">
                  <a
                    href={item.link}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="font-semibold text-slate-900 hover:text-indigo-700 hover:underline"
                  >
                    {item.title}
                  </a>
                  <span className="block text-xs text-slate-500">
                    {item.source ? `${item.source} · ` : ""}
                    {shortDate(item.publishedAt)}
                  </span>
                </li>
              ))}
            </ul>
          </Card>
        ) : null}

        <Card>
          <h2 className="font-bold">🤝 Immigration help on GoDesi</h2>
          <p className="mb-3 text-sm text-slate-600">
            Immigration attorneys, visa consultants and H-1B support listed on
            GoDesi. Ask for their licence (US: bar number or DOJ-accredited
            representative; Canada: RCIC) before you pay.
          </p>
          {helpers.length ? (
            <ul className="grid gap-2 sm:grid-cols-2">
              {helpers.map((business) => (
                <li key={business.slug}>
                  <Link
                    href={`/b/${business.slug}`}
                    className={`flex items-center gap-3 rounded-xl border p-3 hover:border-indigo-300 hover:bg-indigo-50/40 ${business.featured ? "border-amber-300 bg-amber-50/40" : "border-slate-200"}`}
                  >
                    {business.logoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={business.logoUrl}
                        alt=""
                        className="h-10 w-10 shrink-0 rounded-lg object-contain"
                      />
                    ) : (
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-lg">
                        🛂
                      </span>
                    )}
                    <span className="min-w-0">
                      <span className="block truncate font-semibold text-slate-900">
                        {business.name}
                      </span>
                      <span className="block truncate text-xs text-slate-500">
                        {business.subcategoryRef?.name ?? business.category} ·{" "}
                        {business.city}
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : null}
          <p className="mt-3 text-sm">
            Do you help people with visas or green cards?{" "}
            <Link
              href="/add-business"
              className="font-bold text-indigo-600 hover:underline"
            >
              List your practice free →
            </Link>
          </p>
        </Card>

        <Card>
          <h2 className="mb-2 font-bold">H-1B & USCIS — official links</h2>
          <ul className="space-y-2 text-sm">
            {USEFUL_LINKS.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="font-bold text-indigo-700 hover:underline"
                >
                  {link.label} ↗
                </a>
                <span className="block text-slate-600">{link.note}</span>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex flex-wrap gap-3 text-sm font-bold">
            <Link
              href="/news?topic=immigration"
              className="text-indigo-600 hover:underline"
            >
              Immigration news on GoDesi →
            </Link>
            <Link
              href={`/categories/${subcategorySlug("professionals", "Attorneys")}`}
              className="text-indigo-600 hover:underline"
            >
              Find a desi attorney →
            </Link>
            <Link
              href={`/categories/${subcategorySlug("professionals", "Immigration Consultants")}`}
              className="text-indigo-600 hover:underline"
            >
              Immigration consultants →
            </Link>
            <Link
              href="/events?genre=immigration-legal"
              className="text-indigo-600 hover:underline"
            >
              Free visa & legal clinics →
            </Link>
          </div>
        </Card>

        <Card>
          <p className="text-xs text-slate-500">
            Copied from the State Department&apos;s {bulletin.month} Visa
            Bulletin for general information — not legal advice. Always confirm
            with the{" "}
            <a
              href={bulletin.sourceUrl}
              target="_blank"
              rel="noreferrer noopener"
              className="underline"
            >
              official bulletin
            </a>{" "}
            and your attorney before filing.
          </p>
          <div className="mt-3">
            <ShareButtons
              url={`${siteUrl()}/visa-bulletin`}
              title={`Visa Bulletin ${bulletin.month} — India EB-1/EB-2/EB-3 dates`}
            />
          </div>
        </Card>
      </div>
      <SidebarBanners />
    </div>
  );
}
