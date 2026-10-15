import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import {
  deleteRishtaProfileAction,
  toggleRishtaVisibilityAction,
} from "@/app/actions/rishta";
import { RishtaProfileForm } from "@/components/forms/RishtaProfileForm";
import { Card } from "@/components/ui";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Post a Rishta profile",
  robots: { index: false },
};

export default async function NewRishtaPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/rishta/new");
  const profile = await db.rishtaProfile.findUnique({
    where: { userId: user.id },
  });
  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <h1 className="text-2xl font-black">
        {profile ? "Edit Rishta profile" : "Post a Rishta profile"}
      </h1>
      <p className="text-sm text-slate-600">
        For yourself, or for your son, daughter, brother, sister or relative.
        GoDesi reviews every profile before it appears.
      </p>
      <Card>
        <RishtaProfileForm defaults={profile} />
      </Card>
      {profile ? (
        <div className="flex flex-wrap gap-2">
          <form action={toggleRishtaVisibilityAction}>
            <button className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold">
              {profile.visible ? "Hide my profile" : "Show my profile again"}
            </button>
          </form>
          <form action={deleteRishtaProfileAction}>
            <button className="rounded-xl border border-rose-300 px-4 py-2 text-sm font-semibold text-rose-700">
              Delete my profile
            </button>
          </form>
        </div>
      ) : null}
    </div>
  );
}
