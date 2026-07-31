import type { LiveChannel } from "@prisma/client";
import { db } from "@/lib/db";
import {
  RADIO_STATIONS,
  TV_CHANNELS,
  radioEmbedUrl,
  tvEmbedUrl,
  type RadioStation,
  type TvChannel,
} from "@/lib/liveMedia";
import { slugify } from "@/lib/slug";

/** A month of carriage for a commercial station or channel. */
export const LIVE_CHANNEL_MONTHLY_USD = 50;
export const LIVE_CHANNEL_MONTHS = [1, 3, 6, 12];

export type LiveEntry = {
  key: string;
  kind: "radio" | "tv";
  name: string;
  place: string;
  src: string;
  featured: boolean;
  about: string | null;
  websiteUrl: string | null;
  /** Built-in stations are editorial; the rest were submitted by members. */
  submitted: boolean;
  nonProfit: boolean;
  /** TV only: false when the broadcaster is not streaming right now. */
  live: boolean;
  /** TV only: groups the grid by language. */
  language: string | null;
};

function fromRadio(station: RadioStation): LiveEntry {
  return {
    key: station.id,
    kind: "radio",
    name: station.name,
    place: station.place,
    src: radioEmbedUrl(station),
    featured: false,
    about: null,
    websiteUrl: null,
    submitted: false,
    nonProfit: false,
    live: true,
    language: null,
  };
}

function fromTv(channel: TvChannel, videoId: string | null): LiveEntry {
  return {
    key: channel.id,
    kind: "tv",
    name: channel.name,
    place: channel.place,
    src: tvEmbedUrl(channel, { videoId }),
    featured: false,
    about: null,
    websiteUrl: `https://www.youtube.com/channel/${channel.youtubeChannelId}/live`,
    submitted: false,
    nonProfit: false,
    live: videoId !== null,
    language: channel.language,
  };
}

export function fromChannel(channel: LiveChannel): LiveEntry {
  const radio = channel.kind === "RADIO";
  return {
    key: channel.id,
    kind: radio ? "radio" : "tv",
    name: channel.name,
    place: channel.place,
    src: radio
      ? radioEmbedUrl({
          id: channel.id,
          name: channel.name,
          place: channel.place,
          tuneinId: channel.embedId,
        })
      : tvEmbedUrl(
          {
            id: channel.id,
            name: channel.name,
            place: channel.place,
            language: "Desi",
            youtubeChannelId: channel.embedId,
          },
          {},
        ),
    featured: channel.featured,
    about: channel.about,
    websiteUrl: channel.websiteUrl,
    submitted: true,
    nonProfit: channel.nonProfit,
    live: true,
    language: radio ? null : "Desi",
  };
}

/** Approved submissions only, and paid carriage must still be in date. */
export async function approvedChannels(kind: "RADIO" | "TV") {
  const now = new Date();
  const rows = await db.liveChannel.findMany({
    where: {
      kind,
      status: "APPROVED",
      OR: [{ nonProfit: true }, { paidUntil: { gte: now } }],
    },
    orderBy: [{ featured: "desc" }, { approvedAt: "desc" }],
    take: 60,
  });
  return rows.map(fromChannel);
}

/**
 * Featured submissions sit above the built-in stations; everything else follows.
 */
export async function radioEntries(): Promise<LiveEntry[]> {
  const submitted = await approvedChannels("RADIO");
  return [
    ...submitted.filter((entry) => entry.featured),
    ...RADIO_STATIONS.map(fromRadio),
    ...submitted.filter((entry) => !entry.featured),
  ];
}

export async function tvEntries(
  liveIds: Map<string, string | null>,
): Promise<LiveEntry[]> {
  const submitted = await approvedChannels("TV");
  return [
    ...submitted.filter((entry) => entry.featured),
    ...TV_CHANNELS.map((channel) => fromTv(channel, liveIds.get(channel.id) ?? null)),
    ...submitted.filter((entry) => !entry.featured),
  ];
}

export async function uniqueChannelSlug(name: string) {
  const base = slugify(name) || "channel";
  let slug = base;
  let suffix = 1;
  while (await db.liveChannel.findUnique({ where: { slug } })) {
    suffix += 1;
    slug = `${base}-${suffix}`;
  }
  return slug;
}

/** TuneIn ids look like s123456; YouTube channel ids start with UC. */
export function normalizeEmbedId(kind: "RADIO" | "TV", value: string) {
  const trimmed = value.trim();
  if (kind === "RADIO") {
    const match = trimmed.match(/s\d{3,}/i);
    return match ? match[0].toLowerCase() : null;
  }
  const match = trimmed.match(/UC[\w-]{20,}/);
  return match ? match[0] : null;
}
