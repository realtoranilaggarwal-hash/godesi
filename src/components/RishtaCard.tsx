import Link from "next/link";
import type { RishtaProfile } from "@prisma/client";
import { RASHIS } from "@/lib/kundliSigns";
import {
  ageFromBirthYear,
  heightLabel,
  POSTED_BY_LABELS,
  rishtaPhotoSrc,
} from "@/lib/rishta";
import { gunaVerdict } from "@/lib/gunaMilan";

export function RishtaPhoto({
  profile,
  canSee,
  className = "h-40",
}: {
  profile: Pick<
    RishtaProfile,
    "id" | "updatedAt" | "photoUrl" | "hidePhoto" | "displayName"
  >;
  canSee: boolean;
  className?: string;
}) {
  if (profile.photoUrl && canSee) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={rishtaPhotoSrc(profile)}
        alt={profile.displayName}
        className={`w-full rounded-xl object-cover ${className}`}
      />
    );
  }
  return (
    <div
      className={`flex w-full items-center justify-center rounded-xl bg-gradient-to-br from-rose-100 to-amber-100 text-center text-sm font-semibold text-rose-700 ${className}`}
    >
      {profile.photoUrl && profile.hidePhoto
        ? "🔒 Photo on request"
        : profile.photoUrl
          ? "🔒 Sign in to see the photo"
          : "💍 No photo yet"}
    </div>
  );
}

export function RishtaCard({
  profile,
  canSeePhoto,
  guna,
}: {
  profile: RishtaProfile;
  canSeePhoto: boolean;
  guna: number | null;
}) {
  const facts = [
    `${ageFromBirthYear(profile.birthYear)} yrs`,
    profile.heightCm ? heightLabel(profile.heightCm) : null,
    profile.city,
  ].filter(Boolean);
  return (
    <Link
      href={`/rishta/${profile.id}`}
      className="block rounded-2xl border border-rose-100 bg-gradient-to-b from-white to-rose-50/40 p-3 shadow-sm transition hover:border-rose-300 hover:shadow"
    >
      <RishtaPhoto profile={profile} canSee={canSeePhoto} />
      <p className="mt-2 font-bold text-slate-900">{profile.displayName}</p>
      <p className="text-xs text-slate-600">{facts.join(" · ")}</p>
      <p className="mt-1 line-clamp-1 text-xs text-slate-500">
        {[profile.religion, profile.community, profile.profession]
          .filter(Boolean)
          .join(" · ")}
      </p>
      <div className="mt-2 flex flex-wrap gap-1 text-[11px]">
        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-slate-600">
          Posted by {POSTED_BY_LABELS[profile.postedBy].toLowerCase()}
        </span>
        {profile.moonSign !== null ? (
          <span className="rounded-full bg-violet-100 px-2 py-0.5 text-violet-700">
            {RASHIS[profile.moonSign].name}
          </span>
        ) : null}
        {guna !== null ? (
          <span
            className="rounded-full bg-amber-100 px-2 py-0.5 font-semibold text-amber-800"
            title={gunaVerdict(guna)}
          >
            {guna}/36 gunas
          </span>
        ) : null}
      </div>
    </Link>
  );
}
