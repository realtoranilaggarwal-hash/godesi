import { createHmac, randomUUID } from "crypto";
import { db } from "@/lib/db";
import { siteUrl } from "@/lib/format";
import { newsPath } from "@/lib/newsLinks";

export const SHARE_KINDS = [
  { key: "business", label: "New business cards", icon: "🏪" },
  {
    key: "listing",
    label: "New property, room and marketplace posts",
    icon: "🏠",
  },
  { key: "event", label: "New events", icon: "🎟️" },
  { key: "news", label: "Published local news reports", icon: "📰" },
] as const;

export type ShareKind = (typeof SHARE_KINDS)[number]["key"];

export const SHARE_CHANNELS = ["FACEBOOK", "TELEGRAM", "X"] as const;
export type ShareChannel = (typeof SHARE_CHANNELS)[number];

export type SharePayload = {
  kind: ShareKind;
  /** Stable id of the thing being shared, so we never post it twice. */
  id: string;
  title: string;
  body: string;
  /** Path on Godesi, e.g. "/events/diwali-mela". */
  path: string;
  imageUrl?: string | null;
  tags?: string[];
};

export function facebookConfigured() {
  return Boolean(
    process.env.FACEBOOK_PAGE_ID && process.env.FACEBOOK_PAGE_TOKEN,
  );
}

export function xConfigured() {
  return Boolean(
    process.env.X_API_KEY &&
    process.env.X_API_SECRET &&
    process.env.X_ACCESS_TOKEN &&
    process.env.X_ACCESS_SECRET,
  );
}

export function telegramConfigured() {
  return Boolean(
    process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID,
  );
}

/** Which content types staff have switched on; unset keys default to on. */
export async function shareSettings(): Promise<Record<ShareKind, boolean>> {
  const rows = await db.autoShareSetting.findMany();
  const byKey = new Map(rows.map((row) => [row.key, row.enabled]));
  return Object.fromEntries(
    SHARE_KINDS.map((kind) => [kind.key, byKey.get(kind.key) ?? true]),
  ) as Record<ShareKind, boolean>;
}

function message(payload: SharePayload) {
  const url = `${siteUrl()}${payload.path}`;
  const tags = ["#godesi", ...(payload.tags ?? [])]
    .map((tag) => (tag.startsWith("#") ? tag : `#${tag.replace(/\W+/g, "")}`))
    .join(" ");
  return `${payload.title}\n\n${payload.body}\n\n${url}\n${tags}`.trim();
}

async function postToFacebook(payload: SharePayload) {
  const pageId = process.env.FACEBOOK_PAGE_ID;
  const token = process.env.FACEBOOK_PAGE_TOKEN;
  if (!pageId || !token) throw new Error("Facebook page is not connected");

  const link = `${siteUrl()}${payload.path}`;
  const endpoint = payload.imageUrl
    ? `https://graph.facebook.com/v21.0/${pageId}/photos`
    : `https://graph.facebook.com/v21.0/${pageId}/feed`;

  const body = payload.imageUrl
    ? { url: payload.imageUrl, caption: message(payload), access_token: token }
    : { message: message(payload), link, access_token: token };

  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = (await res.json()) as {
    id?: string;
    post_id?: string;
    error?: { message?: string };
  };
  if (!res.ok || data.error) {
    throw new Error(data.error?.message ?? `Facebook returned ${res.status}`);
  }
  return data.post_id ?? data.id ?? "posted";
}

async function postToTelegram(payload: SharePayload) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) throw new Error("Telegram channel is not connected");

  const text = message(payload);
  const endpoint = payload.imageUrl
    ? `https://api.telegram.org/bot${token}/sendPhoto`
    : `https://api.telegram.org/bot${token}/sendMessage`;

  const body = payload.imageUrl
    ? { chat_id: chatId, photo: payload.imageUrl, caption: text.slice(0, 1024) }
    : { chat_id: chatId, text, disable_web_page_preview: false };

  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = (await res.json()) as {
    ok?: boolean;
    description?: string;
    result?: { message_id?: number };
  };
  if (!res.ok || !data.ok) {
    throw new Error(data.description ?? `Telegram returned ${res.status}`);
  }
  return String(data.result?.message_id ?? "posted");
}

/** Percent-encoding OAuth 1.0a asks for: stricter than encodeURIComponent. */
function oauthEncode(value: string) {
  return encodeURIComponent(value).replace(
    /[!*'()]/g,
    (char) => `%${char.charCodeAt(0).toString(16).toUpperCase()}`,
  );
}

/**
 * X still only accepts OAuth 1.0a user-context signatures for posting, and the
 * payload is JSON, so the body is deliberately left out of the signature base.
 */
function xAuthHeader(url: string, method: "POST") {
  const params: Record<string, string> = {
    oauth_consumer_key: process.env.X_API_KEY ?? "",
    oauth_nonce: randomUUID().replace(/-/g, ""),
    oauth_signature_method: "HMAC-SHA1",
    oauth_timestamp: String(Math.floor(Date.now() / 1000)),
    oauth_token: process.env.X_ACCESS_TOKEN ?? "",
    oauth_version: "1.0",
  };

  const base = [
    method,
    oauthEncode(url),
    oauthEncode(
      Object.keys(params)
        .sort()
        .map((key) => `${oauthEncode(key)}=${oauthEncode(params[key])}`)
        .join("&"),
    ),
  ].join("&");

  const signingKey = `${oauthEncode(process.env.X_API_SECRET ?? "")}&${oauthEncode(
    process.env.X_ACCESS_SECRET ?? "",
  )}`;
  const signature = createHmac("sha1", signingKey)
    .update(base)
    .digest("base64");

  return `OAuth ${Object.entries({ ...params, oauth_signature: signature })
    .map(([key, value]) => `${oauthEncode(key)}="${oauthEncode(value)}"`)
    .join(", ")}`;
}

/** X counts a link as 23 characters however long it is. */
function tweetText(payload: SharePayload) {
  const url = `${siteUrl()}${payload.path}`;
  const tags = ["#Godesi", ...(payload.tags ?? [])]
    .map((tag) => (tag.startsWith("#") ? tag : `#${tag.replace(/\W+/g, "")}`))
    .join(" ");
  const room = 280 - 23 - tags.length - 4;
  const head =
    payload.title.length > room
      ? `${payload.title.slice(0, room - 1).trimEnd()}…`
      : payload.title;
  return `${head}\n\n${url}\n${tags}`;
}

async function postToX(payload: SharePayload) {
  if (!xConfigured()) throw new Error("X is not connected");

  const endpoint = "https://api.twitter.com/2/tweets";
  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      Authorization: xAuthHeader(endpoint, "POST"),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ text: tweetText(payload) }),
  });
  const data = (await res.json().catch(() => ({}))) as {
    data?: { id?: string };
    detail?: string;
    title?: string;
  };
  if (!res.ok) {
    throw new Error(data.detail ?? data.title ?? `X returned ${res.status}`);
  }
  return data.data?.id ?? "posted";
}

