"use client";

import { useEffect, useState } from "react";
import { inputClass } from "@/components/ui";
import { ImageField } from "@/components/forms/ImageField";
import type { ProfileMatch } from "@/lib/peopleLookup";

const INVITE_PATH = "/claim";

/**
 * One speaker on the event form. As the organiser types a name we look for
 * an existing godesi.com profile: pick one and the event links to that
 * person; find none and they get a link to invite the speaker to make one.
 */
export function SpeakerRow({
  defaultName = "",
  defaultBio = "",
  defaultPhotoUrl = "",
  defaultUserId = "",
  onRemove,
}: {
  defaultName?: string;
  defaultBio?: string;
  defaultPhotoUrl?: string;
  defaultUserId?: string;
  onRemove?: () => void;
}) {
  const [name, setName] = useState(defaultName);
  const [matches, setMatches] = useState<ProfileMatch[]>([]);
  const [picked, setPicked] = useState<ProfileMatch | null>(null);
  const [userId, setUserId] = useState(defaultUserId);
  const [searched, setSearched] = useState(false);
  const [copied, setCopied] = useState(false);

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
    setUserId(match.id);
    setName(match.name);
    setMatches([]);
  };

  const unlink = () => {
    setPicked(null);
    setUserId("");
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
      <div className="flex gap-2">
        <input
          name="speakerName"
          value={name}
          onChange={(event) => {
            setName(event.target.value);
            if (picked) unlink();
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

      {picked ? (
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
      ) : searched ? (
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
          picked ? "Photo (optional — their profile photo is used)" : "Photo"
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
