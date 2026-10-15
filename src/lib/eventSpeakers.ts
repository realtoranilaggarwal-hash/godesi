import type { Prisma } from "@prisma/client";
import { publicProfileIds, type ProfileMatch } from "@/lib/peopleLookup";
import { eliteForFamousSpeaker } from "@/lib/famousPeople";

export type SpeakerInput = {
  name: string;
  bio: string | null;
  photoUrl: string | null;
  userId: string | null;
  eliteEntryId: string | null;
};

const MAX_SPEAKERS = 12;

/**
 * Repeated speaker rows; rows without a name are skipped. `keepElite` lists
 * the Elite profiles already linked to this event's speakers, so an edit keeps
 * those links without letting a form attach any other Elite profile.
 */
export async function readSpeakers(
  formData: FormData,
  keepElite: Set<string> = new Set(),
): Promise<SpeakerInput[]> {
  const read = (field: string) =>
    formData.getAll(field).map((value) => String(value).trim());
  const names = read("speakerName");
  const bios = read("speakerBio");
  const photos = read("speakerPhoto");
  const users = read("speakerUser");
  const famous = read("speakerWiki");
  const elite = read("speakerElite");
  const linkable = await publicProfileIds(users);

  const speakers: SpeakerInput[] = [];
  for (
    let index = 0;
    index < names.length && speakers.length < MAX_SPEAKERS;
    index += 1
  ) {
    if (!names[index]) continue;
    const userId = linkable.has(users[index]) ? users[index] : null;
    const keptElite =
      elite[index] && keepElite.has(elite[index]) ? elite[index] : null;
    speakers.push({
      name: names[index].slice(0, 120),
      bio: bios[index]?.slice(0, 600) || null,
      photoUrl: photos[index] || null,
      userId,
      eliteEntryId: userId
        ? null
        : famous[index]
          ? await eliteForFamousSpeaker(famous[index]).catch(() => null)
          : keptElite,
    });
  }
  return speakers;
}

/** What the edit forms load for each existing speaker. */
export const EDIT_SPEAKERS = {
  orderBy: { sortOrder: "asc" as const },
  select: {
    name: true,
    bio: true,
    photoUrl: true,
    eliteEntryId: true,
    user: {
      select: {
        id: true,
        name: true,
        username: true,
        avatarUrl: true,
        headline: true,
        location: true,
      },
    },
  },
} satisfies Prisma.EventSpeakerFindManyArgs;

export type SpeakerDefaults = {
  name: string;
  bio: string;
  photoUrl: string;
  eliteEntryId: string;
  profile: ProfileMatch | null;
};

export function speakerDefaults(
  rows: Prisma.EventSpeakerGetPayload<{
    select: typeof EDIT_SPEAKERS.select;
  }>[],
): SpeakerDefaults[] {
  return rows.map((row) => ({
    name: row.name,
    bio: row.bio ?? "",
    photoUrl: row.photoUrl ?? "",
    eliteEntryId: row.eliteEntryId ?? "",
    profile: row.user?.username ? row.user : null,
  }));
}
