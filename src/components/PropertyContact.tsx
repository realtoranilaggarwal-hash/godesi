"use client";

import { useState } from "react";
import Link from "next/link";
import { recordListingLeadAction } from "@/app/actions/listings";

/**
 * Phone and email behind one tap. Guests are asked to join first — that is what
 * keeps sellers' numbers off scrapers — and every reveal is counted as a lead
 * for the owner and the admin desk.
 */
export function PropertyContact({
  listingId,
  listingSlug,
  name,
  phone,
  email,
  signedIn,
}: {
  listingId: string;
  listingSlug: string;
  name: string | null;
  phone: string | null;
  email: string | null;
  signedIn: boolean;
}) {
  const [shown, setShown] = useState(false);
  if (!phone && !email) return null;

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

  if (!shown) {
    return (
      <button
        type="button"
        onClick={() => {
          setShown(true);
          void recordListingLeadAction(listingId, phone ? "phone" : "email");
        }}
        className="w-full rounded-xl border border-indigo-300 bg-white px-4 py-3 text-sm font-semibold text-indigo-700 hover:bg-indigo-50"
      >
        📞 Show phone{email ? " and email" : ""}
      </button>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm">
      {name ? <p className="font-bold">{name}</p> : null}
      {phone ? (
        <p className="mt-1">
          <a href={`tel:${phone}`} className="font-semibold text-indigo-600">
            📞 {phone}
          </a>
        </p>
      ) : null}
      {email ? (
        <p className="mt-1">
          <a href={`mailto:${email}`} className="font-semibold text-indigo-600">
            ✉️ {email}
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
