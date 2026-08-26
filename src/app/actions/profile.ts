"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { type ActionState, fieldError } from "@/lib/actions";
import { normalizeUsername, usernameError } from "@/lib/profiles";
import {
  PERSONAL_SOCIALS,
  splitLines,
  splitTags,
  type PersonalSocialKey,
} from "@/lib/personalProfile";
import { isSupportedVideoUrl } from "@/lib/video";
import { institutionSlug, MIN_YEAR } from "@/lib/alumni";

const optionalUrl = z
  .string()
  .trim()
  .url("Check your links — each one needs to start with https://")
  .optional()
  .or(z.literal("").transform(() => undefined));

const schema = z.object({
  name: z.string().trim().min(2, "Your name is required"),
  username: z.string().trim().min(3, "Pick a username"),
  bio: z.string().trim().max(500, "Keep your bio under 500 characters").optional(),
  location: z.string().trim().max(120).optional(),
  headline: z.string().trim().max(120).optional(),
  lookingFor: z.string().trim().max(500).optional(),
  education: z.string().trim().max(800).optional(),
  experience: z.string().trim().max(1200).optional(),
  whatsappNumber: z.string().trim().max(30).optional(),
  avatarUrl: z
    .string()
    .trim()
    .url("Upload a photo or paste a valid image URL")
    .optional()
    .or(z.literal("").transform(() => undefined)),
});

export async function savePersonalProfileAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const user = await requireUser();
    const value = (key: string) => String(formData.get(key) ?? "");

    const parsed = schema.safeParse({
      name: value("name"),
      username: value("username"),
      bio: value("bio"),
      location: value("location"),
      headline: value("headline"),
      lookingFor: value("lookingFor"),
      education: value("education"),
      experience: value("experience"),
      whatsappNumber: value("whatsappNumber"),
      avatarUrl: value("avatarUrl"),
    });
    if (!parsed.success) return { error: parsed.error.issues[0].message };

    const socials: Partial<Record<PersonalSocialKey, string | null>> = {};
    for (const social of PERSONAL_SOCIALS) {
      const link = optionalUrl.safeParse(value(social.key));
      if (!link.success) {
        return { error: `${social.label}: ${link.error.issues[0].message}` };
      }
      socials[social.key] = link.data ?? null;
    }

    const videoUrls = splitLines(value("videoUrls"), 3);
    const badVideo = videoUrls.find((url) => !isSupportedVideoUrl(url));
    if (badVideo) {
      return { error: "Videos must be YouTube or Vimeo links, one per line." };
    }

    const username = normalizeUsername(parsed.data.username);
    const invalid = usernameError(username);
    if (invalid) return { error: invalid };

    const taken = await db.user.findUnique({
      where: { username },
      select: { id: true },
    });
    if (taken && taken.id !== user.id) {
      return { error: "That username is already taken — try another." };
    }

    const schools = formData.getAll("alumniInstitution").map(String);
    const degrees = formData.getAll("alumniDegree").map(String);
    const fields = formData.getAll("alumniField").map(String);
    const cities = formData.getAll("alumniCity").map(String);
    const years = formData.getAll("alumniYear").map(String);
    const thisYear = new Date().getFullYear();
    const alumni: {
      institution: string;
      slug: string;
      degree: string | null;
      fieldOfStudy: string | null;
      city: string | null;
      endYear: number | null;
      current: boolean;
    }[] = [];
    for (let index = 0; index < schools.length; index += 1) {
      const institution = schools[index].trim().slice(0, 120);
      if (!institution) continue;
      const year = Number.parseInt(years[index] ?? "", 10);
      if (years[index] && (Number.isNaN(year) || year < MIN_YEAR || year > thisYear + 8)) {
        return { error: `Check the year for ${institution}.` };
      }
      alumni.push({
        institution,
        slug: institutionSlug(institution),
        degree: (degrees[index] ?? "").trim().slice(0, 80) || null,
        fieldOfStudy: (fields[index] ?? "").trim().slice(0, 80) || null,
        city: (cities[index] ?? "").trim().slice(0, 80) || null,
        endYear: Number.isNaN(year) ? null : year,
        current: Number.isNaN(year) ? true : year > thisYear,
      });
    }

    const previous = user.username;
    await db.user.update({
      where: { id: user.id },
      data: {
        name: parsed.data.name,
        username,
        bio: parsed.data.bio || null,
        location: parsed.data.location || null,
        headline: parsed.data.headline || null,
        lookingFor: parsed.data.lookingFor || null,
        education: parsed.data.education || null,
        experience: parsed.data.experience || null,
        whatsappNumber: parsed.data.whatsappNumber || null,
        openToWork: formData.get("openToWork") === "on",
        skills: splitTags(value("skills")),
        languages: splitTags(value("languages"), 10),
        videoUrls,
        avatarUrl: parsed.data.avatarUrl ?? null,
        ...socials,
      },
    });

    await db.$transaction([
      db.alumniRecord.deleteMany({ where: { userId: user.id } }),
      ...(alumni.length
        ? [
            db.alumniRecord.createMany({
              data: alumni.map((entry) => ({ ...entry, userId: user.id })),
            }),
          ]
        : []),
    ]);

    revalidatePath("/dashboard/me");
    revalidatePath("/alumni");
    revalidatePath(`/${username}`);
    if (previous && previous !== username) revalidatePath(`/${previous}`);
    return { success: `Saved. Your profile is live at godesi.com/${username}` };
  } catch (error) {
    return fieldError(error);
  }
}

/** Takes a handle for the signed-in member straight from the claim page. */
export async function claimHandleAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const user = await requireUser();
    const username = normalizeUsername(String(formData.get("username") ?? ""));
    const invalid = usernameError(username);
    if (invalid) return { error: invalid };

    const taken = await db.user.findUnique({
      where: { username },
      select: { id: true },
    });
    if (taken) {
      return taken.id === user.id
        ? { success: `That is already yours — godesi.com/${username}` }
        : { error: "Someone claimed that one first — try another." };
    }

    const previous = user.username;
    await db.user.update({ where: { id: user.id }, data: { username } });

    revalidatePath("/dashboard/me");
    revalidatePath(`/${username}`);
    if (previous && previous !== username) revalidatePath(`/${previous}`);
    return { success: `Yours — your page is live at godesi.com/${username}` };
  } catch (error) {
    return fieldError(error);
  }
}
