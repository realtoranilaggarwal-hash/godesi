import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { Card } from "@/components/ui";
import { EliteForm } from "@/components/forms/EliteForm";
import { ElitePackages } from "@/components/ElitePackages";
import { requestCountry } from "@/lib/currency";
import { ELITE_STATUS_LABELS } from "@/lib/elite";
import { siteUrl } from "@/lib/format";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Apply or nominate someone for GoDesi Elite",
  description:
    "Apply or nominate someone for GoDesi Elite: the recognition directory of desi entrepreneurs, professionals and community leaders, with interviews and video profiles.",
};

export default async function EliteApplyPage({
  searchParams,
}: {
  searchParams: { nominate?: string };
}) {
  const user = await getCurrentUser();
  if (!user) redirect(`/login?next=${encodeURIComponent("/desi-elite/apply")}`);

  const [business, existing] = await Promise.all([
    db.business.findUnique({
      where: { ownerId: user.id },
      select: { name: true, city: true, country: true },
    }),
    db.eliteEntry.findFirst({
      where: { userId: user.id, nominationType: "SELF" },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <Link href="/desi-elite" className="text-sm font-semibold text-indigo-600">
        ← GoDesi Elite
      </Link>
      <h1 className="text-2xl font-black sm:text-3xl">
        Apply for GoDesi Elite
      </h1>
      <p className="text-sm text-slate-600">
        Recognition for desi entrepreneurs, professionals and community leaders.
        Apply yourself or nominate someone who deserves it — our team reviews every
        entry, interviews you (phone, WhatsApp, Zoom or Facebook Live) and publishes
        a profile with your video.
      </p>

      {existing ? (
        <Card className="border-indigo-200 bg-indigo-50">
          <p className="text-sm font-bold text-indigo-900">
            Your application status: {ELITE_STATUS_LABELS[existing.status]}
          </p>
          {existing.status === "PUBLISHED" ? (
            <Link
              href={`/desi-elite/${existing.slug}`}
              className="mt-1 inline-block text-sm font-semibold text-indigo-700 underline"
            >
              View your published profile →
            </Link>
          ) : null}
          <p className="mt-2 text-xs text-indigo-900">
            You can still nominate somebody else below.
          </p>
        </Card>
      ) : null}

      {existing ? (
        <ElitePackages
          entryId={existing.id}
          interviewPaid={existing.interviewPaid}
          videoPackage={existing.videoPackage}
          paidCents={existing.paidCents}
        />
      ) : (
        <Card className="border-amber-200 bg-amber-50">
          <p className="text-sm font-bold text-amber-900">
            Applying is free. After you apply you can add the interview with a
            30–60 second video — normally $500 for a year, and while the launch
            offer runs $250 holds your profile for five years — or a $500
            three-minute professional film, and any amount you invest lifts your
            profile higher in its section.
          </p>
        </Card>
      )}

      <Card>
        <EliteForm
          defaultName={user.name}
          defaultEmail={user.email}
          defaultBusiness={business?.name ?? ""}
          defaultCity={business?.city ?? user.location ?? ""}
          defaultCountry={business?.country ?? requestCountry()}
          profileUrl={user.username ? `${siteUrl()}/${user.username}` : null}
          initialNomination={
            searchParams.nominate === "other" || existing ? "OTHER" : "SELF"
          }
        />
      </Card>
    </div>
  );
}
