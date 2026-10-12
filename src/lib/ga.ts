import { SignJWT, importPKCS8 } from "jose";

export type GaTotals = { views: number; visitors: number };

const TOKEN_URL = "https://oauth2.googleapis.com/token";
const SCOPE = "https://www.googleapis.com/auth/analytics.readonly";
/** GA4 accepts nothing earlier than this as a report start date. */
const GA4_EPOCH = "2015-08-14";

type ServiceAccount = { client_email: string; private_key: string };

function serviceAccount(): ServiceAccount | null {
  const raw = process.env.GA_SERVICE_ACCOUNT_JSON;
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<ServiceAccount>;
    if (parsed.client_email && parsed.private_key) {
      return {
        client_email: parsed.client_email,
        private_key: parsed.private_key.replace(/\\n/g, "\n"),
      };
    }
  } catch {
    /* misconfigured env: treat as absent */
  }
  return null;
}

async function accessToken(account: ServiceAccount): Promise<string | null> {
  const key = await importPKCS8(account.private_key, "RS256");
  const assertion = await new SignJWT({ scope: SCOPE })
    .setProtectedHeader({ alg: "RS256", typ: "JWT" })
    .setIssuer(account.client_email)
    .setAudience(TOKEN_URL)
    .setIssuedAt()
    .setExpirationTime("1h")
    .sign(key);
  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion,
    }),
    cache: "no-store",
  });
  if (!res.ok) return null;
  const { access_token } = (await res.json()) as { access_token?: string };
  return access_token ?? null;
}

type Row = {
  dimensionValues?: { value?: string }[];
  metricValues?: { value?: string }[];
};

export function gaConfigured() {
  return Boolean(process.env.GA_PROPERTY_ID && serviceAccount());
}

/** One Analytics Data API call; null when unconfigured or anything fails. */
async function run(
  method: "runReport" | "runRealtimeReport",
  body: Record<string, unknown>,
  revalidate: number,
): Promise<Row[] | null> {
  const propertyId = process.env.GA_PROPERTY_ID;
  const account = serviceAccount();
  if (!propertyId || !account) return null;
  try {
    const token = await accessToken(account);
    if (!token) return null;
    const res = await fetch(
      `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:${method}`,
      {
        method: "POST",
        headers: {
          authorization: `Bearer ${token}`,
          "content-type": "application/json",
        },
        body: JSON.stringify(body),
        next: { revalidate },
      },
    );
    if (!res.ok) return null;
    const data = (await res.json()) as { rows?: Row[] };
    return data.rows ?? [];
  } catch {
    return null;
  }
}

const num = (row: Row | undefined, i: number) => {
  const n = Number(row?.metricValues?.[i]?.value ?? 0);
  return Number.isNaN(n) ? 0 : n;
};
const dim = (row: Row, i: number) => row.dimensionValues?.[i]?.value ?? "";

/**
 * Lifetime page views and users of the GA4 property, or null when GA is not
 * configured or unreachable. Needs `GA_PROPERTY_ID` (the numeric property id)
 * and `GA_SERVICE_ACCOUNT_JSON` (a service account added as Viewer on the
 * property). Never throws.
 */
export async function gaTotals(): Promise<GaTotals | null> {
  const rows = await run(
    "runReport",
    {
      dateRanges: [{ startDate: GA4_EPOCH, endDate: "today" }],
      metrics: [{ name: "screenPageViews" }, { name: "totalUsers" }],
    },
    1800,
  );
  if (!rows) return null;
  return { views: num(rows[0], 0), visitors: num(rows[0], 1) };
}

/** People on the site in the last 30 minutes. */
export async function gaActiveNow(): Promise<number | null> {
  const rows = await run(
    "runRealtimeReport",
    { metrics: [{ name: "activeUsers" }] },
    60,
  );
  if (!rows) return null;
  return num(rows[0], 0);
}

export type GaDay = { date: string; views: number; visitors: number };
export type GaRank = { label: string; value: number };
export type GaReport = {
  days: GaDay[];
  last30: GaTotals;
  pages: GaRank[];
  cities: GaRank[];
  countries: GaRank[];
  sources: GaRank[];
};

function ranks(rows: Row[] | null, labelOf: (r: Row) => string): GaRank[] {
  return (rows ?? [])
    .map((r) => ({ label: labelOf(r), value: num(r, 0) }))
    .filter((r) => r.label && r.label !== "(not set)" && r.value > 0);
}

/** The last 30 days in detail, for the public /traffic page. */
export async function gaReport(): Promise<GaReport | null> {
  const range = { dateRanges: [{ startDate: "30daysAgo", endDate: "today" }] };
  const top = (dimension: string, metric: string) =>
    run(
      "runReport",
      {
        ...range,
        dimensions: [{ name: dimension }],
        metrics: [{ name: metric }],
        orderBys: [{ metric: { metricName: metric }, desc: true }],
        limit: 10,
      },
      900,
    );

  const [daily, pages, cities, countries, sources] = await Promise.all([
    run(
      "runReport",
      {
        ...range,
        dimensions: [{ name: "date" }],
        metrics: [{ name: "screenPageViews" }, { name: "totalUsers" }],
        orderBys: [{ dimension: { dimensionName: "date" } }],
      },
      900,
    ),
    top("pagePath", "screenPageViews"),
    top("city", "totalUsers"),
    top("country", "totalUsers"),
    top("sessionDefaultChannelGroup", "sessions"),
  ]);
  if (!daily) return null;

  const counted = new Map<string, GaDay>();
  for (const r of daily) {
    const d = dim(r, 0); // YYYYMMDD
    const date = `${d.slice(0, 4)}-${d.slice(4, 6)}-${d.slice(6, 8)}`;
    counted.set(date, { date, views: num(r, 0), visitors: num(r, 1) });
  }
  // Every one of the 30 days, with zeros where Google has nothing yet.
  const days: GaDay[] = [];
  for (let i = 30; i >= 0; i--) {
    const date = new Date(Date.now() - i * 86_400_000)
      .toISOString()
      .slice(0, 10);
    days.push(counted.get(date) ?? { date, views: 0, visitors: 0 });
  }

  return {
    days,
    last30: {
      views: days.reduce((s, d) => s + d.views, 0),
      visitors: days.reduce((s, d) => s + d.visitors, 0),
    },
    pages: ranks(pages, (r) => dim(r, 0)),
    cities: ranks(cities, (r) => dim(r, 0)),
    countries: ranks(countries, (r) => dim(r, 0)),
    sources: ranks(sources, (r) => dim(r, 0)),
  };
}
