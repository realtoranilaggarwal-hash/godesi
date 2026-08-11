import { siteUrl } from "@/lib/format";

/** Facebook sign-in stays off until both app credentials are configured. */
export function facebookAuthEnabled() {
  return Boolean(
    process.env.FACEBOOK_APP_ID && process.env.FACEBOOK_APP_SECRET,
  );
}

export function facebookRedirectUri() {
  return `${siteUrl()}/api/auth/facebook/callback`;
}

export function facebookAuthorizeUrl(state: string) {
  const params = new URLSearchParams({
    client_id: process.env.FACEBOOK_APP_ID ?? "",
    redirect_uri: facebookRedirectUri(),
    response_type: "code",
    scope: "public_profile,email",
    state,
  });
  return `https://www.facebook.com/v21.0/dialog/oauth?${params.toString()}`;
}

export type FacebookProfile = {
  email: string;
  name: string | null;
  picture: string | null;
};

/**
 * Swaps the one-time code for a token, then reads the profile. Facebook only
 * returns an email when the member granted it, so a missing email fails the
 * sign-in rather than creating a half-built account.
 */
export async function fetchFacebookProfile(
  code: string,
): Promise<FacebookProfile | null> {
  const tokenUrl = new URL("https://graph.facebook.com/v21.0/oauth/access_token");
  tokenUrl.searchParams.set("client_id", process.env.FACEBOOK_APP_ID ?? "");
  tokenUrl.searchParams.set(
    "client_secret",
    process.env.FACEBOOK_APP_SECRET ?? "",
  );
  tokenUrl.searchParams.set("redirect_uri", facebookRedirectUri());
  tokenUrl.searchParams.set("code", code);

  const tokenResponse = await fetch(tokenUrl, { cache: "no-store" });
  if (!tokenResponse.ok) return null;

  const token: unknown = await tokenResponse.json();
  const accessToken =
    typeof token === "object" && token !== null && "access_token" in token
      ? String((token as { access_token: unknown }).access_token)
      : "";
  if (!accessToken) return null;

  const profileUrl = new URL("https://graph.facebook.com/v21.0/me");
  profileUrl.searchParams.set("fields", "id,name,email,picture.width(256)");
  profileUrl.searchParams.set("access_token", accessToken);

  const profileResponse = await fetch(profileUrl, { cache: "no-store" });
  if (!profileResponse.ok) return null;

  const profile: unknown = await profileResponse.json();
  if (typeof profile !== "object" || profile === null) return null;
  const row = profile as Record<string, unknown>;
  const email = typeof row.email === "string" ? row.email.toLowerCase() : "";
  if (!email) return null;

  const picture =
    typeof row.picture === "object" && row.picture !== null
      ? (row.picture as { data?: { url?: unknown } }).data?.url
      : undefined;

  return {
    email,
    name: typeof row.name === "string" ? row.name : null,
    picture: typeof picture === "string" ? picture : null,
  };
}
