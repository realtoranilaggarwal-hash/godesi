import Link from "next/link";
import { requestCurrency } from "@/lib/currency";
import {
  RESOURCE_KIND_LABELS,
  formatResourcePrice,
  recommendedLinks,
} from "@/lib/resources";
import { LinkImpressions } from "@/components/LinkImpressions";
import { Card } from "@/components/ui";

/**
 * Small curated box of outbound links, filtered to the page's category. Kept
 * deliberately plain — it should read as a recommendation, not an ad block.
 */
export async function RecommendedLinks({
  categorySlug,
  title = "Recommended links",
}: {
  categorySlug?: string | null;
  title?: string;
}) {
  const [links, currency] = [await recommendedLinks(categorySlug), requestCurrency()];
  const from = formatResourcePrice(currency, 1_000);

  return (
    <Card>
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="text-base font-bold">{title}</h2>
        <Link
          href="/resources"
          className="text-xs font-semibold text-indigo-600 hover:underline"
        >
          All resources →
        </Link>
      </div>

      {links.length ? (
        <>
          <LinkImpressions ids={links.map((link) => link.id)} />
          <ul className="mt-3 divide-y divide-slate-100">
            {links.map((link) => (
              <li key={link.id} className="py-2">
                <a
                  href={`/api/links/${link.id}/click`}
                  target="_blank"
                  rel="noreferrer sponsored nofollow"
                  className="text-sm font-medium text-indigo-700 hover:underline"
                >
                  {link.title}
                </a>
                <p className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-slate-400">
                  <span>{RESOURCE_KIND_LABELS[link.kind]}</span>
                  {link.tag ? <span>· {link.tag}</span> : null}
                </p>
              </li>
            ))}
          </ul>
        </>
      ) : (
        <p className="mt-2 text-sm text-slate-500">
          No links here yet — this space is open.
        </p>
      )}

      <div className="mt-3 rounded-xl bg-indigo-50/70 p-3">
        <p className="text-xs font-semibold text-indigo-900">
          Promote your link here — from {from} per 1,000 views
        </p>
        <Link
          href="/resources/new"
          className="mt-2 inline-block rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700"
        >
          Advertise link
        </Link>
      </div>
    </Card>
  );
}
