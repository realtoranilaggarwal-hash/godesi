import { visitTotals } from "@/lib/visits";

export type Traffic = {
  views: number;
  visitors: number;
  since: Date | null;
  /** True when the numbers come from Umami rather than our own counter. */
  measured: boolean;
};

/** Umami's read API lives on a regional gateway, not on the dashboard host. */
const GATEWAY = process.env.UMAMI_GATEWAY ?? "https://gateway-us.umami.is";

function shareId() {
  const url = process.env.NEXT_PUBLIC_UMAMI_SHARE_URL ?? "";
  const match = /\/share\/([A-Za-z0-9]+)/.exec(url);
  return match?.[1] ?? null;
}

/**
 * Everything since tracking started, read from the public share link the site
 * already publishes — the same numbers a visitor sees on the traffic dashboard,
 * so nothing here is guessed. Falls back to our own ping counter if Umami is
 * unreachable, and never throws: a footer line is not worth an error page.
 */
export async function siteTraffic(): Promise<Traffic> {
  const id = shareId();
  if (id) {
    try {
      const share = await fetch(`${GATEWAY}/api/share/${id}`, {
        next: { revalidate: 1800 },
      });
      if (share.ok) {
        const { token, websiteId } = (await share.json()) as {
          token?: string;
          websiteId?: string;
        };
        if (token && websiteId) {
          const headers = {
            "x-umami-share-token": token,
            "x-umami-share-context": "1",
          };
          const [range, stats] = await Promise.all([
            fetch(`${GATEWAY}/api/websites/${websiteId}/daterange`, {
              headers,
              next: { revalidate: 86400 },
            }),
            fetch(
              `${GATEWAY}/api/websites/${websiteId}/stats?startAt=0&endAt=${Date.now()}`,
              { headers, next: { revalidate: 1800 } },
            ),
          ]);
          if (stats.ok) {
            const totals = (await stats.json()) as {
              pageviews?: number;
              visitors?: number;
            };
            const startDate = range.ok
              ? ((await range.json()) as { startDate?: string }).startDate
              : null;
            const since = startDate ? new Date(startDate) : null;
            if (
              typeof totals.pageviews === "number" &&
              typeof totals.visitors === "number"
            ) {
              return {
                views: totals.pageviews,
                visitors: totals.visitors,
                since: since && !Number.isNaN(since.getTime()) ? since : null,
                measured: true,
              };
            }
          }
        }
      }
    } catch {
      /* fall through to our own counter */
    }
  }

  try {
    const own = await visitTotals();
    return { ...own, since: null, measured: false };
  } catch {
    return { views: 0, visitors: 0, since: null, measured: false };
  }
}
