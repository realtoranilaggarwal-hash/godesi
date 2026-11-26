import type { Metadata } from "next";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import {
  publishPushedEventAction,
  readPushLinkAction,
} from "@/app/actions/eventPush";
import { PUSH_DAILY_LIMIT } from "@/lib/eventLink";
import { cleanEventCategories, cleanEventLanguages } from "@/lib/eventCategories";
import { EventCategoryPicker } from "@/components/forms/EventCategoryPicker";
import { DEFAULT_EVENT_ZONE, EVENT_TIME_ZONES } from "@/lib/time";
import { Card, LinkButton, inputClass } from "@/components/ui";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "GoDesi Push — promote your Sulekha or Eventbrite event on GoDesi",
  description:
    "Already listed your event on Sulekha, Eventbrite, Facebook or your own website? Paste the link, join GoDesi free and publish it in 1-2-3 to reach the desi community.",
  alternates: { canonical: "/events/push" },
};

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block text-sm">
      <span className="font-semibold text-slate-700">{label}</span>
      {hint ? <span className="ml-1 text-slate-400">— {hint}</span> : null}
      <span className="mt-1 block">{children}</span>
    </label>
  );
}

const STEPS = [
  {
    icon: "🔗",
    title: "Paste your event link",
    text: "From Sulekha, Eventbrite, Facebook, Meetup or your own website.",
  },
  {
    icon: "👤",
    title: "Join or sign in",
    text: "Free. The event goes under your own GoDesi account.",
  },
  {
    icon: "🚀",
    title: "Check it and publish",
    text: "GoDesi fills in the date, venue and poster. Fix anything and press Publish.",
  },
];

