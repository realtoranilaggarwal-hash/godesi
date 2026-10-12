import type { Metadata } from "next";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { Card } from "@/components/ui";
import { MediaTeamForm } from "@/components/forms/MediaTeamForm";
import { MEDIA_ROLES } from "@/lib/media";
import { STUDIO_ADDRESS } from "@/lib/storySheet";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Join the GoDesi Media team — interviewers, hosts, editors, reporters",
  description:
    "Interview desi entrepreneurs and community leaders for Desi Who's Who, report for GoDesi News, film Desi on the Street, edit clips. Apply to join GoDesi Media in New Jersey and beyond.",
  alternates: { canonical: "/media/join" },
};

export default async function MediaJoinPage() {
  const user = await getCurrentUser();

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <Link href="/media" className="text-sm font-semibold text-indigo-600">
        ← GoDesi Media
      </Link>
      <h1 className="text-2xl font-black sm:text-3xl">
        Join the GoDesi Media team
      </h1>
      <p className="text-sm text-slate-600">
        We are building a desi media network from our studio at the{" "}
        {STUDIO_ADDRESS} — Desi Who&apos;s Who interviews, GoDesi News, a
        podcast and street clips. The first goal is ten interviews: three
        business owners, two entrepreneurs, two community leaders, an artist, a
        restaurant owner and one unusual immigrant story. We need people who can
        ask good questions, hold a camera, cut a Short or write it up.
      </p>

      <Card className="border-amber-200 bg-amber-50 text-sm text-amber-900">
        <p className="font-bold">Roles</p>
        <ul className="mt-1 grid gap-1 sm:grid-cols-2">
          {MEDIA_ROLES.map((role) => (
            <li key={role.id}>• {role.label}</li>
          ))}
        </ul>
        <p className="mt-2">
          Part-time and weekend-friendly. Students, retired professionals and
          working people with a couple of evenings a week are all welcome; any
          desi language is a plus.
        </p>
      </Card>

      <Card>
        <MediaTeamForm
          defaultName={user?.name ?? ""}
          defaultEmail={user?.email ?? ""}
          defaultCity={user?.location ?? ""}
        />
      </Card>
    </div>
  );
}
