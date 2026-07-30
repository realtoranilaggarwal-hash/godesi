"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  LIVE_MEDIA_EVENT,
  RADIO_STATIONS,
  TV_CHANNELS,
  findRadio,
  findTv,
  radioEmbedUrl,
  tvEmbedUrl,
  type LiveMediaRequest,
} from "@/lib/liveMedia";

const STORAGE_KEY = "godesi:live-media";

/**
 * Floating mini player. Lives in the root layout, so the stream keeps playing
 * while the visitor browses. Nothing loads until they ask for a station: the
 * iframes are only mounted after a click, and TV always starts muted because
 * browsers block audible autoplay.
 */
export function LiveMediaPlayer() {
  const [request, setRequest] = useState<LiveMediaRequest | null>(null);
  const [playing, setPlaying] = useState(true);
  const [muted, setMuted] = useState(true);
  const [videoId, setVideoId] = useState<string | null>(null);
  const tvFrame = useRef<HTMLIFrameElement | null>(null);
  const audio = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setRequest(JSON.parse(stored) as LiveMediaRequest);
      } catch {
        sessionStorage.removeItem(STORAGE_KEY);
      }
    }

    function onOpen(event: Event) {
      const detail = (event as CustomEvent<LiveMediaRequest>).detail;
      setRequest(detail);
      setPlaying(true);
      setMuted(detail.kind === "tv");
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(detail));
    }

    window.addEventListener(LIVE_MEDIA_EVENT, onOpen);
    return () => window.removeEventListener(LIVE_MEDIA_EVENT, onOpen);
  }, []);

  // The live stream behind a channel changes through the day, so resolve it.
  useEffect(() => {
    if (request?.kind !== "tv" || request.src) {
      setVideoId(null);
      return;
    }
    let active = true;
    setVideoId(null);
    fetch(`/api/live-tv/${request.id}`)
      .then((response) => (response.ok ? response.json() : null))
      .then((data: { videoId?: string | null } | null) => {
        if (active) setVideoId(data?.videoId ?? null);
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, [request]);

  const command = useCallback((func: string, args: unknown[] = []) => {
    tvFrame.current?.contentWindow?.postMessage(
      JSON.stringify({ event: "command", func, args }),
      "https://www.youtube.com",
    );
  }, []);

  if (!request) return null;

  const station = request.kind === "radio" ? findRadio(request.id) : null;
  const channel = request.kind === "tv" ? findTv(request.id) : null;
  const isTv = request.kind === "tv";
  const isStream = request.kind === "stream";
  const title = request.name ?? station?.name ?? channel?.name;
  const src =
    request.src ??
    (station
      ? radioEmbedUrl(station)
      : channel
        ? tvEmbedUrl(channel, { muted: true, videoId })
        : null);
  if (!src || !title) return null;

  function close() {
    setRequest(null);
    sessionStorage.removeItem(STORAGE_KEY);
  }

  function togglePlay() {
    if (isTv) command(playing ? "pauseVideo" : "playVideo");
    if (isStream) {
      const element = audio.current;
      if (element) {
        if (playing) element.pause();
        else void element.play();
      }
    }
    // Radio embeds are cross-origin, so stopping means unmounting the iframe.
    setPlaying((current) => !current);
  }

  function toggleMute() {
    if (isTv) command(muted ? "unMute" : "mute");
    if (isStream && audio.current) audio.current.muted = !muted;
    setMuted((current) => !current);
  }

  const options = isTv ? TV_CHANNELS : RADIO_STATIONS;
  const inOptions = options.some((option) => option.id === request.id);

  return (
    <div className="fixed bottom-32 right-3 z-40 w-[19rem] max-w-[calc(100vw-1.5rem)] overflow-hidden rounded-2xl border border-slate-300 bg-white shadow-2xl sm:bottom-16">
      <div className="flex items-center justify-between gap-2 bg-slate-900 px-3 py-2 text-white">
        <p className="truncate text-xs font-bold">
          {isTv ? "📺 " : "🎧 "}
          {title}
        </p>
        <button
          type="button"
          onClick={close}
          aria-label="Close player"
          className="rounded px-1 text-sm text-slate-300 hover:text-white"
        >
          ✕
        </button>
      </div>

      {isStream ? (
        // A direct stream is audio only, so the browser's own player is enough.
        <audio
          ref={audio}
          src={src}
          autoPlay
          controls
          className="w-full px-2 py-2"
        />
      ) : playing ? (
        isTv ? (
          <iframe
            ref={tvFrame}
            title={`${title} live TV`}
            src={src}
            loading="lazy"
            allow="autoplay; encrypted-media; picture-in-picture"
            allowFullScreen
            className="aspect-video w-full border-0"
          />
        ) : (
          <iframe
            title={`${title} live radio`}
            src={src}
            loading="lazy"
            scrolling="no"
            className="h-[100px] w-full border-0"
          />
        )
      ) : (
        <p className="px-3 py-6 text-center text-xs text-slate-500">Paused</p>
      )}

      <div className="flex items-center gap-2 border-t border-slate-200 p-2">
        <button
          type="button"
          onClick={togglePlay}
          className="rounded-lg bg-slate-900 px-2.5 py-1.5 text-xs font-bold text-white"
        >
          {playing ? "⏸ Pause" : "▶ Play"}
        </button>
        {isTv || isStream ? (
          <button
            type="button"
            onClick={toggleMute}
            className="rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs font-bold text-slate-700"
          >
            {muted ? "🔇 Unmute" : "🔊 Mute"}
          </button>
        ) : null}
        <select
          aria-label="Choose a station"
          value={inOptions ? request.id : ""}
          onChange={(event) => {
            if (!event.target.value) return;
            const next: LiveMediaRequest = {
              kind: isTv ? "tv" : "radio",
              id: event.target.value,
            };
            setRequest(next);
            setPlaying(true);
            sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next));
          }}
          className="min-w-0 flex-1 rounded-lg border border-slate-300 px-2 py-1.5 text-xs"
        >
          {inOptions ? null : <option value="">{title}</option>}
          {options.map((option) => (
            <option key={option.id} value={option.id}>
              {option.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
