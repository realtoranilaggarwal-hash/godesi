import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { parseIntents } from "@/lib/meetups";
import {
  deleteMeetupProfileAction,
  toggleMeetupVisibilityAction,
} from "@/app/actions/meetups";
import { MeetupProfileForm } from "@/components/forms/MeetupProfileForm";
import { SafetyResourcesRail } from "@/components/SafetyResourcesRail";
import { Card } from "@/components/ui";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "My Connect profile — meet desis near you",
  description:
    "Create or edit your Godesi Connect profile: say what you would like to meet about — networking, mentorship, cultural meetups, workshops or community groups. Reviewed before it appears.",
  alternates: { canonical: "/connect/new" },
};

export default async function ConnectProfilePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/connect/new");

  const profile = await db.meetupProfile.findUnique({ where: { userId: user.id } });

  return (
    <div className="flex justify-center gap-6">
      <div className="min-w-0 max-w-3xl flex-1 space-y-5">
      <div>
        <h1 className="text-2xl font-bold">
          {profile ? "Edit my Connect profile" : "Create my Connect profile"}
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Tell people what you would like to meet about. Every profile is reviewed
          before it appears, and edits go back for review.
        </p>
      </div>

      <Card>
        <MeetupProfileForm
          defaults={
            profile
              ? {
                  displayName: profile.displayName,
                  age: profile.age,
                  gender: profile.gender,
                  marital: profile.marital,
                  city: profile.city,
                  state: profile.state ?? "",
                  intents: parseIntents(profile.intents),
                  bio: profile.bio,
                  whatsappNumber: profile.whatsappNumber ?? "",
                }
              : undefined
          }
        />
      </Card>

      {profile ? (
        <Card className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-slate-600">
            Status: <strong>{profile.status.toLowerCase()}</strong> ·{" "}
            {profile.visible ? "visible in Connect" : "hidden from Connect"}
          </p>
          <div className="flex gap-2">
            <form action={toggleMeetupVisibilityAction}>
              <button
                type="submit"
                className="rounded-xl border border-slate-300 px-3 py-2 text-sm font-semibold hover:bg-slate-50"
              >
                {profile.visible ? "Hide my profile" : "Show my profile"}
              </button>
            </form>
            <form action={deleteMeetupProfileAction}>
              <button
                type="submit"
                className="rounded-xl border border-rose-300 px-3 py-2 text-sm font-semibold text-rose-700 hover:bg-rose-50"
              >
                Delete
              </button>
            </form>
          </div>
        </Card>
      ) : null}
      </div>

      <SafetyResourcesRail />
    </div>
  );
}
