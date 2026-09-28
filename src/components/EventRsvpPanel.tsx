import Link from "next/link";
import { rsvpAction } from "@/app/actions/clubs";
import { Button, Card, inputClass } from "@/components/ui";
import { RSVP_ANSWERS } from "@/lib/clubs";
import { formatMoney, fromMinor } from "@/lib/format";
import type { ContributionMode, RsvpAnswer } from "@prisma/client";

export type RsvpRow = {
  answer: RsvpAnswer;
  bringing: string[];
  bringingNote: string | null;
  participating: string[];
  amountMinor: number | null;
  guests: number;
  user: { name: string; username: string | null };
};

type EventForRsvp = {
  id: string;
  slug: string;
  currency: string;
  contributionMode: ContributionMode;
  contributionMinor: number | null;
  contributionNote: string | null;
  bringOptions: string[];
  participateOptions: string[];
  club: { slug: string; name: string; visibility: string } | null;
};

/**
 * Club-event RSVP: members say if they're coming, what they bring and do,
 * and organisers see the tallies and the line-up.
 */
export function EventRsvpPanel({
  event,
  rsvps,
  mine,
  viewer,
  canRsvp,
  isOrganizer,
}: {
  event: EventForRsvp;
  rsvps: RsvpRow[];
  mine: RsvpRow | null;
  viewer: boolean;
  /** False for a club event when the viewer is not an active member. */
  canRsvp: boolean;
  isOrganizer: boolean;
}) {
  const coming = rsvps.filter((r) => r.answer === "YES");
  const maybe = rsvps.filter((r) => r.answer === "MAYBE");
  const heads = coming.reduce((n, r) => n + 1 + r.guests, 0);
  const bringCounts = tally(coming.flatMap((r) => r.bringing));
  const partCounts = tally(coming.flatMap((r) => r.participating));
  const pledged = coming.reduce((n, r) => n + (r.amountMinor ?? 0), 0);
  const asks = event.contributionMode !== "NONE";

  return (
    <Card className="!border-2 !border-emerald-200">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="font-bold">
          {event.club ? "Members: are you coming?" : "Are you coming?"}
        </h2>
        <p className="text-sm text-slate-600">
          <strong>{heads}</strong> coming
          {maybe.length ? ` · ${maybe.length} maybe` : ""}
        </p>
      </div>
      {event.club ? (
        <p className="mt-1 text-xs text-slate-500">
          A{" "}
          <Link
            href={`/clubs/${event.club.slug}`}
            className="font-semibold text-indigo-600"
          >
            {event.club.name}
          </Link>{" "}
          meet — tell the organiser what you&rsquo;ll bring and do.
        </p>
      ) : null}

      {asks ? (
        <p className="mt-2 rounded-xl bg-emerald-50 px-3 py-2 text-sm text-emerald-900">
          {event.contributionMode === "SUGGESTED" && event.contributionMinor
            ? `Suggested contribution: ${formatMoney(fromMinor(event.contributionMinor), event.currency)} per person.`
            : "Chip in what you like — say how much when you RSVP."}
          {event.contributionNote ? ` ${event.contributionNote}` : ""}
        </p>
      ) : null}

      {(bringCounts.length || partCounts.length) && coming.length ? (
        <div className="mt-3 flex flex-wrap gap-1.5 text-xs">
          {bringCounts.map(([k, n]) => (
            <span
              key={`b-${k}`}
              className="rounded-full bg-amber-50 px-2 py-0.5 font-semibold text-amber-800"
            >
              {n} bringing {k.toLowerCase()}
            </span>
          ))}
          {partCounts.map(([k, n]) => (
            <span
              key={`p-${k}`}
              className="rounded-full bg-indigo-50 px-2 py-0.5 font-semibold text-indigo-700"
            >
              {n} {k.toLowerCase()}
            </span>
          ))}
          {asks && pledged ? (
            <span className="rounded-full bg-emerald-100 px-2 py-0.5 font-semibold text-emerald-800">
              {formatMoney(fromMinor(pledged), event.currency)} pledged
            </span>
          ) : null}
        </div>
      ) : null}

      {!viewer ? (
        <p className="mt-3 text-sm text-slate-600">
          <Link
            href={`/login?next=/events/${event.slug}`}
            className="font-semibold text-indigo-600"
          >
            Sign in
          </Link>{" "}
          to RSVP.
        </p>
      ) : !canRsvp && event.club ? (
        <p className="mt-3 text-sm text-slate-600">
          {event.club.visibility === "PUBLIC"
            ? "Join the club to RSVP — "
            : "This is a members-only meet — request to join the club first: "}
          <Link
            href={`/clubs/${event.club.slug}`}
            className="font-semibold text-indigo-600"
          >
            {event.club.name} →
          </Link>
        </p>
      ) : (
        <form action={rsvpAction} className="mt-3 space-y-3 text-sm">
          <input type="hidden" name="eventId" value={event.id} />
          <div className="flex flex-wrap gap-2">
            {RSVP_ANSWERS.map((a) => (
              <label
                key={a.value}
                className="flex items-center gap-1.5 rounded-full border border-slate-200 px-3 py-1 has-[:checked]:border-emerald-500 has-[:checked]:bg-emerald-50"
              >
                <input
                  type="radio"
                  name="answer"
                  value={a.value}
                  defaultChecked={(mine?.answer ?? "YES") === a.value}
                />
                {a.label}
              </label>
            ))}
            <label className="flex items-center gap-1.5">
              <span className="text-slate-600">+ guests</span>
              <input
                name="guests"
                type="number"
                min={0}
                max={20}
                defaultValue={mine?.guests ?? 0}
                className={`${inputClass} !w-16 !py-1`}
              />
            </label>
          </div>

          {event.bringOptions.length ? (
            <div>
              <p className="font-medium text-slate-700">I&rsquo;m bringing</p>
              <div className="mt-1 flex flex-wrap gap-2">
                {event.bringOptions.map((o) => (
                  <label
                    key={o}
                    className="flex items-center gap-1.5 rounded-full border border-slate-200 px-3 py-1 text-xs has-[:checked]:border-amber-400 has-[:checked]:bg-amber-50"
                  >
                    <input
                      type="checkbox"
                      name="bringing"
                      value={o}
                      defaultChecked={mine?.bringing.includes(o)}
                    />
                    {o}
                  </label>
                ))}
              </div>
            </div>
          ) : null}

          {event.participateOptions.length ? (
            <div>
              <p className="font-medium text-slate-700">
                I&rsquo;m taking part in
              </p>
              <div className="mt-1 flex flex-wrap gap-2">
                {event.participateOptions.map((o) => (
                  <label
                    key={o}
                    className="flex items-center gap-1.5 rounded-full border border-slate-200 px-3 py-1 text-xs has-[:checked]:border-indigo-400 has-[:checked]:bg-indigo-50"
                  >
                    <input
                      type="checkbox"
                      name="participating"
                      value={o}
                      defaultChecked={mine?.participating.includes(o)}
                    />
                    {o}
                  </label>
                ))}
              </div>
            </div>
          ) : null}

          {event.bringOptions.length || event.participateOptions.length ? (
            <input
              name="bringingNote"
              maxLength={300}
              defaultValue={mine?.bringingNote ?? ""}
              placeholder={
                event.participateOptions.includes("Singing")
                  ? "e.g. Samosas for 10 · singing “Tum Hi Ho” (chorus)"
                  : "e.g. Samosas + chai for 10, a Bluetooth speaker"
              }
              className={inputClass}
            />
          ) : null}

          {asks ? (
            <label className="flex items-center gap-2">
              <span className="text-slate-700">I&rsquo;ll chip in</span>
              <input
                name="amount"
                type="number"
                min={0}
                step="0.01"
                defaultValue={
                  mine?.amountMinor != null
                    ? (mine.amountMinor / 100).toFixed(2)
                    : event.contributionMinor
                      ? (event.contributionMinor / 100).toFixed(2)
                      : ""
                }
                className={`${inputClass} !w-28 !py-1`}
              />
              <span className="text-slate-500">{event.currency}</span>
            </label>
          ) : null}

          <Button type="submit">{mine ? "Update my RSVP" : "RSVP"}</Button>
        </form>
      )}

      {rsvps.length ? (
        <details className="mt-4" open={isOrganizer}>
          <summary className="cursor-pointer text-sm font-semibold text-slate-700">
            Who&rsquo;s coming ({coming.length + maybe.length})
          </summary>
          <ul className="mt-2 divide-y divide-slate-100 text-sm">
            {[...coming, ...maybe].map((r, i) => (
              <li key={i} className="flex flex-wrap gap-x-2 py-1.5">
                <span className="font-semibold">
                  {r.user.username ? (
                    <Link
                      href={`/${r.user.username}`}
                      className="text-indigo-600 hover:underline"
                    >
                      {r.user.name}
                    </Link>
                  ) : (
                    r.user.name
                  )}
                  {r.guests ? ` +${r.guests}` : ""}
                  {r.answer === "MAYBE" ? (
                    <span className="ml-1 text-xs font-normal text-slate-500">
                      maybe
                    </span>
                  ) : null}
                </span>
                <span className="text-slate-600">
                  {[
                    ...r.bringing,
                    ...r.participating,
                    r.bringingNote ?? "",
                    isOrganizer && r.amountMinor
                      ? formatMoney(fromMinor(r.amountMinor), event.currency)
                      : "",
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                </span>
              </li>
            ))}
          </ul>
        </details>
      ) : null}
    </Card>
  );
}

function tally(values: string[]): [string, number][] {
  const map = new Map<string, number>();
  for (const v of values) map.set(v, (map.get(v) ?? 0) + 1);
  return Array.from(map.entries()).sort((a, b) => b[1] - a[1]);
}
