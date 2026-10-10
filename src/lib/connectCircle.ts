import type { MeetupProfile } from "@prisma/client";
import { db } from "@/lib/db";
import { listClubs } from "@/lib/clubQueries";
import {
  ageRangeById,
  distanceKm,
  matchReason,
  parseIntents,
} from "@/lib/meetups";

const KM_PER_MILE = 1.609;

type CircleProfile = Pick<
  MeetupProfile,
  | "id"
  | "city"
  | "intents"
  | "interests"
  | "ageRange"
  | "meetRadiusMiles"
  | "latitude"
  | "longitude"
>;

function sameCity(a: string, b: string) {
  return a.trim().toLowerCase() === b.trim().toLowerCase();
}

/**
 * Approved members ranked for this member: shared interests count most, then
 * shared intents, then living in the same city. Their age-range and distance
 * preferences filter the list; members who have not shared an age are kept.
 */
export async function circleMatches(profile: CircleProfile, take = 6) {
  const candidates = await db.meetupProfile.findMany({
    where: { status: "APPROVED", visible: true, id: { not: profile.id } },
    orderBy: { updatedAt: "desc" },
    take: 400,
    include: {
      user: { select: { name: true, username: true, avatarUrl: true } },
    },
  });

  const ages = ageRangeById(profile.ageRange);
  const myIntents = parseIntents(profile.intents);
  const here =
    profile.latitude !== null && profile.longitude !== null
      ? { latitude: profile.latitude, longitude: profile.longitude }
      : null;

  return candidates
    .flatMap((candidate) => {
      if (ages && candidate.age !== null) {
        if (candidate.age < ages.min || candidate.age > ages.max) return [];
      }
      const km =
        here && candidate.latitude !== null && candidate.longitude !== null
          ? distanceKm(here, {
              latitude: candidate.latitude,
              longitude: candidate.longitude,
            })
          : null;
      const local = sameCity(candidate.city, profile.city);
      if (profile.meetRadiusMiles) {
        const nearby =
          km !== null ? km <= profile.meetRadiusMiles * KM_PER_MILE : local;
        if (!nearby) return [];
      }

      const interests = candidate.interests.filter((slug) =>
        profile.interests.includes(slug),
      );
      const intents = parseIntents(candidate.intents).filter((id) =>
        myIntents.includes(id),
      );
      const score = interests.length * 3 + intents.length * 2 + (local ? 2 : 0);
      if (!interests.length && !intents.length) return [];
      return [
        {
          profile: candidate,
          km,
          score,
          reason: matchReason({ interests, intents }),
        },
      ];
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, take);
}

/** Clubs in the member's city, or online clubs, that match what they enjoy. */
export async function circleClubs(profile: CircleProfile, take = 4) {
  const clubs = await listClubs({});
  return clubs
    .flatMap((club) => {
      const local = club.city ? sameCity(club.city, profile.city) : false;
      const liked = profile.interests.includes(club.category);
      if (!local && !(club.online && liked)) return [];
      return [
        {
          club,
          score: (local ? 2 : 0) + (liked ? 3 : 0) + (club.online ? 1 : 0),
        },
      ];
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, take)
    .map((row) => row.club);
}

/** The next approved events in the member's city. */
export function circleEvents(city: string, take = 3) {
  return db.event.findMany({
    where: {
      status: "APPROVED",
      startsAt: { gte: new Date() },
      city: { equals: city.trim(), mode: "insensitive" },
    },
    orderBy: { startsAt: "asc" },
    take,
    include: { category: { select: { name: true, icon: true, color: true } } },
  });
}
