/**
 * Live radio and TV are link-only: the broadcaster's own public stream or a
 * TuneIn/YouTube embed. Godesi never hosts or re-streams anything, so adding a
 * station is just a matter of adding its official stream URL or embed id here.
 */
export type RadioStation = {
  id: string;
  name: string;
  place: string;
  /** Broadcaster's own public stream, played directly in Godesi's player. */
  streamUrl?: string;
  /** TuneIn guide id, e.g. s183986 → tunein.com/embed/player/s183986/ */
  tuneinId?: string;
};

export type TvChannel = {
  id: string;
  name: string;
  place: string;
  /** Groups the TV grid so the same language sits together. */
  language: string;
  /** YouTube channel id — the official live_stream embed always plays the current live show. */
  youtubeChannelId: string;
};

export const RADIO_STATIONS: RadioStation[] = [
  {
    id: "mirchi-top-20",
    name: "Mirchi Top 20",
    place: "Bollywood hits · India",
    streamUrl: "https://drive.uber.radio/uber/bollywoodnow/icecast.audio",
  },
  {
    id: "bollywood-2010s",
    name: "Bollywood 2010s",
    place: "Hindi film hits · India",
    streamUrl: "https://drive.uber.radio/uber/bollywood2010s/icecast.audio",
  },
  {
    id: "radio-nyra",
    name: "Radio Nyra — Bollywood",
    place: "New York, USA",
    streamUrl: "https://streams.radio.co/s8d06d0298/listen",
  },
  {
    id: "radio-zindagi",
    name: "Radio Zindagi 87.7 FM",
    place: "California, USA",
    streamUrl: "https://18093.live.streamtheworld.com/SP_R4994213_SC",
  },
  {
    id: "mixify-hindi-hits",
    name: "Mixify Hindi Hits",
    place: "Hindi hits · worldwide",
    streamUrl: "https://server.mixify.in/listen/new_hits/radio.mp3",
  },
  {
    id: "radio-dil",
    name: "Radio Dil",
    place: "Desi hits · worldwide",
    streamUrl: "https://us3.streamingpulse.com/ssl/radiodil2",
  },
  {
    id: "suburbs-of-goa",
    name: "SomaFM Suburbs of Goa",
    place: "Desi-influenced downtempo · USA",
    streamUrl: "https://ice4.somafm.com/suburbsofgoa-128-aac",
  },
  {
    id: "intamixx",
    name: "Intamixx Desi Radio",
    place: "British Asian · UK",
    streamUrl: "https://intamixx.no-ip.com:8002/;",
  },
  {
    id: "sunrise-radio-uk",
    name: "Sunrise Radio",
    place: "South Asian · London, UK",
    streamUrl: "https://stream1.themediasite.co.uk/8070/stream",
  },
  {
    id: "sher-e-punjab",
    name: "Sher-E-Punjab AM 600",
    place: "Punjabi · Vancouver, Canada",
    streamUrl: "https://ais-sa1.streamon.fm/7676_48k.aac",
  },
  {
    id: "sgpc-gurbani",
    name: "Live Gurbani — Sri Darbar Sahib",
    place: "Kirtan from Amritsar · SGPC",
    streamUrl: "https://live.sgpc.net:8443/;stream.mp3",
  },
  {
    id: "american-tamil-radio",
    name: "American Tamil Radio",
    place: "Tamil · USA",
    streamUrl: "https://cp11.serverse.com/proxy/hgsmgluv?mp=/stream",
  },
  {
    id: "tamil-80s",
    name: "Tamil 80s Radio",
    place: "Tamil golden hits · India",
    streamUrl: "https://psrlive2.listenon.in/80?station=tamil80shitsradio",
  },
  {
    id: "ar-rahman-radio",
    name: "A. R. Rahman Radio",
    place: "Tamil · India",
    streamUrl: "https://psrlive2.listenon.in/arr?ah=0e81749e37789e5fb8c290926ce87e3f",
  },
  {
    id: "ilayaraja-radio",
    name: "Ilayaraja Super Beats",
    place: "Tamil · India",
    streamUrl: "https://psrlive2.listenon.in/irbeat?ah=0e81749e37789e5fb8c290926ce87e3f",
  },
  {
    id: "tamil-panpalai",
    name: "Tamil Panpalai Gold",
    place: "Tamil · India",
    streamUrl: "https://tamilpanpalai.radioca.st/ind",
  },
  {
    id: "jei-fm",
    name: "Jei FM Tamil Radio",
    place: "Tamil · Klang, Malaysia",
    streamUrl: "https://usa3.fastcast4u.com/proxy/jeifm?mp=/1",
  },
  {
    id: "digital-malayali",
    name: "Radio Digital Malayali",
    place: "Malayalam · Kerala",
    streamUrl: "https://radio.digitalmalayali.in/listen/stream/radio.mp3",
  },
  {
    id: "ahalia-fm",
    name: "Ahalia FM",
    place: "Malayalam · Kerala",
    streamUrl: "https://cast1.my-control-panel.com/proxy/ahaliafm/stream",
  },
  {
    id: "kancheeravam",
    name: "Kancheeravam Radio",
    place: "Malayalam · India",
    streamUrl: "https://radiosavre.com:8020/radio.mp3",
  },
  {
    id: "mellow-bangla",
    name: "Mellow Bangla",
    place: "Bengali · Bangladesh",
    streamUrl: "https://radio.mellowbangla.com/stream",
  },
  {
    id: "vahon-fm",
    name: "Vahon Hindustani Radio",
    place: "Hindustani · Netherlands",
    streamUrl: "https://onlineradio.websoftitnepal.com/8030/stream",
  },
  {
    id: "radio-hulchul",
    name: "Radio Hulchul",
    place: "Hindustani · Netherlands",
    streamUrl: "https://everestcast.live-streams.nl:18015/stream",
  },
  {
    id: "radio-sangam",
    name: "Radio Sangam",
    place: "Hindustani · Netherlands",
    streamUrl: "https://mediaserv68.live-streams.nl:8067/stream",
  },
  {
    id: "kantipur-fm",
    name: "Kantipur FM",
    place: "Nepali · Kathmandu",
    streamUrl: "https://radio-broadcast.ekantipur.com/stream",
  },
  {
    id: "radio-himalaya",
    name: "Radio Himalaya",
    place: "Nepali · Nepal",
    streamUrl: "https://live.itech.host/himalayaradio",
  },
];

