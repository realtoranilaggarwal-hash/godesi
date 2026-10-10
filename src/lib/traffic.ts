import { visitTotals } from "@/lib/visits";
import { gaConfigured, gaTotals } from "@/lib/ga";

export type Traffic = {
  views: number;
  visitors: number;
  since: Date | null;
  /** True when the numbers come from Umami/GA rather than our own counter. */
  measured: boolean;
};

/**
 * Where "live traffic" points: our own /traffic page once Google Analytics
 * can be read, else an external report (Looker Studio / Umami share) if set.
 */
export function trafficReportUrl(): string | undefined {
  if (gaConfigured()) return "/traffic";
  return (
    process.env.NEXT_PUBLIC_TRAFFIC_REPORT_URL ||
    process.env.NEXT_PUBLIC_UMAMI_SHARE_URL ||
    undefined
  );
}

/** Umami's read API lives on a regional gateway, not on the dashboard host. */
const GATEWAY = process.env.UMAMI_GATEWAY ?? "https://gateway-us.umami.is";

function shareId() {
  const url = process.env.NEXT_PUBLIC_UMAMI_SHARE_URL ?? "";
  const match = /\/share\/([A-Za-z0-9]+)/.exec(url);
  return match?.[1] ?? null;
}

/**
 * Everything since tracking started. Umami counted the first months (and its
 * lifetime total stays readable after the plan cap froze it); Google Analytics
 * counts from the day it was added, so the two are summed. Falls back to our
 * own ping counter if neither answers, and never throws: a footer line is not
 * worth an error page.
 */
export async function siteTraffic(): Promise<Traffic> {
  const [umami, ga] = await Promise.all([umamiTraffic(), gaTotals()]);
  if (umami || ga) {
    return {
      views: (umami?.views ?? 0) + (ga?.views ?? 0),
      visitors: (umami?.visitors ?? 0) + (ga?.visitors ?? 0),
      since: umami?.since ?? null,
      measured: true,
    };
  }

  try {
    const own = await visitTotals();
    return { ...own, since: null, measured: false };
  } catch {
    return { views: 0, visitors: 0, since: null, measured: false };
  }
}

async function umamiTraffic(): Promise<Omit<Traffic, "measured"> | null> {
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
              };
            }
          }
        }
      }
    } catch {
      /* unreachable: caller falls back */
    }
  }
  return null;
}
