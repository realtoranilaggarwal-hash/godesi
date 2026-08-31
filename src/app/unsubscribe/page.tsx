import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";
import { digestTokenValid } from "@/lib/digest";
import { canonicalEmail, inviteOptOutValid } from "@/lib/invites";
import { Card } from "@/components/ui";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Unsubscribe from the Godesi weekly digest",
  description:
    "Stop the weekly Godesi community email. Your account, listings and business cards stay exactly as they are.",
  robots: { index: false, follow: false },
};

export default async function Page({
  searchParams,
}: {
  searchParams: { u?: string; t?: string; e?: string };
}) {
  const userId = searchParams.u ?? "";
  const token = searchParams.t ?? "";
  const email = canonicalEmail(searchParams.e ?? "");

  // Two kinds of link land here: a member stopping the weekly digest, and a
  // friend asking never to be invited again.
  const invite = Boolean(email && token && inviteOptOutValid(email, token));
  const digest = Boolean(userId && token && digestTokenValid(userId, token));
  const ok = invite || digest;

  if (invite) {
    await db.inviteOptOut
      .upsert({
        where: { emailCanonical: email },
        update: {},
        create: { emailCanonical: email },
      })
      .catch(() => null);
  } else if (digest) {
    await db.user
      .update({
        where: { id: userId },
        data: { digestOptOutAt: new Date() },
      })
      .catch(() => null);
  }

  return (
    <Card className="mx-auto max-w-lg space-y-3">
      <h1 className="text-2xl font-black">
        {ok ? "You're unsubscribed" : "That link didn't work"}
      </h1>
      <p className="text-sm text-slate-600">
        {invite
          ? "Done — nobody on Godesi can send an invitation to that address again. We keep only the address itself, so we can honour this."
          : ok
          ? "No more weekly digests. Your account, business card and listings are untouched, and you'll still get emails about things you do — bookings, payments and replies."
          : "The link may have been cut in half by your email app. Copy the whole link, or email us and we'll take you off the list."}
      </p>
      <div className="flex flex-wrap gap-2 text-sm font-bold">
        <Link
          href="/"
          className="rounded-xl bg-indigo-600 px-3 py-2 text-white hover:bg-indigo-700"
        >
          Back to Godesi
        </Link>
        <Link
          href="/contact"
          className="rounded-xl border border-slate-200 px-3 py-2 text-slate-700 hover:bg-slate-50"
        >
          Contact us
        </Link>
      </div>
    </Card>
  );
}
