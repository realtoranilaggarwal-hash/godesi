"use client";

import { useState } from "react";
import { PARTNER_COMMITMENTS } from "@/lib/eventOptions";

/**
 * "Do you want Godesi to help sell and promote your tickets?" — saying yes opens
 * the branding deal: the organiser commits to venue branding and in return the
 * event is featured and promoted. Nothing is promised until an admin approves it.
 */
export function EventPartnerPanel() {
  const [wants, setWants] = useState(false);

  return (
    <fieldset className="space-y-3 rounded-2xl border border-amber-300 bg-amber-50 p-4">
      <legend className="px-1 text-sm font-bold text-amber-900">
        🤝 Sell &amp; promote tickets with Godesi?
      </legend>
      <p className="text-sm text-amber-900">
        Do you want Godesi to help sell and promote your tickets — free promotion to
        the local desi audience in return for a little branding at your venue?{" "}
        <a
          href="/events/partner"
          target="_blank"
          rel="noreferrer"
          className="font-bold underline"
        >
          What you get
        </a>
      </p>

      <div className="flex flex-wrap gap-2">
        {[
          { value: true, label: "Yes, promote my event" },
          { value: false, label: "No thanks" },
        ].map((option) => (
          <button
            key={String(option.value)}
            type="button"
            onClick={() => setWants(option.value)}
            className={`rounded-full border px-4 py-1.5 text-sm font-bold ${
              wants === option.value
                ? "border-amber-600 bg-amber-600 text-white"
                : "border-amber-300 bg-white text-amber-900 hover:bg-amber-100"
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      {wants ? (
        <div className="space-y-3 rounded-2xl bg-white p-3">
          <input type="hidden" name="partnerRequested" value="yes" />
          <p className="text-sm font-bold text-slate-900">
            Godesi promotion partnership — what you agree to
          </p>
          <div className="space-y-2">
            {PARTNER_COMMITMENTS.map((item) => (
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

          <div className="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-900">
            <p className="font-bold">💰 What you get</p>
            <ul className="mt-1 list-disc space-y-0.5 pl-5">
              <li>Free promotion to the Godesi audience in your city</li>
              <li>Featured placement on the home page and /events</li>
              <li>A “Godesi Partner Event” badge on your listing</li>
              <li>
                A WhatsApp and email blast to our desi database to help sell your
                tickets
              </li>
            </ul>
            <p className="mt-2 text-xs">
              Godesi reviews every request; the promotion starts once the team
              approves it and your branding photos are uploaded.
            </p>
          </div>
        </div>
      ) : null}
    </fieldset>
  );
}
