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
  {
    id: "bollywood-radio-beyond",
    name: "Bollywood Radio and Beyond",
    place: "Hindi film hits · worldwide",
    tuneinId: "s152860",
  },
  {
    id: "radio-retro-bollywood",
    name: "Radio Retro Bollywood",
    place: "Golden oldies · India",
    tuneinId: "s297733",
  },
  {
    id: "hindi-tarang",
    name: "Hindi Tarang",
    place: "Hindi filmy songs · worldwide",
    tuneinId: "s353190",
  },
  {
    id: "mixify-hindi-hits",
    name: "Mixify Hindi Hits",
    place: "Hindi hits · worldwide",
    tuneinId: "s343409",
  },
  {
    id: "punjabi-radio-usa",
    name: "Punjabi Radio USA",
    place: "Punjabi · California, USA",
    tuneinId: "s131856",
  },
  {
    id: "apna-punjab",
    name: "Apna Punjab",
    place: "Punjabi community radio",
    tuneinId: "s358912",
  },
  {
    id: "xl-gurbani-radio",
    name: "XL Gurbani Radio",
    place: "Gurbani kirtan · worldwide",
    tuneinId: "s119677",
  },
  {
    id: "radio-spice",
    name: "Radio Spice — Gurbani",
    place: "Shabad kirtan · UK",
    tuneinId: "s135826",
  },
  {
    id: "american-tamil-radio",
    name: "American Tamil Radio",
    place: "Tamil · USA",
    tuneinId: "s278081",
  },
  {
    id: "rasa-fm",
    name: "RASA FM",
    place: "Tamil · worldwide",
    tuneinId: "s210459",
  },
  {
    id: "sunrise-radio-uk",
    name: "Sunrise Radio",
    place: "South Asian · London, UK",
    tuneinId: "s6886",
  },
  {
    id: "sunrise-fm-nl",
    name: "Sunrise FM",
    place: "Hindustani · Netherlands",
    tuneinId: "s108752",
  },
  {
    id: "radio-humsafar",
    name: "Radio Humsafar",
    place: "South Asian · 24/7",
    tuneinId: "s149036",
  },
  {
    id: "radio-dil",
    name: "Radio Dil",
    place: "Desi hits · worldwide",
    tuneinId: "s129167",
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
  {
    id: "ndtv-india",
    name: "NDTV India Live",
    place: "Hindi news · India",
    youtubeChannelId: "UC9CYT9gSNLevX5ey2_6CK0Q",
  },
  {
    id: "zee-news",
    name: "Zee News Live",
    place: "Hindi news · India",
    youtubeChannelId: "UCIvaYmXn910QMdemBG3v1pQ",
  },
  {
    id: "news18-india",
    name: "News18 India Live",
    place: "Hindi news · India",
    youtubeChannelId: "UCPP3etACgdUWvizcES1dJ8Q",
  },
  {
    id: "india-tv",
    name: "India TV Live",
    place: "Hindi news · India",
    youtubeChannelId: "UCttspZesZIDEwwpVIgoZtWQ",
  },
  {
    id: "tv9-bharatvarsh",
    name: "TV9 Bharatvarsh Live",
    place: "Hindi news · India",
    youtubeChannelId: "UCOutOIcn_oho8pyVN3Ng-Pg",
  },
  {
    id: "times-now",
    name: "Times Now Live",
    place: "English news · India",
    youtubeChannelId: "UC_51NqeUwENzkezNGYlqiog",
  },
  {
    id: "wion",
    name: "WION Live",
    place: "World news · India",
    youtubeChannelId: "UCWEIPvoxRwn6llPOIn555rQ",
  },
  {
    id: "dd-india",
    name: "DD India Live",
    place: "Public broadcaster · global",
    youtubeChannelId: "UCGDQNvybfDDeGTf4GtigXaw",
  },
  {
    id: "abp-majha",
    name: "ABP Majha Live",
    place: "Marathi news · India",
    youtubeChannelId: "UCH7nv1A9xIrAifZJNvt7cgA",
  },
  {
    id: "asianet-news",
    name: "Asianet News Live",
    place: "Malayalam news · Kerala",
    youtubeChannelId: "UCf8w5m0YsRa8MHQ5bwSGmbw",
  },
  {
    id: "manorama-news",
    name: "Manorama News Live",
    place: "Malayalam news · Kerala",
    youtubeChannelId: "UCP0uG-mcMImgKnJz-VjJZmQ",
  },
  {
    id: "public-tv",
    name: "Public TV Live",
    place: "Kannada news · Karnataka",
    youtubeChannelId: "UCl-OodciBGZ0k8K8rBZGe4w",
  },
  {
    id: "puthiya-thalaimurai",
    name: "Puthiya Thalaimurai Live",
    place: "Tamil news · Tamil Nadu",
    youtubeChannelId: "UCmyKnNRH0wH-r8I-ceP-dsg",
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
