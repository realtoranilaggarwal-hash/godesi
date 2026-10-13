/**
 * Shared reading of a page somebody pasted: fetch it once, then pull facts out
 * of its meta tags and schema.org JSON-LD. Facts only — a name, a date, a town
 * — never someone else's prose or pictures wholesale.
 */

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

/** Fetches a pasted page, announcing who we are so a site can refuse. */
export async function readPage(link: string) {
  const target = new URL(link);
  const blocked =
    PRIVATE_HOST.test(target.hostname) && process.env.NODE_ENV === "production";
  if (!/^https?:$/.test(target.protocol) || blocked) {
    throw new Error("Paste a public page address, starting with https://");
  }

  const response = await fetch(target.toString(), {
    headers: {
      "User-Agent": "GodesiPageReader/1.0 (+https://godesi.com)",
      Accept: "text/html,application/xhtml+xml",
    },
    cache: "no-store",
    signal: AbortSignal.timeout(15_000),
  });
  if (!response.ok) throw new Error(`That page answered HTTP ${response.status}`);
  return { target, page: (await response.text()).slice(0, 800_000) };
}
