"use client";

import { useState } from "react";
import Link from "next/link";
import { revealListingContactAction } from "@/app/actions/listings";

type Contact = {
  contactName: string | null;
  contactPhone: string | null;
  contactEmail: string | null;
};

/**
 * Phone and email behind one tap. The values are never part of the page — they
 * are fetched by a server action on reveal, because anything handed to a client
 * component ends up in the delivered HTML where scrapers read it. Guests are
 * asked to join first, and every reveal is counted as a lead.
 */
export function PropertyContact({
  listingId,
  listingSlug,
  hasPhone,
  hasEmail,
  signedIn,
}: {
  listingId: string;
  listingSlug: string;
  hasPhone: boolean;
  hasEmail: boolean;
  signedIn: boolean;
}) {
  const [contact, setContact] = useState<Contact | null>(null);
  const [loading, setLoading] = useState(false);
  if (!hasPhone && !hasEmail) return null;

  if (!signedIn) {
    return (
      <div className="rounded-2xl border border-indigo-200 bg-indigo-50 p-4 text-sm">
        <p className="font-bold text-indigo-900">
          🔐 Phone and email are shown to members
        </p>
        <p className="mt-1 text-indigo-900/80">
          Join free — it takes a minute, and it keeps sellers&apos; numbers away
          from scrapers. You can always message on WhatsApp above.
        </p>
        <Link
          href={`/login?next=/listings/${listingSlug}`}
          className="mt-3 inline-flex rounded-xl bg-indigo-600 px-4 py-2 font-semibold text-white hover:bg-indigo-700"
        >
          Sign in to see contact
        </Link>
      </div>
    );
  }

  if (!contact) {
    return (
      <button
        type="button"
        disabled={loading}
        onClick={async () => {
          setLoading(true);
          const found = await revealListingContactAction(listingId);
          setContact(found);
          setLoading(false);
        }}
        className="w-full rounded-xl border border-indigo-300 bg-white px-4 py-3 text-sm font-semibold text-indigo-700 hover:bg-indigo-50 disabled:opacity-60"
      >
        {loading
          ? "Getting it…"
          : `📞 Show phone${hasPhone && hasEmail ? " and email" : ""}`}
      </button>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm">
      {contact.contactName ? (
        <p className="font-bold">{contact.contactName}</p>
      ) : null}
      {contact.contactPhone ? (
        <p className="mt-1">
          <a
            href={`tel:${contact.contactPhone}`}
            className="font-semibold text-indigo-600"
          >
            📞 {contact.contactPhone}
          </a>
        </p>
      ) : null}
      {contact.contactEmail ? (
        <p className="mt-1">
          <a
            href={`mailto:${contact.contactEmail}`}
            className="font-semibold text-indigo-600"
          >
            ✉️ {contact.contactEmail}
          </a>
        </p>
      ) : null}
      <p className="mt-2 text-xs text-slate-500">
        Say you found them on Godesi. Never pay a deposit before you see the
        property and the papers.
      </p>
    </div>
  );
}
