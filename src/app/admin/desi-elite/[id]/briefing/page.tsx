import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getCurrentUser, isStaff } from "@/lib/auth";
import { PrintButton } from "@/components/PrintButton";
import { ELITE_STATUS_LABELS } from "@/lib/elite";
import {
  PRIVATE_SECTION,
  REPURPOSE_CHECKLIST,
  STORY_SECTIONS,
  STUDIO_ADDRESS,
  readStoryAnswers,
  storyProgress,
} from "@/lib/storySheet";
import { DEFAULT_EVENT_ZONE } from "@/lib/time";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Interviewer briefing",
  robots: { index: false },
};

function Block({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="break-inside-avoid rounded-2xl border border-slate-200 bg-white p-4 print:rounded-none print:border-0 print:border-b print:p-0 print:pb-3">
      <h2 className="text-xs font-black uppercase tracking-wide text-slate-500">
        {title}
      </h2>
      <div className="mt-2 text-sm text-slate-800">{children}</div>
    </section>
  );
}

function Row({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <p>
      <span className="font-semibold text-slate-600">{label}:</span> {value}
    </p>
  );
}

export default async function EliteBriefingPage({
  params,
}: {
  params: { id: string };
}) {
  const user = await getCurrentUser();
  if (!user)
    redirect(
      `/login?next=${encodeURIComponent(`/admin/desi-elite/${params.id}/briefing`)}`,
    );
  if (!isStaff(user)) notFound();

  const entry = await db.eliteEntry.findUnique({
    where: { id: params.id },
    include: { user: { select: { email: true, name: true, username: true } } },
  });
  if (!entry) notFound();

  const answers = readStoryAnswers(entry.storySheet);
  const progress = storyProgress(answers);
  const when = entry.interviewAt
    ? entry.interviewAt.toLocaleString("en-US", {
        dateStyle: "full",
        timeStyle: "short",
        timeZone: DEFAULT_EVENT_ZONE,
      })
    : null;
  const openers = [
    answers.arrival
      ? "Start where they landed — ask what was in their pocket that day."
      : "Ask how they came to America; the sheet is empty here, so go slow.",
    answers.firstJob
      ? `First job: ${answers.firstJob.slice(0, 80)}${answers.firstJob.length > 80 ? "…" : ""} — get the detail.`
      : "Ask about the very first job here.",
    answers.mistake
      ? "Go to the mistake early; that is the clip."
      : "Ask: which mistake taught you the most?",
    answers.quote
      ? `Close on their line: “${answers.quote}”.`
      : "End with: one line you live by — for the quote graphic.",
  ];

  return (
    <div className="mx-auto max-w-3xl space-y-4 print:max-w-none print:space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2 print:hidden">
        <Link
          href={`/admin/desi-elite?entry=${entry.id}`}
          className="text-sm font-semibold text-indigo-600"
        >
          ← Elite desk
        </Link>
        <div className="flex gap-2">
          <Link
            href={`/admin/desi-elite?entry=${entry.id}`}
            className="rounded-xl border border-slate-300 px-3 py-1.5 text-sm font-bold text-slate-700"
          >
            Schedule / edit
          </Link>
          <PrintButton>Print briefing</PrintButton>
        </div>
      </div>

      <header>
        <p className="text-xs font-bold uppercase tracking-wide text-amber-700">
          GoDesi Media · Desi Who&apos;s Who · Interviewer briefing
        </p>
        <h1 className="text-2xl font-black sm:text-3xl">{entry.fullName}</h1>
        <p className="text-sm text-slate-600">
          {entry.category}
          {entry.businessName ? ` · ${entry.businessName}` : ""} · {entry.city}
          {entry.state ? `, ${entry.state}` : ""}
          {entry.country ? `, ${entry.country}` : ""}
          {entry.yearsExperience ? ` · ${entry.yearsExperience} yrs` : ""}
        </p>
        <p className="mt-1 text-xs text-slate-500">
          Status: {ELITE_STATUS_LABELS[entry.status]} · Story sheet{" "}
          {progress.done}/{progress.total} · Interview fee{" "}
          {entry.interviewPaid ? "paid" : "not paid"} · Video package{" "}
          {entry.videoPackage.toLowerCase()}
          {entry.assignedTo ? ` · Interviewer: ${entry.assignedTo}` : ""}
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 print:grid-cols-2 print:gap-3">
        <Block title="Booking">
          {when ? (
            <>
              <p className="font-bold">{when} (US Eastern)</p>
              <p>{entry.interviewPlace ?? STUDIO_ADDRESS}</p>
            </>
          ) : (
            <p className="text-slate-500">
              Not booked yet — set date, time and place on the Elite desk.
              Studio: {STUDIO_ADDRESS}.
            </p>
          )}
          <Row
            label="Prefers"
            value={entry.interviewTypes.join(", ") || "not stated"}
          />
          <Row label="Recording / stream" value={entry.interviewUrl} />
        </Block>

        <Block title="Contact">
          <Row label="Phone / WhatsApp" value={entry.contactPhone} />
          <Row label="Email" value={entry.contactEmail ?? entry.user?.email} />
          <Row label="Website" value={entry.websiteUrl} />
          <Row
            label="GoDesi"
            value={
              entry.profileUrl ??
              (entry.user?.username
                ? `godesi.com/${entry.user.username}`
                : null)
            }
          />
          {entry.socialLinks.length ? (
            <Row label="Social" value={entry.socialLinks.join(" · ")} />
          ) : null}
        </Block>
      </div>

      <Block title="Who they are (from the application)">
        <p className="whitespace-pre-line">{entry.shortBio}</p>
        {entry.achievements ? (
          <p className="mt-2 whitespace-pre-line">
            <span className="font-semibold text-slate-600">Achievements:</span>{" "}
            {entry.achievements}
          </p>
        ) : null}
        {entry.awards.length ? (
          <Row label="Awards" value={entry.awards.join("; ")} />
        ) : null}
        {entry.proofUrls.length ? (
          <Row label="Proof / press" value={entry.proofUrls.join(" · ")} />
        ) : null}
      </Block>

      <Block title="Suggested run of show (45 min)">
        <ol className="list-decimal space-y-1 pl-5">
          {openers.map((line) => (
            <li key={line}>{line}</li>
          ))}
          <li>
            Business Spotlight beat: what they sell, who for, one number the
            community will repeat.
          </li>
          <li>Advice to a young desi — ask for one thing, not five.</li>
        </ol>
      </Block>

      {STORY_SECTIONS.map((section) => {
        const filled = section.questions.filter((q) => answers[q.id]);
        return (
          <Block
            key={section.title}
            title={
              section.title === PRIVATE_SECTION
                ? `${section.title} — do not publish`
                : `Story sheet · ${section.title}`
            }
          >
            {filled.length === 0 ? (
              <p className="text-slate-500">
                Nothing answered yet — questions to ask on the day:{" "}
                {section.questions.map((q) => q.label).join(" · ")}
              </p>
            ) : (
              <dl className="space-y-3">
                {section.questions.map((q) => (
                  <div key={q.id}>
                    <dt className="font-semibold text-slate-600">{q.label}</dt>
                    <dd className="whitespace-pre-line">
                      {answers[q.id] ?? (
                        <span className="text-slate-400">— ask on the day</span>
                      )}
                    </dd>
                  </div>
                ))}
              </dl>
            )}
          </Block>
        );
      })}

      <Block title="After recording — one interview, ten pieces">
        <ul className="grid gap-1 sm:grid-cols-2">
          {REPURPOSE_CHECKLIST.map((item) => (
            <li key={item} className="flex items-start gap-2">
              <span className="mt-0.5 inline-block h-3.5 w-3.5 shrink-0 rounded border border-slate-400" />
              {item}
            </li>
          ))}
        </ul>
      </Block>

      {entry.adminNote ? (
        <Block title="Staff note">
          <p className="whitespace-pre-line">{entry.adminNote}</p>
        </Block>
      ) : null}
    </div>
  );
}
