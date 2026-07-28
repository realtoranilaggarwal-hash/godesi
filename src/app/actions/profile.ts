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

    revalidatePath("/dashboard/me");
    revalidatePath(`/${username}`);
    if (previous && previous !== username) revalidatePath(`/${previous}`);
    return { success: `Saved. Your profile is live at godesi.com/${username}` };
  } catch (error) {
    return fieldError(error);
  }
}
