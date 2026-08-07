"use client";

import { useEffect, useRef, useState } from "react";
import { useFormState } from "react-dom";
import { submitReportAction } from "@/app/actions/reports";
import { emptyState } from "@/lib/actions";
import {
  FAKE_MEDIA_CHECKS,
  REPORT_DECLARATIONS,
  REPORT_SOURCES,
  REVERSE_IMAGE_SEARCH_URL,
} from "@/lib/journalists";
import { REPORT_TOPIC_OPTIONS } from "@/lib/newsTopics";
import { Field, inputClass } from "@/components/ui";
import { SubmitButton } from "@/components/SubmitButton";
import { ImageDropzone } from "@/components/ImageDropzone";
import { FormError } from "@/components/forms/FormError";
import { FormSuccess } from "@/components/forms/FormSuccess";

/** `datetime-local` wants the local clock, not the UTC ISO string. */
function localNow() {
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  return now.toISOString().slice(0, 16);
}

export function ReportForm({
  defaultCity = "",
  defaultCountry = "",
}: {
  defaultCity?: string;
  defaultCountry?: string;
}) {
  const [state, formAction] = useFormState(submitReportAction, emptyState);
  const form = useRef<HTMLFormElement>(null);
  const [photos, setPhotos] = useState<string[]>([]);
  const [locating, setLocating] = useState(false);
  const [locationNote, setLocationNote] = useState("");

  useEffect(() => {
    if (state.success) {
      form.current?.reset();
      setPhotos([]);
    }
  }, [state.success]);

  const detect = () => {
    if (!("geolocation" in navigator)) {
      setLocationNote("Your browser cannot share a location — type the city.");
      return;
    }
    setLocating(true);
    setLocationNote("");
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const res = await fetch(
            `/api/place?lat=${position.coords.latitude}&lng=${position.coords.longitude}`,
          );
          const place = (await res.json()) as {
            city?: string;
            state?: string;
            country?: string;
          };
          const current = form.current;
          if (current && place.city) {
            (current.elements.namedItem("city") as HTMLInputElement).value =
              place.city;
            (current.elements.namedItem("state") as HTMLInputElement).value =
              place.state ?? "";
            (current.elements.namedItem("country") as HTMLInputElement).value =
              place.country ?? "";
            setLocationNote(`Detected ${place.city}. Correct it if it is wrong.`);
          } else {
            setLocationNote("We could not name that spot — type the city.");
          }
        } catch {
          setLocationNote("Location lookup failed — type the city.");
        }
        setLocating(false);
      },
      () => {
        setLocating(false);
        setLocationNote("Location was blocked — type the city instead.");
      },
    );
  };

  return (
    <form ref={form} action={formAction} className="space-y-4">
      <FormError>{state.error}</FormError>

      <Field label="Title" hint="What happened, in one line">
        <input
          name="title"
          required
          maxLength={140}
          placeholder="Free health camp at the Gurdwara this Sunday"
          className={inputClass}
        />
      </Field>

      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Topic" hint="Readers filter the news page by this">
          <select name="topic" required defaultValue="community" className={inputClass}>
            {REPORT_TOPIC_OPTIONS.map((option) => (
              <option key={option.slug} value={option.slug}>
                {option.emoji} {option.label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Date & time it happened">
          <input
            name="happenedAt"
            type="datetime-local"
            required
            defaultValue={localNow()}
            className={inputClass}
          />
        </Field>
      </div>

      <div className="rounded-2xl border border-slate-200 p-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm font-semibold text-slate-700">Location</p>
          <button
            type="button"
            onClick={detect}
            disabled={locating}
            className="rounded-xl border border-slate-300 px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
          >
            {locating ? "Locating…" : "📍 Use my location"}
          </button>
        </div>
        <div className="mt-2 grid gap-3 sm:grid-cols-3">
          <Field label="City">
            <input
              name="city"
              required
              defaultValue={defaultCity}
              className={inputClass}
            />
          </Field>
          <Field label="State / region">
            <input name="state" className={inputClass} />
          </Field>
          <Field label="Country">
            <input
              name="country"
              defaultValue={defaultCountry}
              className={inputClass}
            />
          </Field>
        </div>
        {locationNote ? (
          <p className="mt-1 text-xs text-slate-500">{locationNote}</p>
        ) : null}
      </div>

      <Field label="What happened" hint="Who, what, where, when — plain facts">
        <textarea name="summary" rows={5} required className={inputClass} />
      </Field>

      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Where did you see this?">
          <select name="sourceType" required className={inputClass}>
            {REPORT_SOURCES.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Source link" hint="Optional — where you first saw it">
          <input name="sourceUrl" type="url" className={inputClass} />
        </Field>
      </div>

      <div className="rounded-2xl border border-slate-200 p-3">
        <p className="text-sm font-semibold text-slate-700">Photos</p>
        <p className="text-xs text-slate-500">
          Up to 8 pictures you took yourself. We resize them automatically.
        </p>
        <div className="mt-2">
          <ImageDropzone
            purpose="event"
            multiple
            label="Drag & drop photos here, or click to choose"
            onUploaded={(url) =>
              setPhotos((current) =>
                current.length >= 8 ? current : [...current, url],
              )
            }
          />
        </div>
        {photos.length ? (
          <ul className="mt-2 flex flex-wrap gap-2">
            {photos.map((url) => (
              <li key={url} className="relative">
                <input type="hidden" name="photoUrls" value={url} />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={url}
                  alt=""
                  className="h-16 w-16 rounded-xl object-cover"
                />
                <button
                  type="button"
                  onClick={() =>
                    setPhotos((current) =>
                      current.filter((item) => item !== url),
                    )
                  }
                  aria-label="Remove photo"
                  className="absolute -right-1 -top-1 h-5 w-5 rounded-full bg-slate-900/80 text-xs font-bold text-white"
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      <Field
        label="Video or social post link"
        hint="YouTube, Instagram, Facebook or X — it plays inside the story"
      >
        <input name="videoUrl" type="url" className={inputClass} />
      </Field>

      <div className="rounded-2xl bg-amber-50 p-3">
        <p className="text-sm font-bold text-amber-900">
          Check before posting 🔍
        </p>
        <ul className="mt-2 space-y-1 text-xs text-amber-900">
          {FAKE_MEDIA_CHECKS.map((check) => (
            <li key={check} className="flex gap-2">
              <span aria-hidden>•</span>
              <span>{check}</span>
            </li>
          ))}
        </ul>
        <a
          href={REVERSE_IMAGE_SEARCH_URL}
          target="_blank"
          rel="noreferrer"
          className="mt-2 inline-block text-xs font-bold text-amber-900 underline"
        >
          Run a reverse image search →
        </a>
      </div>

      <fieldset className="rounded-2xl border border-slate-200 p-3">
        <legend className="px-1 text-sm font-semibold text-slate-700">
          Your declaration
        </legend>
        <div className="space-y-2">
          {REPORT_DECLARATIONS.map((item) => (
            <label
              key={item.name}
              className="flex items-start gap-2 text-sm text-slate-700"
            >
              <input
                type="checkbox"
                name={item.name}
                required
                className="mt-0.5 h-4 w-4"
              />
              <span>{item.label}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <FormSuccess>{state.success}</FormSuccess>
      <SubmitButton pendingLabel="Sending to the news desk…">
        Submit report
      </SubmitButton>
      <p className="text-xs text-slate-500">
        Every report is read by the Godesi news desk before it appears. Readers
        can then confirm it, doubt it or flag it as fake — that record follows
        your journalist profile.
      </p>
    </form>
  );
}
