/**
 * Shared reading of a page somebody pasted: fetch it once, then pull facts out
 * of its meta tags and schema.org JSON-LD. Facts only — a name, a date, a town
 * — never someone else's prose or pictures wholesale.
 */

import { lookup } from "node:dns/promises";
import { isIP, isIPv4 } from "node:net";

const PRIVATE_HOST =
  /^(localhost$|0\.|127\.|10\.|192\.168\.|169\.254\.|172\.(1[6-9]|2\d|3[01])\.|\[?::1)/i;

export function plainText(value: string) {
  return value
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#0?39;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function meta(page: string, property: string) {
  const pattern = new RegExp(
    `<meta[^>]+(?:property|name)=["']${property}["'][^>]*content=["']([^"']*)["']`,
    "i",
  );
  const reversed = new RegExp(
    `<meta[^>]+content=["']([^"']*)["'][^>]*(?:property|name)=["']${property}["']`,
    "i",
  );
  return plainText(pattern.exec(page)?.[1] ?? reversed.exec(page)?.[1] ?? "");
}

export type Json = Record<string, unknown>;

export function isJson(value: unknown): value is Json {
  return typeof value === "object" && value !== null;
}

export function text(value: unknown) {
  return typeof value === "string" ? plainText(value) : "";
}

/** Walks @graph and arrays, which is how most sites nest their JSON-LD. */
function flatten(node: unknown, out: Json[] = []) {
  if (Array.isArray(node)) {
    for (const item of node) flatten(item, out);
  } else if (isJson(node)) {
    out.push(node);
    flatten(node["@graph"], out);
  }
  return out;
}

/** The first JSON-LD node whose @type matches, e.g. /Event$/ or /Business$/. */
export function findLd(page: string, type: RegExp) {
  const pattern =
    /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  for (let block = pattern.exec(page); block; block = pattern.exec(page)) {
    let parsed: unknown;
    try {
      parsed = JSON.parse(block[1].trim());
    } catch {
      continue;
    }
    for (const node of flatten(parsed)) {
      const kind = node["@type"];
      const kinds = Array.isArray(kind) ? kind : [kind];
      if (kinds.some((item) => typeof item === "string" && type.test(item))) {
        return node;
      }
    }
  }
  return null;
}

/** schema.org place or postal address, either nested or flat. */
export function address(node: unknown) {
  if (!isJson(node)) {
    return { venue: "", street: "", address: "", city: "", state: "" };
  }
  const postal = isJson(node.address) ? node.address : node;
  const street = isJson(node.address)
    ? text(postal.streetAddress)
    : text(node.address) || text(node.streetAddress);
  return {
    venue: text(node.name),
    street,
    address: [street, text(postal.addressLocality), text(postal.addressRegion)]
      .filter(Boolean)
      .join(", "),
    city: text(postal.addressLocality),
    state: text(postal.addressRegion),
  };
}

/** Addresses that belong to our own network rather than the public internet. */
function privateAddress(address: string): boolean {
  if (isIPv4(address)) {
    const [a, b] = address.split(".").map(Number);
    return (
      a === 0 ||
      a === 10 ||
      a === 127 ||
      (a === 100 && b >= 64 && b <= 127) ||
      (a === 169 && b === 254) ||
      (a === 172 && b >= 16 && b <= 31) ||
      (a === 192 && b === 168) ||
      a >= 224
    );
  }
  const packed = address.toLowerCase().replace(/^\[|\]$/g, "");
  if (packed === "::" || packed === "::1") return true;
  if (/^(fc|fd|fe8|fe9|fea|feb)/.test(packed)) return true;
  const mapped = /^::ffff:(\d+\.\d+\.\d+\.\d+)$/.exec(packed);
  return mapped ? privateAddress(mapped[1]) : false;
}

/**
 * A link is only safe to fetch server-side once we know the name it resolves to
 * is on the public internet: a hostname alone can point anywhere, including our
 * own database. Locally we let private names through so dev servers work.
 */
export async function publicUrl(link: string) {
  const target = new URL(link);
  if (!/^https?:$/.test(target.protocol)) {
    throw new Error("Paste a public page address, starting with https://");
  }
  if (process.env.NODE_ENV !== "production") return target;

  const host = target.hostname.replace(/^\[|\]$/g, "");
  if (PRIVATE_HOST.test(target.hostname)) {
    throw new Error("Paste a public page address, starting with https://");
  }
  const addresses = isIP(host)
    ? [{ address: host }]
    : await lookup(host, { all: true, verbatim: true }).catch(() => []);
  if (!addresses.length || addresses.some((entry) => privateAddress(entry.address))) {
    throw new Error("Paste a public page address, starting with https://");
  }
  return target;
}

/**
 * Fetches a pasted page, announcing who we are so a site can refuse. Redirects
 * are followed by hand so each hop is checked, not just the address pasted.
 */
export async function readPage(link: string) {
  let target = await publicUrl(link);

  for (let hop = 0; hop < 5; hop += 1) {
    const response = await fetch(target.toString(), {
      headers: {
        "User-Agent": "GodesiPageReader/1.0 (+https://godesi.com)",
        Accept: "text/html,application/xhtml+xml",
      },
      cache: "no-store",
      redirect: "manual",
      signal: AbortSignal.timeout(15_000),
    });

    const next = response.headers.get("location");
    if (response.status >= 300 && response.status < 400 && next) {
      target = await publicUrl(new URL(next, target).toString());
      continue;
    }
    if (!response.ok) {
      throw new Error(`That page answered HTTP ${response.status}`);
    }
    return { target, page: (await response.text()).slice(0, 800_000) };
  }
  throw new Error("That address redirects too many times");
}
