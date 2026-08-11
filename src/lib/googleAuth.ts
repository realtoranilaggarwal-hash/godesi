import { siteUrl } from "@/lib/format";

/** Google sign-in stays off until both credentials are configured. */
export function googleAuthEnabled() {
  return Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
}

export function googleRedirectUri() {
  return `${siteUrl()}/api/auth/google/callback`;
}

export function googleAuthorizeUrl(state: string) {
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID ?? "",
    redirect_uri: googleRedirectUri(),
    response_type: "code",
    scope: "openid email profile",
    state,
    prompt: "select_account",
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

export type GoogleProfile = {
  email: string;
  name: string | null;
  picture: string | null;
  emailVerified: boolean;
};

/** Swaps the one-time code for a token, then reads the profile. */
export async function fetchGoogleProfile(code: string): Promise<GoogleProfile | null> {
  const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID ?? "",
      client_secret: process.env.GOOGLE_CLIENT_SECRET ?? "",
      redirect_uri: googleRedirectUri(),
      grant_type: "authorization_code",
    }),
    cache: "no-store",
  });
  if (!tokenResponse.ok) return null;

  const token: unknown = await tokenResponse.json();
  const accessToken =
    typeof token === "object" && token !== null && "access_token" in token
      ? String((token as { access_token: unknown }).access_token)
      : "";
  if (!accessToken) return null;

  const profileResponse = await fetch(
    "https://openidconnect.googleapis.com/v1/userinfo",
    { headers: { Authorization: `Bearer ${accessToken}` }, cache: "no-store" },
  );
  if (!profileResponse.ok) return null;

  const profile: unknown = await profileResponse.json();
  if (typeof profile !== "object" || profile === null) return null;
  const row = profile as Record<string, unknown>;
  const email = typeof row.email === "string" ? row.email.toLowerCase() : "";
  if (!email) return null;

  return {
    email,
    name: typeof row.name === "string" ? row.name : null,
    picture: typeof row.picture === "string" ? row.picture : null,
    emailVerified: row.email_verified === true,
  };
}