/**
 * Broadcasts one new post to every connected channel. Failures are recorded
 * and swallowed: a social outage must never break someone's listing.
 */
export async function autoShare(payload: SharePayload, force = false) {
  if (!force) {
    const settings = await shareSettings();
    if (!settings[payload.kind]) return;
  }

  const subject = `${payload.kind}:${payload.id}`;
  const url = `${siteUrl()}${payload.path}`;

  const jobs: { channel: ShareChannel; run: () => Promise<string> }[] = [];
  if (facebookConfigured()) {
    jobs.push({ channel: "FACEBOOK", run: () => postToFacebook(payload) });
  }
  if (telegramConfigured()) {
    jobs.push({ channel: "TELEGRAM", run: () => postToTelegram(payload) });
  }
  if (xConfigured()) {
    jobs.push({ channel: "X", run: () => postToX(payload) });
  }

  await Promise.all(
    jobs.map(async (job) => {
      const already = await db.shareLog.findUnique({
        where: { channel_subject: { channel: job.channel, subject } },
        select: { status: true },
      });
      if (already?.status === "SENT" && !force) return;

      try {
        const detail = await job.run();
        await db.shareLog.upsert({
          where: { channel_subject: { channel: job.channel, subject } },
          create: {
            channel: job.channel,
            subject,
            title: payload.title,
            url,
            status: "SENT",
            detail,
          },
          update: { status: "SENT", detail, title: payload.title, url },
        });
      } catch (error) {
        const detail =
          error instanceof Error
            ? error.message.slice(0, 300)
            : "Unknown error";
        await db.shareLog.upsert({
          where: { channel_subject: { channel: job.channel, subject } },
          create: {
            channel: job.channel,
            subject,
            title: payload.title,
            url,
            status: "FAILED",
            detail,
          },
          update: { status: "FAILED", detail, title: payload.title, url },
        });
      }
    }),
  );
}

/** Rebuilds the post for a subject like "event:clx…" so a failure can be retried. */
export async function payloadForSubject(
  subject: string,
): Promise<SharePayload | null> {
  const [kind, id] = subject.split(":");
  if (!id) return null;

  if (kind === "business") {
    const business = await db.business.findUnique({
      where: { id },
      include: {
        media: { where: { type: "IMAGE" }, take: 1, select: { url: true } },
      },
    });
    if (!business || business.status !== "APPROVED") return null;
    return {
      kind: "business",
      id: business.id,
      title: `🏪 ${business.name}`,
      body: [business.category, business.city, business.description]
        .filter(Boolean)
        .join(" · ")
        .slice(0, 400),
      path: `/b/${business.slug}`,
      imageUrl: business.logoUrl ?? business.media[0]?.url ?? null,
      tags: [business.city, "desibusiness"],
    };
  }

  if (kind === "listing") {
    const listing = await db.listing.findUnique({
      where: { id },
      include: { images: { take: 1, select: { url: true } } },
    });
    if (!listing || listing.status !== "APPROVED") return null;
    return {
      kind: "listing",
      id: listing.id,
      title: `🏠 ${listing.title}`,
      body: `${listing.city}${listing.area ? `, ${listing.area}` : ""} · ${listing.description.slice(0, 300)}`,
      path: `/listings/${listing.slug}`,
      imageUrl: listing.images[0]?.url ?? null,
      tags: [listing.city, "desihousing"],
    };
  }

  if (kind === "event") {
    const event = await db.event.findUnique({ where: { id } });
    if (!event || event.status !== "APPROVED") return null;
    return {
      kind: "event",
      id: event.id,
      title: `🎟️ ${event.title}`,
      body: `${event.startsAt.toDateString()} · ${event.venue}, ${event.city}`,
      path: `/events/${event.slug}`,
      imageUrl: event.imageUrl,
      tags: [event.city, "desievents"],
    };
  }

  if (kind === "news") {
    const item = await db.newsItem.findUnique({ where: { id } });
    if (!item || item.status !== "PUBLISHED") return null;
    return {
      kind: "news",
      id: item.id,
      title: item.title,
      body: item.summary,
      path: newsPath(item),
      imageUrl: item.imageUrl,
      tags: [item.city ?? "", item.category ?? "news"].filter(Boolean),
    };
  }

  return null;
}

/** Never blocks the caller — the post is already saved by the time we share. */
export function autoShareInBackground(payload: SharePayload) {
  void autoShare(payload).catch(() => null);
}
