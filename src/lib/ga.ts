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

/**
 * Lifetime page views and users of the GA4 property, or null when GA is not
 * configured or unreachable. Needs `GA_PROPERTY_ID` (the numeric property id)
 * and `GA_SERVICE_ACCOUNT_JSON` (a service account added as Viewer on the
 * property). Never throws.
 */
export async function gaTotals(): Promise<GaTotals | null> {
  const propertyId = process.env.GA_PROPERTY_ID;
  const account = serviceAccount();
  if (!propertyId || !account) return null;
  try {
    const token = await accessToken(account);
    if (!token) return null;
    const res = await fetch(
      `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`,
      {
        method: "POST",
        headers: {
          authorization: `Bearer ${token}`,
          "content-type": "application/json",
        },
        body: JSON.stringify({
          dateRanges: [{ startDate: GA4_EPOCH, endDate: "today" }],
          metrics: [{ name: "screenPageViews" }, { name: "totalUsers" }],
        }),
        next: { revalidate: 1800 },
      },
    );
    if (!res.ok) return null;
    const data = (await res.json()) as {
      rows?: { metricValues?: { value?: string }[] }[];
    };
    const values = data.rows?.[0]?.metricValues ?? [];
    const views = Number(values[0]?.value ?? 0);
    const visitors = Number(values[1]?.value ?? 0);
    if (Number.isNaN(views) || Number.isNaN(visitors)) return null;
    return { views, visitors };
  } catch {
    return null;
  }
}
