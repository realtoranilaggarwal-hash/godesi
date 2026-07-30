/**
 * Live radio and TV are embed-only: TuneIn for audio, YouTube for video.
 * Godesi never hosts or re-streams anything, so adding a station is just a
 * matter of adding its official embed id here.
 */
export type RadioStation = {
  id: string;
  name: string;
  place: string;
  /** TuneIn guide id, e.g. s183986 → tunein.com/embed/player/s183986/ */
  tuneinId: string;
};

export type TvChannel = {
  id: string;
  name: string;
  place: string;
  /** YouTube channel id — the official live_stream embed always plays the current live show. */
  youtubeChannelId: string;
};

export const RADIO_STATIONS: RadioStation[] = [
  {
    id: "radio-city-hindi",
    name: "Radio City Hindi",
    place: "Mumbai, India",
    tuneinId: "s183986",
  },
  {
    id: "radio-nyra",
    name: "Radio Nyra — Bollywood",
    place: "New York, USA",
    tuneinId: "s303043",
  },
  {
    id: "radio-zindagi",
    name: "Radio Zindagi",
    place: "California, USA",
    tuneinId: "s232394",
  },
  {
    id: "desi-radio",
    name: "Desi Radio — Punjabi",
    place: "Punjab / worldwide",
    tuneinId: "s37348",
  },
  {
    id: "india-today-radio",
    name: "India Today Radio",
    place: "Delhi, India",
    tuneinId: "s327998",
  },
];

export const TV_CHANNELS: TvChannel[] = [
  {
    id: "ndtv",
    name: "NDTV Live",
    place: "English news · India",
    youtubeChannelId: "UCZFMm1mMw0F81Z37aaEzTUA",
  },
  {
    id: "aaj-tak",
    name: "Aaj Tak Live",
    place: "Hindi news · India",
    youtubeChannelId: "UCt4t-jeY85JegMlZ-E5UWtA",
  },
  {
    id: "abp-news",
    name: "ABP News Live",
    place: "Hindi news · India",
    youtubeChannelId: "UCRWFSbif-RFENbBrSiez1DA",
  },
  {
    id: "india-today-tv",
    name: "India Today Live",
    place: "English news · India",
    youtubeChannelId: "UCYPvAwZP8pZhSMW8qs7cVCw",
  },
  {
    id: "dd-news",
    name: "DD News Live",
    place: "Public broadcaster · India",
    youtubeChannelId: "UCeMQiXmFNTtN3IjvHUBKTgg",
  },
];

export function radioEmbedUrl(station: RadioStation) {
  return `https://tunein.com/embed/player/${station.tuneinId}/`;
}

/**
 * Muted + JS API on, so autoplay is allowed and the mini player can control it.
 * A resolved video id is preferred — YouTube's legacy `live_stream?channel=`
 * form often answers "video unavailable" even while the channel is live.
 */
export function tvEmbedUrl(
  channel: TvChannel,
  { muted = true, videoId }: { muted?: boolean; videoId?: string | null } = {},
) {
  const params = new URLSearchParams({
    autoplay: "1",
    mute: muted ? "1" : "0",
    enablejsapi: "1",
    playsinline: "1",
    rel: "0",
  });
  if (videoId) {
    return `https://www.youtube.com/embed/${videoId}?${params.toString()}`;
  }
  params.set("channel", channel.youtubeChannelId);
  return `https://www.youtube.com/embed/live_stream?${params.toString()}`;
}

export function findRadio(id: string) {
  return RADIO_STATIONS.find((station) => station.id === id) ?? null;
}

export function findTv(id: string) {
  return TV_CHANNELS.find((channel) => channel.id === id) ?? null;
}

/** Header, footer and page buttons all speak to the mini player through this event. */
export const LIVE_MEDIA_EVENT = "godesi:live-media";

/**
 * `src`/`name` are carried for member-submitted stations, which live in the
 * database rather than the lists above; built-in ones are found by id.
 */
export type LiveMediaRequest = {
  /** `stream` is a direct audio URL from the open station directory. */
  kind: "radio" | "tv" | "stream";
  id: string;
  name?: string;
  src?: string;
};

export function openLiveMedia(request: LiveMediaRequest) {
  window.dispatchEvent(
    new CustomEvent<LiveMediaRequest>(LIVE_MEDIA_EVENT, { detail: request }),
  );
}
