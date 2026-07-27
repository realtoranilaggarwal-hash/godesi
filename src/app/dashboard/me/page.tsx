import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { suggestUsername } from "@/lib/profiles";
import { PersonalProfileForm } from "@/components/forms/PersonalProfileForm";
import { Card } from "@/components/ui";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "My profile" };

export default async function PersonalProfilePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const suggested = user.username ?? (await suggestUsername(user.name, user.email));

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <div>
        <h1 className="text-2xl font-bold">My personal profile</h1>
        <p className="text-sm text-slate-600">
          This is the social side of Godesi — your photo, bio and everything you have
          posted, all on one shareable page.
        </p>
      </div>

      {user.username ? (
        <Card className="flex flex-wrap items-center justify-between gap-3 bg-gradient-to-r from-indigo-50 to-fuchsia-50">
          <span className="text-sm text-slate-700">
            Live at{" "}
            <Link
              href={`/${user.username}`}
              className="font-semibold text-indigo-700 underline"
            >
              godesi.com/{user.username}
            </Link>
          </span>
          <Link
            href={`/${user.username}`}
            className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
          >
            View my profile
          </Link>
        </Card>
      ) : null}

      <Card>
        <PersonalProfileForm
          profile={{
            name: user.name,
            username: user.username ?? "",
            bio: user.bio,
            location: user.location,
            avatarUrl: user.avatarUrl,
          }}
          suggestedUsername={suggested}
        />
      </Card>
    </div>
  );
}
