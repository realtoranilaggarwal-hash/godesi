"use client";

import { CopyButton } from "@/components/CopyButton";

const PATCH_COMPOSE = "https://patch.com/compose/event?from_sfd=true";

function nextdoorHref(body: string) {
  return `https://nextdoor.com/sharekit/?source=godesi&body=${encodeURIComponent(body)}`;
}

/**
 * Ready-made posts for the places GoDesi can't post to itself: the organiser's
 * WhatsApp and Facebook groups, Nextdoor, and Patch's event calendar.
 */
export function EventShareKit({
  url,
  title,
  when,
  where,
  price,
  description,
  imageUrl,
}: {
  url: string;
  title: string;
  when: string;
  where: string;
  price: string;
  description: string;
  imageUrl: string | null;
}) {
  const blurb = description.replace(/\s+/g, " ").trim().slice(0, 280);
  const whatsapp = [
    `🎉 *${title}*`,
    `📅 ${when}`,
    `📍 ${where}`,
    `🎫 ${price}`,
    "",
    `Details & RSVP 👉 ${url}`,
  ].join("\n");
  const facebookGroup = [
    `${title} 🎉`,
    "",
    `📅 ${when}`,
    `📍 ${where}`,
    `🎫 ${price}`,
    "",
    blurb,
    "",
    `All the details and tickets/RSVP here: ${url}`,
    "Tag a friend who should come! 👇",
  ].join("\n");
  const nextdoor = `${title} — ${when} at ${where}. ${price}. Details: ${url}`;
  const patchDescription = `${blurb}\n\n${price}. Details, tickets and RSVP: ${url}`;

  const box =
    "whitespace-pre-wrap rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-700";

  return (
    <div className="space-y-4 text-sm">
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <div className="mb-1 flex items-center justify-between gap-2">
            <p className="font-semibold">💬 WhatsApp groups</p>
            <div className="flex gap-1">
              <CopyButton value={whatsapp} label="Copy" />
              <a
                href={`https://wa.me/?text=${encodeURIComponent(whatsapp)}`}
                target="_blank"
                rel="noreferrer"
                className="rounded-full bg-[#25D366] px-2 py-0.5 text-xs font-semibold text-white"
              >
                Open WhatsApp
              </a>
            </div>
          </div>
          <p className={box}>{whatsapp}</p>
        </div>
        <div>
          <div className="mb-1 flex items-center justify-between gap-2">
            <p className="font-semibold">👥 Facebook groups</p>
            <CopyButton value={facebookGroup} label="Copy post" />
          </div>
          <p className={box}>{facebookGroup}</p>
          <p className="mt-1 text-xs text-slate-500">
            Paste into each desi group you belong to; the link shows the poster
            automatically.
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3">
        <p className="flex-1 font-semibold text-emerald-900">
          🏡 Nextdoor — post it to your neighbourhood
        </p>
        <a
          href={nextdoorHref(nextdoor)}
          target="_blank"
          rel="noreferrer"
          className="rounded-full bg-[#8ED500] px-3 py-1 text-xs font-bold text-slate-900"
        >
          Share on Nextdoor
        </a>
      </div>

      <div className="rounded-xl border border-sky-200 bg-sky-50 p-3">
        <div className="flex flex-wrap items-center gap-2">
          <p className="flex-1 font-semibold text-sky-900">
            📰 Patch.com — list it on your town&apos;s calendar (free)
          </p>
          <a
            href={PATCH_COMPOSE}
            target="_blank"
            rel="noreferrer"
            className="rounded-full bg-sky-600 px-3 py-1 text-xs font-bold text-white"
          >
            Open Patch event form
          </a>
        </div>
        <p className="mt-1 text-xs text-sky-900/80">
          Log in to Patch, then copy each piece into its box:
        </p>
        <ul className="mt-2 space-y-1.5 text-xs">
          {[
            { label: "Event name", value: title },
            { label: "Date & time", value: when },
            { label: "Location", value: where },
            { label: "Description", value: patchDescription },
            ...(imageUrl
              ? [{ label: "Poster image link", value: imageUrl }]
              : []),
          ].map((field) => (
            <li
              key={field.label}
              className="flex items-start justify-between gap-2 rounded-lg bg-white px-2 py-1.5"
            >
              <span className="min-w-0">
                <span className="font-semibold">{field.label}:</span>{" "}
                <span className="line-clamp-2 break-words text-slate-600">
                  {field.value}
                </span>
              </span>
              <CopyButton value={field.value} />
            </li>
          ))}
        </ul>
        <p className="mt-2 text-xs text-sky-900/70">
          Patch wants an image about 1200×900 — save the poster and upload it.
          Posting is free; Patch charges only if you choose to promote it to
          nearby towns.
        </p>
      </div>
    </div>
  );
}
