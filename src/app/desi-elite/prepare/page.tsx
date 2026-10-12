import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { Card } from "@/components/ui";
import { StorySheetForm } from "@/components/forms/StorySheetForm";
import { ELITE_STATUS_LABELS } from "@/lib/elite";
import {
  STUDIO_ADDRESS,
  readStoryAnswers,
  storyProgress,
} from "@/lib/storySheet";
import { DEFAULT_EVENT_ZONE } from "@/lib/time";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Prepare for your GoDesi Elite interview",
  description:
    "Your story sheet for the Desi Who's Who interview: how you came to America, your first job, biggest challenge, the lesson that made you.",
  robots: { index: false },
};

export default async function ElitePreparePage() {
  const user = await getCurrentUser();
  if (!user)
    redirect(`/login?next=${encodeURIComponent("/desi-elite/prepare")}`);

  const entry = await db.eliteEntry.findFirst({
    where: { userId: user.id, nominationType: "SELF" },
    orderBy: { createdAt: "desc" },
  });
  if (!entry) redirect("/desi-elite/apply");

  const answers = readStoryAnswers(entry.storySheet);
  const progress = storyProgress(answers);
  const when = entry.interviewAt
    ? entry.interviewAt.toLocaleString("en-US", {
        dateStyle: "full",
        timeStyle: "short",
        timeZone: DEFAULT_EVENT_ZONE,
      })
    : null;

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <Link
        href="/desi-elite/apply"
        className="text-sm font-semibold text-indigo-600"
      >
        ← Your Elite application
      </Link>
      <p className="text-xs font-bold uppercase tracking-wide text-amber-700">
        <Link href="/media" className="hover:underline">
          GoDesi Media
        </Link>{" "}
        · Desi Who&apos;s Who
      </p>
      <h1 className="text-2xl font-black sm:text-3xl">
        Prepare for your interview, {entry.fullName.split(" ")[0]}
      </h1>
      <p className="text-sm text-slate-600">
        One person. One story. One lesson. Our interviewer reads these answers
        before you sit down, so the conversation goes straight to the moments
        that matter. Fill in what you can now and come back any time — every
        save is kept.
      </p>

      <Card className="border-indigo-200 bg-indigo-50">
        <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
          <p className="font-bold text-indigo-900">
            Status: {ELITE_STATUS_LABELS[entry.status]}
          </p>
          <p className="text-indigo-900">
            Story sheet {progress.done}/{progress.total} answered
          </p>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-indigo-100">
          <div
            className="h-full bg-indigo-600"
            style={{ width: `${progress.pct}%` }}
          />
        </div>
        {when ? (
          <p className="mt-3 text-sm text-indigo-900">
            <span className="font-bold">Your interview:</span> {when} (US
            Eastern) — {entry.interviewPlace ?? STUDIO_ADDRESS}
          </p>
        ) : (
          <p className="mt-3 text-xs text-indigo-900">
            Once your date is booked it appears here. Interviews are recorded at
            the {STUDIO_ADDRESS}, or over Zoom if you are further away.
          </p>
        )}
      </Card>

      <Card className="border-amber-200 bg-amber-50 text-sm text-amber-900">
        <p className="font-bold">What happens with your interview</p>
        <p className="mt-1">
          A 30–45 minute conversation becomes your full interview on the Desi
          Who&apos;s Who YouTube channel, a podcast episode, short clips for
          Instagram, Facebook and TikTok, a GoDesi News story, quote graphics
          and your GoDesi Elite profile — everything linking back to your
          business or profile page.
        </p>
      </Card>

      <Card>
        <StorySheetForm entryId={entry.id} answers={answers} />
      </Card>
    </div>
  );
}
