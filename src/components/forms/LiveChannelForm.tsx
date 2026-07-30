"use client";

import { useState } from "react";
import { useFormState } from "react-dom";
import { submitLiveChannelAction } from "@/app/actions/liveChannels";
import { emptyState } from "@/lib/actions";
import { Alert, Field, inputClass } from "@/components/ui";
import { SubmitButton } from "@/components/SubmitButton";
import { FormError } from "@/components/forms/FormError";
import { PhoneInput } from "@/components/forms/PhoneInput";

/**
 * Members submit their own station or channel, or suggest a charity / non-profit
 * one for free. An admin approves before anything is carried.
 */
export function LiveChannelForm() {
  const [state, formAction] = useFormState(submitLiveChannelAction, emptyState);
  const [kind, setKind] = useState<"RADIO" | "TV">("RADIO");
  const [nonProfit, setNonProfit] = useState(false);

  return (
    <form action={formAction} className="space-y-3">
      <FormError>{state.error}</FormError>
      {state.success ? <Alert tone="success">{state.success}</Alert> : null}

      <Field label="Radio or TV?">
        <select
          name="kind"
          value={kind}
          onChange={(event) => setKind(event.target.value as "RADIO" | "TV")}
          className={inputClass}
        >
          <option value="RADIO">🎧 Radio station (TuneIn)</option>
          <option value="TV">📺 TV channel (YouTube live)</option>
        </select>
      </Field>

      <Field label="Station or channel name">
        <input name="name" required className={inputClass} />
      </Field>

      <Field
        label="Where does it broadcast from?"
        hint="Example: Edison NJ, USA · Punjabi · Mumbai, India"
      >
        <input name="place" required className={inputClass} />
      </Field>

      <Field
        label={
          kind === "RADIO"
            ? "TuneIn link or station id"
            : "YouTube channel link or channel id"
        }
        hint={
          kind === "RADIO"
            ? "Find your station on tunein.com and paste its address — we need the s123456 id in it."
            : "Paste your channel address, e.g. youtube.com/channel/UCxxxxxxxx. Handles like @mychannel won't work — open the channel page and copy the UC… id."
        }
      >
        <input
          name="embedId"
          required
          placeholder={
            kind === "RADIO"
              ? "https://tunein.com/radio/My-Station-s123456/"
              : "https://www.youtube.com/channel/UCxxxxxxxxxxxxxxxxxxxxxx"
          }
          className={inputClass}
        />
      </Field>

      <Field label="About this station (optional)">
        <textarea name="about" rows={3} className={inputClass} />
      </Field>

      <Field label="Website (optional)">
        <input
          name="websiteUrl"
          type="url"
          placeholder="https://"
          className={inputClass}
        />
      </Field>

      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Your name (optional)">
          <input name="contactName" className={inputClass} />
        </Field>
        <Field label="Email (optional)">
          <input name="contactEmail" type="email" className={inputClass} />
        </Field>
      </div>

      <Field label="Phone / WhatsApp (optional)">
        <PhoneInput name="contactPhone" />
      </Field>

      <label className="flex items-start gap-2 rounded-xl bg-emerald-50 p-3 text-sm">
        <input
          type="checkbox"
          name="nonProfit"
          checked={nonProfit}
          onChange={(event) => setNonProfit(event.target.checked)}
          className="mt-1"
        />
        <span>
          <span className="font-bold">
            This is a charity, non-profit or community suggestion
          </span>{" "}
          — carried free of charge. Tick this only if nobody is paying for the
          placement; our team checks before approving.
        </span>
      </label>

      {!nonProfit ? (
        <Alert tone="info">
          Commercial carriage is <strong>$50 per month</strong>. Submit first,
          then pay below — your stream goes live once our team approves it.
        </Alert>
      ) : null}

      <SubmitButton pendingLabel="Submitting...">
        Submit for review
      </SubmitButton>
    </form>
  );
}
