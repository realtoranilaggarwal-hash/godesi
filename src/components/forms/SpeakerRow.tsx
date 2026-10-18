"use client";

import { useEffect, useState } from "react";
import { inputClass } from "@/components/ui";
import { ImageField } from "@/components/forms/ImageField";
import type { ProfileMatch } from "@/lib/peopleLookup";
import type { FamousMatch } from "@/lib/famousPeople";

const INVITE_PATH = "/claim";

/**
 * One speaker on the event form. As the organiser types a name we look for
 * an existing godesi.com profile: pick one and the event links to that
 * person; find none and they get a link to invite the speaker to make one.
 * Well-known people are suggested from Wikipedia too: picking one links the
 * speaker to their GoDesi Elite profile, made on save if they have none yet.
 */
export function SpeakerRow({
  defaultName = "",
  defaultBio = "",
  defaultPhotoUrl = "",
  defaultUserId = "",
  defaultProfile = null,
  defaultEliteEntryId = "",
  onRemove,
}: {
  defaultName?: string;
  defaultBio?: string;
  defaultPhotoUrl?: string;
  defaultUserId?: string;
  /** The GoDesi profile an existing speaker is already linked to. */
  defaultProfile?: ProfileMatch | null;
  /** The Elite profile an existing speaker is already linked to. */
  defaultEliteEntryId?: string;
  onRemove?: () => void;
}) {
  const [name, setName] = useState(defaultName);
  const [matches, setMatches] = useState<ProfileMatch[]>([]);
  const [picked, setPicked] = useState<ProfileMatch | null>(defaultProfile);
  const [userId, setUserId] = useState(defaultProfile?.id ?? defaultUserId);
  const [eliteId, setEliteId] = useState(defaultEliteEntryId);
  const [searched, setSearched] = useState(false);
  const [copied, setCopied] = useState(false);
  const [famous, setFamous] = useState<FamousMatch[]>([]);
  const [pickedFamous, setPickedFamous] = useState<FamousMatch | null>(null);

  useEffect(() => {
    if (picked || pickedFamous) return;
    const query = name.trim();
    if (query.replace(/\s/g, "").length < 4) {
      setFamous([]);
      return;
    }
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const response = await fetch(
          `/api/people/famous?q=${encodeURIComponent(query)}`,
          { signal: controller.signal },
        );
        if (!response.ok) return;
        const data = (await response.json()) as { famous: FamousMatch[] };
        setFamous(data.famous);
      } catch {
        /* typing on, or offline — nothing to show */
      }
    }, 500);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [name, picked, pickedFamous]);

  useEffect(() => {
    if (picked) return;
    const query = name.trim();
    if (query.length < 3) {
      setMatches([]);
      setSearched(false);
      return;
    }
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const response = await fetch(
          `/api/people?q=${encodeURIComponent(query)}`,
          { signal: controller.signal },
        );
        if (!response.ok) return;
        const data = (await response.json()) as { matches: ProfileMatch[] };
        setMatches(data.matches);
        setSearched(true);
      } catch {
        /* typing on, or offline — nothing to show */
      }
    }, 350);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [name, picked]);

  const choose = (match: ProfileMatch) => {
    setPicked(match);
    setPickedFamous(null);
    setUserId(match.id);
    setEliteId("");
    setName(match.name);
    setMatches([]);
    setFamous([]);
  };

  const chooseFamous = (match: FamousMatch) => {
    setPickedFamous(match);
    setPicked(null);
    setUserId("");
    setEliteId("");
    setName(match.name);
    setMatches([]);
    setFamous([]);
  };

  const unlink = () => {
    setPicked(null);
    setPickedFamous(null);
    setUserId("");
    setEliteId("");
  };

  const copyInvite = async () => {
    const url = `${window.location.origin}${INVITE_PATH}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt("Copy this link to send to your speaker", url);
    }
  };

  return (
    <div className="grid gap-2 rounded-xl bg-slate-50 p-3">
      <input type="hidden" name="speakerUser" value={userId} />
      <input type="hidden" name="speakerElite" value={eliteId} />
      <input
        type="hidden"
        name="speakerWiki"
        value={pickedFamous?.title ?? ""}
      />
      <div className="flex gap-2">
        <input
          name="speakerName"
          value={name}
          onChange={(event) => {
            setName(event.target.value);
            if (picked || pickedFamous || eliteId) unlink();
          }}
          placeholder="Name — e.g. Dr. Meera Iyer"
          className={inputClass}
          aria-label="Speaker name"
          autoComplete="off"
        />
        {onRemove ? (
          <button
            type="button"
            onClick={onRemove}
            className="shrink-0 text-sm font-semibold text-slate-500 hover:text-red-600"
            aria-label="Remove speaker"
          >
            ✕
          </button>
        ) : null}
      </div>

      {pickedFamous ? (
        <div className="flex items-center gap-3 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-sm">
          <FamousAvatar match={pickedFamous} />
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-amber-900">
              ⭐{" "}
              {pickedFamous.eliteSlug
                ? "Linked to their GoDesi Elite profile"
                : "Gets a GoDesi Elite profile when you save"}
            </p>
            <a
              href={
                pickedFamous.eliteSlug
                  ? `/desi-elite/${pickedFamous.eliteSlug}`
                  : pickedFamous.wikiUrl
              }
              target="_blank"
              rel="noreferrer"
              className="block truncate text-amber-800 underline"
            >
              {pickedFamous.eliteSlug
                ? `godesi.com/desi-elite/${pickedFamous.eliteSlug}`
                : (pickedFamous.description ?? "Wikipedia")}
            </a>
          </div>
          <button
            type="button"
            onClick={unlink}
            className="text-xs font-semibold text-slate-500 hover:underline"
          >
            Unlink
          </button>
        </div>
      ) : null}

      {!picked && !pickedFamous && famous.length ? (
        <div className="rounded-lg border border-amber-300 bg-white p-2 text-sm">
          <p className="px-1 pb-1 text-xs font-bold uppercase tracking-wide text-amber-700">
            ⭐ Well-known person? Pick them for a GoDesi Elite profile
          </p>
          <ul className="divide-y divide-slate-100">
            {famous.map((match) => (
              <li
                key={match.title}
                className="flex items-center gap-3 px-1 py-1.5"
              >
                <FamousAvatar match={match} />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-slate-900">
                    {match.name}
                  </p>
                  <p className="truncate text-xs text-slate-500">
                    {match.description ?? "On Wikipedia"}
                    {match.eliteSlug ? " · already in Elite" : ""}
                  </p>
                </div>
                <a
                  href={match.wikiUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs font-semibold text-slate-500 hover:underline"
                >
                  Wikipedia
                </a>
                <button
                  type="button"
                  onClick={() => chooseFamous(match)}
                  className="rounded-full bg-amber-500 px-3 py-1 text-xs font-bold text-white hover:bg-amber-600"
                >
                  Pick
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {pickedFamous ? null : picked ? (
        <div className="flex items-center gap-3 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm">
          <Avatar match={picked} />
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-emerald-900">
              ✓ Linked to their GoDesi profile
            </p>
            <a
              href={`/${picked.username}`}
              target="_blank"
              rel="noreferrer"
              className="truncate text-emerald-800 underline"
            >
              godesi.com/{picked.username}
            </a>
          </div>
          <button
            type="button"
            onClick={unlink}
            className="text-xs font-semibold text-slate-500 hover:underline"
          >
            Unlink
          </button>
        </div>
      ) : matches.length ? (
        <div className="rounded-lg border border-indigo-200 bg-white p-2 text-sm">
          <p className="px-1 pb-1 text-xs font-bold uppercase tracking-wide text-indigo-700">
            Already on GoDesi? Pick their profile
          </p>
          <ul className="divide-y divide-slate-100">
            {matches.map((match) => (
              <li
                key={match.id}
                className="flex items-center gap-3 px-1 py-1.5"
              >
                <Avatar match={match} />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-slate-900">
                    {match.name}
                  </p>
                  <p className="truncate text-xs text-slate-500">
                    {[match.headline, match.location]
                      .filter(Boolean)
                      .join(" · ") || `godesi.com/${match.username}`}
                  </p>
                </div>
                <a
                  href={`/${match.username}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs font-semibold text-slate-500 hover:underline"
                >
                  View
                </a>
                <button
                  type="button"
                  onClick={() => choose(match)}
                  className="rounded-full bg-indigo-600 px-3 py-1 text-xs font-bold text-white hover:bg-indigo-700"
                >
                  Use this profile
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : searched && !famous.length ? (
        <p className="text-xs text-slate-600">
          No GoDesi profile found for “{name.trim()}”.{" "}
          <button
            type="button"
            onClick={copyInvite}
            className="font-semibold text-indigo-600 hover:underline"
          >
            {copied ? "Invite link copied ✓" : "Copy a link to invite them"}
          </button>{" "}
          to create their free profile at godesi.com/their-name — the event
          links to it once they do.
        </p>
      ) : null}

      <textarea
        name="speakerBio"
        rows={2}
        defaultValue={defaultBio}
        placeholder="Short bio — role, company, what they will talk about"
        className={inputClass}
        aria-label="Speaker bio"
      />
      <ImageField
        name="speakerPhoto"
        label={
          picked
            ? "Photo (optional — their profile photo is used)"
            : pickedFamous
              ? "Photo (optional — their Elite photo is used)"
              : "Photo"
        }
        purpose="avatar"
        defaultValue={defaultPhotoUrl}
        previewClassName="h-16 w-16 rounded-full object-cover"
      />
    </div>
  );
}

function Avatar({ match }: { match: ProfileMatch }) {
  return match.avatarUrl ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={match.avatarUrl}
      alt=""
      className="h-9 w-9 shrink-0 rounded-full object-cover"
    />
  ) : (
    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-fuchsia-600 text-sm font-black text-white">
      {match.name.slice(0, 1).toUpperCase()}
    </div>
  );
}

function FamousAvatar({ match }: { match: FamousMatch }) {
  return match.thumbUrl ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={match.thumbUrl}
      alt=""
      className="h-9 w-9 shrink-0 rounded-full object-cover"
    />
  ) : (
    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-rose-500 text-sm font-black text-white">
      {match.name.slice(0, 1).toUpperCase()}
    </div>
  );
}
