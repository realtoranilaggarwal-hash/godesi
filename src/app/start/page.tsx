import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { PostAnything } from "@/components/PostAnything";
import { Card } from "@/components/ui";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Welcome — what do you want to do first?",
  robots: { index: false },
};

/**
 * Where brand-new members land: every kind of post in one view, so an organiser
 * picks "Event" instead of a sell-listing, a freelancer picks "Gig", etc.
 */
export default async function StartPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/signup?next=/start");

  const hasCard = Boolean(
    await db.business.findFirst({
      where: { ownerId: user.id },
      select: { id: true },
    }),
  );

  return (
    <div className="mx-auto max-w-4xl space-y-4">
      <div>
        <h1 className="text-2xl font-bold">
          Welcome, {user.name.split(" ")[0]} 👋
        </h1>
        <p className="text-sm text-slate-600">
          Pick what you came to do — each option opens the right form, so your
          event lands on the events calendar, your item for sale in the
          marketplace, your service as a gig.
        </p>
      </div>

      <PostAnything
        title="Everything you can post on GoDesi"
        hasCard={hasCard}
      />

      <Card className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-slate-600">
          Or just look around — you can always come back here at{" "}
          <strong>godesi.com/start</strong>.
        </p>
        <Link
          href="/dashboard"
          className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-bold text-white hover:bg-indigo-700"
        >
          Go to my dashboard →
        </Link>
      </Card>
    </div>
  );
}
