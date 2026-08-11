"use client";

import { useFormState, useFormStatus } from "react-dom";
import { Card } from "@/components/ui";
import { claimFoundingFeatureAction } from "@/app/actions/founding";
import { emptyState } from "@/lib/actions";

function ClaimButton({ days }: { days: number }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-xl bg-gradient-to-r from-orange-500 to-rose-500 px-4 py-2 text-sm font-bold text-white hover:opacity-90 disabled:opacity-60"
    >
      {pending ? "Switching on…" : `Yes — feature me free for ${days} days`}
    </button>
  );
}

/**
 * Founding-member offer on the dashboard: unlimited posting while we fill the
 * site, plus a free featured run they have to switch on themselves.
 */
export function FoundingFeatureOffer({
  days,
  activeUntil,
}: {
  days: number;
  activeUntil: string | null;
}) {
  const [state, action] = useFormState(claimFoundingFeatureAction, emptyState);

  return (
    <Card className="border-amber-300 bg-gradient-to-br from-amber-50 via-white to-rose-50">
      <h2 className="text-lg font-black">🏅 Founding member perks</h2>
      <p className="mt-1 text-sm text-slate-700">
        No weekly cap while we build up Godesi — post as many news reports and
        classifieds as you like.
      </p>
      {activeUntil ? (
        <p className="mt-2 rounded-xl bg-white p-3 text-sm font-semibold text-emerald-700">
          ⭐ Your ads, card and listings are featured free until {activeUntil}.
        </p>
      ) : (
        <form action={action} className="mt-2 space-y-2">
          <p className="text-sm text-slate-700">
            Want your ads featured at the top of Godesi for {days} days — free?
          </p>
          <ClaimButton days={days} />
          {state.error ? (
            <p className="text-sm text-rose-600">{state.error}</p>
          ) : null}
          {state.success ? (
            <p className="text-sm text-emerald-700">{state.success}</p>
          ) : null}
        </form>
      )}
    </Card>
  );
}
