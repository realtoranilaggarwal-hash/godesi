import { entities } from "./shared";

/**
 * Most vendor directories describe each listing to search engines with a
 * schema.org LocalBusiness block. That block is the factual part of the page —
 * name, telephone, town, the vendor's own website — so it is what we read, and
 * the only part. Their photos and their write-ups stay theirs.
 */

export type Postal = {
  streetAddress?: unknown;
  addressLocality?: unknown;
  addressRegion?: unknown;
};

export type LocalBusiness = {
  "@type"?: unknown;
  name?: unknown;
  telephone?: unknown;
  email?: unknown;
  address?: unknown;
  sameAs?: unknown;
  url?: unknown;
};

export function text(value: unknown) {
  return typeof value === "string" ? entities(value) : "";
}

export function postal(value: unknown): Postal {
  return value && typeof value === "object" ? (value as Postal) : {};
}

/**
 * A directory that forwards enquiries puts its own mailbox in the email field,
 * so anything on the directory's own domain is dropped rather than dialled.
 */
export function ownEmail(value: string, directoryHost: string) {
  const email = value.replace(/^mailto:/i, "").trim();
  if (!email.includes("@")) return "";
  const host = email.split("@")[1].toLowerCase();
  const forwarded = host.endsWith(directoryHost) || host.endsWith("placeholder");
  return forwarded ? "" : email;
}

const PLATFORM =
  /(facebook|instagram|twitter|x\.com|linkedin|youtube|pinterest|tiktok|yelp|google|wa\.me|whatsapp|linktr\.ee)\./;

/** The vendor's own site, told apart from its social profiles. */
export function ownSite(value: unknown, directoryHost: string) {
  const links = Array.isArray(value) ? value : [value];
  for (const link of links) {
    if (typeof link !== "string") continue;
    try {
      const host = new URL(link).hostname.replace(/^www\./, "");
      if (!PLATFORM.test(host) && !host.endsWith(directoryHost)) return link;
    } catch {
      continue;
    }
  }
  return "";
}

/** The business a vendor page describes to search engines. */
export function localBusiness(html: string): LocalBusiness | null {
  for (const block of Array.from(
    html.matchAll(
      /<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g,
    ),
  )) {
    let parsed: unknown;
    try {
      parsed = JSON.parse(entities(block[1]));
    } catch {
      continue;
    }
    const graph =
      parsed && typeof parsed === "object" && "@graph" in parsed
        ? (parsed as { "@graph": unknown })["@graph"]
        : parsed;
    for (const node of Array.isArray(graph) ? graph : [graph]) {
      if (!node || typeof node !== "object") continue;
      const found = node as LocalBusiness;
      if (JSON.stringify(found["@type"] ?? "").includes("LocalBusiness")) {
        return found;
      }
    }
  }
  return null;
}