export const TV_CHANNELS: TvChannel[] = [
  {
    id: "ndtv",
    language: "English",
    name: "NDTV Live",
    place: "English news · India",
    youtubeChannelId: "UCZFMm1mMw0F81Z37aaEzTUA",
  },
  {
    id: "aaj-tak",
    language: "Hindi",
    name: "Aaj Tak Live",
    place: "Hindi news · India",
    youtubeChannelId: "UCt4t-jeY85JegMlZ-E5UWtA",
  },
  {
    id: "abp-news",
    language: "Hindi",
    name: "ABP News Live",
    place: "Hindi news · India",
    youtubeChannelId: "UCRWFSbif-RFENbBrSiez1DA",
  },
  {
    id: "india-today-tv",
    language: "English",
    name: "India Today Live",
    place: "English news · India",
    youtubeChannelId: "UCYPvAwZP8pZhSMW8qs7cVCw",
  },
  {
    id: "dd-news",
    language: "Hindi",
    name: "DD News Live",
    place: "Public broadcaster · India",
    youtubeChannelId: "UCeMQiXmFNTtN3IjvHUBKTgg",
  },
  {
    id: "ndtv-india",
    language: "Hindi",
    name: "NDTV India Live",
    place: "Hindi news · India",
    youtubeChannelId: "UC9CYT9gSNLevX5ey2_6CK0Q",
  },
  {
    id: "zee-news",
    language: "Hindi",
    name: "Zee News Live",
    place: "Hindi news · India",
    youtubeChannelId: "UCIvaYmXn910QMdemBG3v1pQ",
  },
  {
    id: "news18-india",
    language: "Hindi",
    name: "News18 India Live",
    place: "Hindi news · India",
    youtubeChannelId: "UCPP3etACgdUWvizcES1dJ8Q",
  },
  {
    id: "india-tv",
    language: "Hindi",
    name: "India TV Live",
    place: "Hindi news · India",
    youtubeChannelId: "UCttspZesZIDEwwpVIgoZtWQ",
  },
  {
    id: "tv9-bharatvarsh",
    language: "Hindi",
    name: "TV9 Bharatvarsh Live",
    place: "Hindi news · India",
    youtubeChannelId: "UCOutOIcn_oho8pyVN3Ng-Pg",
  },
  {
    id: "times-now",
    language: "English",
    name: "Times Now Live",
    place: "English news · India",
    youtubeChannelId: "UC_51NqeUwENzkezNGYlqiog",
  },
  {
    id: "wion",
    language: "English",
    name: "WION Live",
    place: "World news · India",
    youtubeChannelId: "UCWEIPvoxRwn6llPOIn555rQ",
  },
  {
    id: "dd-india",
    language: "English",
    name: "DD India Live",
    place: "Public broadcaster · global",
    youtubeChannelId: "UCGDQNvybfDDeGTf4GtigXaw",
  },
  {
    id: "abp-majha",
    language: "Marathi",
    name: "ABP Majha Live",
    place: "Marathi news · India",
    youtubeChannelId: "UCH7nv1A9xIrAifZJNvt7cgA",
  },
  {
    id: "asianet-news",
    language: "Malayalam",
    name: "Asianet News Live",
    place: "Malayalam news · Kerala",
    youtubeChannelId: "UCf8w5m0YsRa8MHQ5bwSGmbw",
  },
  {
    id: "manorama-news",
    language: "Malayalam",
    name: "Manorama News Live",
    place: "Malayalam news · Kerala",
    youtubeChannelId: "UCP0uG-mcMImgKnJz-VjJZmQ",
  },
  {
    id: "public-tv",
    language: "Kannada",
    name: "Public TV Live",
    place: "Kannada news · Karnataka",
    youtubeChannelId: "UCl-OodciBGZ0k8K8rBZGe4w",
  },
  {
    id: "puthiya-thalaimurai",
    language: "Tamil",
    name: "Puthiya Thalaimurai Live",
    place: "Tamil news · Tamil Nadu",
    youtubeChannelId: "UCmyKnNRH0wH-r8I-ceP-dsg",
  },
];

/** Direct stream where the broadcaster publishes one, TuneIn embed otherwise. */
export function radioEmbedUrl(station: RadioStation) {
  return (
    station.streamUrl ??
    `https://tunein.com/embed/player/${station.tuneinId}/`
  );
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
