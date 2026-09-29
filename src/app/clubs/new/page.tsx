import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { ClubForm } from "@/components/forms/ClubForm";
import { Card } from "@/components/ui";
import { requestCountry } from "@/lib/currency";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Start a club on GoDesi",
  description:
    "Start a karaoke, cricket, food, travel or business club: public or private, with members, rules, a YouTube playlist and events with RSVPs and contributions.",
  alternates: { canonical: "/clubs/new" },
};

export default async function NewClubPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/clubs/new");

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Start a club</h1>
        <p className="text-sm text-slate-600">
          You become the first organiser. Once the club is up you can invite
          members, add more organisers and post events under it.
        </p>
      </div>
      <Card>
        <ClubForm defaultCountry={requestCountry()} />
      </Card>
    </div>
  );
}
