"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useFormState } from "react-dom";
import {
  shareMeetupLocationAction,
  stopSharingMeetupLocationAction,
} from "@/app/actions/meetups";
import { emptyState } from "@/lib/actions";
import { Alert, Card } from "@/components/ui";
import { SubmitButton } from "@/components/SubmitButton";

/**
 * "Friends near me": one button asks the browser for the visitor's location and
 * re-runs the Connect list sorted by distance. Signed-in members with a Connect
 * profile can also publish their own approximate spot so travellers find them.
 */
export function NearMe({
  canShare,
  sharing,
}: {
  canShare: boolean;
  sharing: boolean;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [state, formAction] = useFormState(shareMeetupLocationAction, emptyState);

  const locate = (then: (lat: number, lng: number) => void) => {
    if (!("geolocation" in navigator)) {
      setError("Your browser cannot share a location.");
      return;
    }
    setBusy(true);
    setError("");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setBusy(false);
        then(position.coords.latitude, position.coords.longitude);
      },
      () => {
        setBusy(false);
        setError(
          "We could not get your location — allow location access in your browser, or filter by city instead.",
        );
      },
      { timeout: 10000, maximumAge: 300000 },
    );
  };

  return (
    <Card className="space-y-3 bg-gradient-to-r from-cyan-50 to-emerald-50">
      <div>
        <h2 className="text-lg font-bold text-slate-900">
          🧭 Friends near me
        </h2>
        <p className="text-sm text-slate-600">
          Travelling, new in town or on your own for the weekend? Find members
          close by, sorted by distance. Nothing more precise than about a
          kilometre is ever shown, and you can switch it off any time.
        </p>
      </div>

      {error ? <Alert>{error}</Alert> : null}
      {state.error ? <Alert>{state.error}</Alert> : null}
      {state.success ? <Alert tone="success">{state.success}</Alert> : null}

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={busy}
          onClick={() =>
            locate((lat, lng) =>
              router.push(
                `/connect?lat=${lat.toFixed(3)}&lng=${lng.toFixed(3)}`,
              ),
            )
          }
          className="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
        >
          {busy ? "Finding you…" : "📍 Show members near me"}
        </button>

        {canShare ? (
          sharing ? (
            <form action={stopSharingMeetupLocationAction}>
              <SubmitButton variant="secondary" pendingLabel="Turning off…">
                Stop sharing my area
              </SubmitButton>
            </form>
          ) : (
            <form action={formAction} className="flex items-center gap-2">
              <input type="hidden" name="latitude" value={coords?.lat ?? ""} />
              <input type="hidden" name="longitude" value={coords?.lng ?? ""} />
              {coords ? (
                <SubmitButton pendingLabel="Saving…">
                  Publish my area
                </SubmitButton>
              ) : (
                <button
                  type="button"
                  disabled={busy}
                  onClick={() =>
                    locate((lat, lng) => setCoords({ lat, lng }))
                  }
                  className="rounded-xl border border-emerald-600 px-4 py-2.5 text-sm font-semibold text-emerald-700 hover:bg-emerald-50 disabled:opacity-60"
                >
                  🤝 Let others find me nearby
                </button>
              )}
            </form>
          )
        ) : null}
      </div>

      <p className="text-xs text-slate-500">
        Meet in public places, tell a friend where you are going, and never send
        money. Godesi does not verify members and is not part of any meeting.
      </p>
    </Card>
  );
}
