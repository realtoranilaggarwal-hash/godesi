import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { suggestUsername } from "@/lib/profiles";
import { PersonalProfileForm } from "@/components/forms/PersonalProfileForm";
import { PERSONAL_SOCIALS } from "@/lib/personalProfile";
import { Card } from "@/components/ui";
import { SidebarBanners } from "@/components/Banners";
import { alumniFor } from "@/lib/alumniQueries";
import { SignOutButton } from "@/components/SignOutButton";
import { EarnStrip } from "@/components/EarnStrip";
import { pointValues, wallet } from "@/lib/rewardsQueries";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "My profile" };

export default async function PersonalProfilePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const suggested =
    user.username ?? (await suggestUsername(user.name, user.email));
  const [balance, points] = await Promise.all([
    wallet(user.id),
    pointValues(),
  ]);
  const alumni = (await alumniFor(user.id)).map((row) => ({
    institution: row.institution,
    degree: row.degree ?? "",
    fieldOfStudy: row.fieldOfStudy ?? "",
    city: row.city ?? "",
    endYear: row.endYear ? String(row.endYear) : "",
    current: row.current,
  }));

  return (
    <div className="flex justify-center gap-6">
      <div className="min-w-0 max-w-3xl flex-1 space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold">My personal profile</h1>
            <p className="text-sm text-slate-600">
              This is the social side of Godesi — your photo, bio and everything
              you have posted, all on one shareable page. Fill in a handle, a
              headline and your skills and you are listed free in{" "}
              <Link
                href="/professionals"
                className="font-semibold text-indigo-600 underline"
              >
                GoDesi Professionals
              </Link>
              .
            </p>
          </div>
          <SignOutButton />
        </div>

        <EarnStrip
          user={user}
          balance={balance.balance}
          signupPoints={points.REFERRAL_SIGNUP}
          profilePoints={points.PROFILE_CREATED}
        />

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
              headline: user.headline,
              lookingFor: user.lookingFor,
              education: user.education,
              experience: user.experience,
              skills: user.skills,
              languages: user.languages,
              videoUrls: user.videoUrls,
              openToWork: user.openToWork,
              whatsappNumber: user.whatsappNumber,
              alumni,
              socials: Object.fromEntries(
                PERSONAL_SOCIALS.map((social) => [
                  social.key,
                  user[social.key],
                ]),
              ),
            }}
            suggestedUsername={suggested}
          />
        </Card>
      </div>

      <SidebarBanners />
    </div>
  );
}
