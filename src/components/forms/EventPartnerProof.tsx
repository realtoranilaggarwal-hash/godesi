"use client";

import { useFormState } from "react-dom";
import { submitPartnerProofAction } from "@/app/actions/events";
import { emptyState } from "@/lib/actions";
import { ImageField } from "@/components/forms/ImageField";
import { SubmitButton } from "@/components/SubmitButton";
import { FormError } from "@/components/forms/FormError";

/** Organiser-only branding evidence for the Godesi promotion partnership. */
export function EventPartnerProof({
  eventId,
  status,
  bannerUrl,
  standeeUrl,
  salesUrl,
}: {
  eventId: string;
  status: string;
  bannerUrl: string | null;
  standeeUrl: string | null;
  salesUrl: string | null;
}) {
  const [state, formAction] = useFormState(submitPartnerProofAction, emptyState);

  return (
    <form
      action={formAction}
      className="space-y-3 rounded-2xl border border-amber-300 bg-amber-50 p-4"
    >
      <input type="hidden" name="eventId" value={eventId} />
      <FormError>{state.error}</FormError>
      {state.success ? (
        <p className="rounded-xl bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-800">
          {state.success}
        </p>
      ) : null}

      <div>
        <p className="text-sm font-bold text-amber-900">
          🤝 Godesi promotion partnership —{" "}
          {status === "APPROVED"
            ? "approved"
            : status === "REJECTED"
              ? "not approved"
              : "waiting for review"}
        </p>
        <p className="text-xs text-amber-900">
          Upload the banner and standee photos before the event, and the ticket
          sales screenshot after it, so your turnout earnings can be verified.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <ImageField
          name="partnerBannerUrl"
          label="Banner photo"
          purpose="event"
          defaultValue={bannerUrl ?? ""}
          previewClassName="h-20 w-28 rounded-xl object-cover"
        />
        <ImageField
          name="partnerStandeeUrl"
          label="Standee photo"
          purpose="event"
          defaultValue={standeeUrl ?? ""}
          previewClassName="h-20 w-28 rounded-xl object-cover"
        />
        <ImageField
          name="partnerSalesUrl"
          label="Ticket sales screenshot"
          purpose="event"
          defaultValue={salesUrl ?? ""}
          previewClassName="h-20 w-28 rounded-xl object-cover"
        />
      </div>

      <SubmitButton pendingLabel="Uploading...">Send proof to Godesi</SubmitButton>
    </form>
  );
}
