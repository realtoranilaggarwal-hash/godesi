import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser, isStaff } from "@/lib/auth";
import { Card } from "@/components/ui";
import { CATEGORY_TREE } from "@/lib/categories";
import { PROSPECT_PITCHES, DEFAULT_PITCH } from "@/lib/prospectEmails";
import { PLANS } from "@/lib/plans";

export const metadata: Metadata = {
  title: "Emails and scripts by category | Godesi admin",
};
export const dynamic = "force-dynamic";

/** Filled in so the girl can read the text as the owner will read it. */
const SAMPLE = {
  business: "[business name]",
  city: "[town]",
  cardUrl: "https://godesi.com/b/[their-card]?claim=1",
  from: "[your name]",
};

function beatName(slug: string) {
  return CATEGORY_TREE.find((entry) => entry.slug === slug)?.name ?? slug;
}

export default async function HandbookEmailsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/admin/handbook/emails");
  if (!isStaff(user)) redirect("/dashboard");

  const pitches = [...PROSPECT_PITCHES, DEFAULT_PITCH];

  return (
    <div className="space-y-4">
      <Card className="space-y-2">
        <h1 className="text-2xl font-bold">Emails and scripts by category</h1>
        <p className="text-sm text-slate-600">
          One email and one phone opener per beat. Copy it, replace the words in
          brackets, and send it — the same text is already loaded into the Call
          and Email buttons on{" "}
          <Link href="/admin/prospects" className="font-semibold text-indigo-600">
            the call list
          </Link>
          , so use those where you can and keep this page for reading and for
          writing to somebody by hand.
        </p>
        <p className="text-sm text-slate-600">
          Everything written here is true on our own pages: a listing is free,
          Pro is ${PLANS.PRO.priceUsd.toFixed(2)} a month, Featured is $
          {PLANS.PREMIUM.priceUsd} a month and puts them on the home page in
          their own category in rotation with the other featured members, we
          take no commission on enquiries, and Elite is $500 for a year or $250
          for five years on the current offer. Do not improve on those numbers.
        </p>
        <p className="rounded-2xl border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
          The starter card already carries their phone and email, hidden. That is
          your whole reason for calling: <strong>claim the page and the
          contact details appear on it</strong>. Never read a number back to a
          third party, and if the owner asks to be removed, tell your admin and
          it comes down the same day.
        </p>
        <div className="flex flex-wrap gap-1 text-xs font-semibold">
          {pitches.map((pitch) => (
            <a
              key={pitch.slug}
              href={`#${pitch.slug}`}
              className="rounded-full border border-slate-200 px-2 py-0.5 text-slate-600"
            >
              {pitch.icon}{" "}
              {pitch.slug === "default" ? "Anything else" : beatName(pitch.slug)}
            </a>
          ))}
        </div>
      </Card>

      {pitches.map((pitch) => (
        <Card key={pitch.slug} id={pitch.slug} className="space-y-3">
          <div>
            <h2 className="text-lg font-bold">
              <span aria-hidden className="mr-1.5">
                {pitch.icon}
              </span>
              {pitch.slug === "default" ? "Anything else" : beatName(pitch.slug)}
            </h2>
            <p className="text-sm text-slate-600">{pitch.hook}</p>
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
              On the phone
            </p>
            <p className="mt-1 whitespace-pre-line rounded-2xl bg-slate-50 p-3 text-sm text-slate-800">
              {pitch.call(SAMPLE)}
            </p>
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
              Email — subject: {pitch.subject(SAMPLE)}
            </p>
            <p className="mt-1 whitespace-pre-line rounded-2xl bg-slate-50 p-3 text-sm text-slate-800">
              {pitch.email(SAMPLE)}
            </p>
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
              If they say…
            </p>
            <ul className="mt-1 space-y-2 text-sm text-slate-700">
              {pitch.objections.map((objection) => (
                <li key={objection.question}>
                  <strong>{objection.question}</strong> {objection.answer}
                </li>
              ))}
            </ul>
          </div>
        </Card>
      ))}
    </div>
  );
}