export default async function PushPage({
  searchParams,
}: {
  searchParams: Record<string, string | undefined>;
}) {
  const user = await getCurrentUser();
  const draft = searchParams.host && user ? searchParams : null;

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div className="rounded-3xl bg-gradient-to-br from-indigo-700 via-fuchsia-700 to-orange-500 p-6 text-white shadow-lg">
        <p className="text-xs font-bold uppercase tracking-widest text-white/80">
          GoDesi Push
        </p>
        <h1 className="mt-1 text-2xl font-extrabold sm:text-3xl">
          Have an event? Push it to GoDesi in 1-2-3.
        </h1>
        <p className="mt-2 max-w-xl text-sm text-white/90">
          Already listed on Sulekha, Eventbrite or Facebook? Bring it to the
          GoDesi community with one link. Your tickets stay where they are, and
          you can sell them on GoDesi too whenever you like.
        </p>
      </div>

      <ol className="grid gap-3 sm:grid-cols-3">
        {STEPS.map((step, index) => (
          <li
            key={step.title}
            className="rounded-2xl border border-slate-200 bg-white p-4"
          >
            <p className="text-2xl" aria-hidden>
              {step.icon}
            </p>
            <p className="mt-1 font-bold">
              {index + 1}. {step.title}
            </p>
            <p className="mt-1 text-sm text-slate-600">{step.text}</p>
          </li>
        ))}
      </ol>

      {searchParams.error ? (
        <p className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-800">
          {searchParams.error.slice(0, 240)}
        </p>
      ) : null}

      <Card id="push">
        {draft ? (
          <>
            <h2 className="text-lg font-bold">3. Check your event and publish</h2>
            <p className="mb-3 text-sm text-slate-500">
              {draft.manual
                ? `We couldn't read ${draft.host} (Facebook hides events from anyone not signed in), so type the details in from your page.`
                : draft.missing
                  ? `From ${draft.host}. We couldn't read the ${draft.missing}, so fill that in.`
                  : `From ${draft.host}. Check everything and press Publish.`}
            </p>
            <form
              action={publishPushedEventAction}
              className="grid gap-3 sm:grid-cols-2"
            >
              <input type="hidden" name="link" value={draft.link ?? ""} />
              <div className="sm:col-span-2">
                <Field label="Title">
                  <input
                    name="title"
                    required
                    defaultValue={draft.title ?? ""}
                    className={inputClass}
                  />
                </Field>
              </div>
              <Field label="Date">
                <input
                  name="date"
                  type="date"
                  required
                  defaultValue={draft.date ?? ""}
                  className={inputClass}
                />
              </Field>
              <Field label="Start time">
                <input
                  name="time"
                  type="time"
                  required
                  defaultValue={draft.time ?? ""}
                  className={inputClass}
                />
              </Field>
              <Field label="End date" hint="Optional">
                <input
                  name="endDate"
                  type="date"
                  defaultValue={draft.endDate ?? ""}
                  className={inputClass}
                />
              </Field>
              <Field label="End time" hint="Optional">
                <input
                  name="endTime"
                  type="time"
                  defaultValue={draft.endTime ?? ""}
                  className={inputClass}
                />
              </Field>
              <div className="sm:col-span-2">
                <Field label="Times are in" hint="The event's own local time">
                  <select
                    name="timeZone"
                    defaultValue={draft.zone || DEFAULT_EVENT_ZONE}
                    className={inputClass}
                  >
                    {EVENT_TIME_ZONES.map((zone) => (
                      <option key={zone.value} value={zone.value}>
                        {zone.label}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>
              <Field label="Venue">
                <input
                  name="venue"
                  required
                  defaultValue={draft.venue ?? ""}
                  className={inputClass}
                />
              </Field>
              <Field label="Address" hint="Optional">
                <input
                  name="address"
                  defaultValue={draft.address ?? ""}
                  className={inputClass}
                />
              </Field>
              <Field label="City">
                <input
                  name="city"
                  required
                  defaultValue={draft.city ?? ""}
                  className={inputClass}
                />
              </Field>
              <Field label="State" hint="Two letters">
                <input
                  name="state"
                  defaultValue={draft.state ?? ""}
                  className={inputClass}
                />
              </Field>
              <Field label="Country">
                <input name="country" defaultValue="USA" className={inputClass} />
              </Field>
              <Field label="Poster image link" hint="Optional">
                <input
                  name="imageUrl"
                  defaultValue={draft.image ?? ""}
                  className={inputClass}
                />
              </Field>
              <EventCategoryPicker
                defaultCategories={cleanEventCategories(
                  (draft.genres ?? "").split(",").filter(Boolean),
                )}
                defaultLanguages={cleanEventLanguages(
                  (draft.langs ?? "").split(",").filter(Boolean),
                )}
                hint="Ticked from what your page says. These are the lists it shows up in."
              />
              <div className="sm:col-span-2">
                <Field label="Description">
                  <textarea
                    name="description"
                    rows={5}
                    defaultValue={draft.text ?? ""}
                    className={inputClass}
                  />
                </Field>
              </div>
              <label className="flex items-start gap-2 rounded-xl bg-amber-50 p-3 text-sm text-amber-900 sm:col-span-2">
                <input
                  type="checkbox"
                  name="permission"
                  required
                  className="mt-0.5"
                />
                <span>
                  I&apos;m the organiser of this event, or I have the
                  organiser&apos;s permission to post it on GoDesi.
                </span>
              </label>
              <button className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white sm:col-span-2">
                🚀 Publish on GoDesi
              </button>
              <p className="text-xs text-slate-500 sm:col-span-2">
                <Link href="/events/push" className="underline">
                  Start over with another link
                </Link>
              </p>
            </form>
          </>
        ) : (
          <>
            <h2 className="text-lg font-bold">1. Paste your event link</h2>
            <form
              action={readPushLinkAction}
              className="mt-3 flex flex-wrap gap-2"
            >
              <input
                name="link"
                required
                type="url"
                defaultValue={searchParams.link ?? ""}
                placeholder="https://events.sulekha.com/your-event…"
                aria-label="Your event's link"
                className={`${inputClass} min-w-0 flex-1`}
              />
              <button className="rounded-xl bg-indigo-600 px-5 py-2 text-sm font-bold text-white">
                {user ? "Pull my event" : "Next: join or sign in"}
              </button>
            </form>
            <p className="mt-2 text-xs text-slate-500">
              Works with Sulekha, Eventbrite, Meetup, AllEvents and most event
              pages. Up to {PUSH_DAILY_LIMIT} events a day.
            </p>
          </>
        )}
      </Card>

      <Card>
        <h2 className="font-bold">What you get</h2>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-600">
          <li>A GoDesi event page with comments, share kit and a map.</li>
          <li>
            A &ldquo;Get tickets&rdquo; button to your original page, so you
            keep selling where you sell now.
          </li>
          <li>
            Listed on /events and in the event lists for your city and
            category.
          </li>
          <li>
            Edit it any time, feature it for more reach, or add GoDesi tickets
            with QR check-in.
          </li>
        </ul>
        <div className="mt-3 flex flex-wrap gap-2">
          <LinkButton href="/events/new" variant="secondary">
            Or post a new event from scratch
          </LinkButton>
        </div>
      </Card>
    </div>
  );
}
