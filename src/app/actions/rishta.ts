"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { normalizeWhatsApp } from "@/lib/format";
import { type ActionState, fieldError } from "@/lib/actions";
import { containsContactDetails, findBlockedTerm } from "@/lib/moderation";
import { storeImage, uploadsEnabled, validateImage } from "@/lib/uploads";
import { RISHTA_MIN_AGE } from "@/lib/rishta";

const optionalText = z
  .string()
  .trim()
  .max(80)
  .optional()
  .transform((value) => value || null);

const optionalIndex = (max: number) =>
  z
    .union([z.literal(""), z.coerce.number().int().min(0).max(max)])
    .optional()
    .transform((value) => (value === "" || value === undefined ? null : value));

const schema = z.object({
  postedBy: z.enum(["SELF", "PARENT", "SIBLING", "RELATIVE", "FRIEND"]),
  displayName: z.string().trim().min(2, "Enter a name for the profile").max(60),
  gender: z.enum(["WOMAN", "MAN"]),
  birthYear: z.coerce
    .number()
    .int()
    .min(1940, "Enter a valid birth year")
    .refine(
      (year) => new Date().getFullYear() - year >= RISHTA_MIN_AGE,
      `Rishta profiles are for adults ${RISHTA_MIN_AGE} and over`,
    ),
  heightCm: z
    .union([z.literal(""), z.coerce.number().int().min(120).max(230)])
    .optional()
    .transform((value) => (value === "" || value === undefined ? null : value)),
  maritalHistory: z.enum(["NEVER_MARRIED", "DIVORCED", "WIDOWED"]),
  religion: optionalText,
  community: optionalText,
  gotra: optionalText,
  motherTongue: optionalText,
  education: optionalText,
  profession: optionalText,
  city: z.string().trim().min(2, "Which city?").max(80),
  state: optionalText,
  country: optionalText,
  about: z
    .string()
    .trim()
    .min(40, "Write a few lines about them and the family")
    .max(1200, "Keep it under 1,200 characters"),
  moonSign: optionalIndex(11),
  nakshatra: optionalIndex(26),
  whatsapp: z.string().trim().optional(),
});

const text = (formData: FormData, key: string) =>
  formData.get(key) === null ? undefined : String(formData.get(key));

/** Creates or updates the member's Rishta profile; every save goes back to review. */
export async function saveRishtaProfileAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const user = await requireUser();
    const parsed = schema.safeParse({
      postedBy: text(formData, "postedBy"),
      displayName: text(formData, "displayName"),
      gender: text(formData, "gender"),
      birthYear: text(formData, "birthYear"),
      heightCm: text(formData, "heightCm"),
      maritalHistory: text(formData, "maritalHistory"),
      religion: text(formData, "religion"),
      community: text(formData, "community"),
      gotra: text(formData, "gotra"),
      motherTongue: text(formData, "motherTongue"),
      education: text(formData, "education"),
      profession: text(formData, "profession"),
      city: text(formData, "city"),
      state: text(formData, "state"),
      country: text(formData, "country"),
      about: text(formData, "about"),
      moonSign: text(formData, "moonSign"),
      nakshatra: text(formData, "nakshatra"),
      whatsapp: text(formData, "whatsapp") || undefined,
    });
    if (!parsed.success) return { error: parsed.error.issues[0].message };
    if (formData.get("consent") !== "on") {
      return {
        error:
          "Please confirm the person agrees to this profile and is 18 or older.",
      };
    }

    const { whatsapp, ...fields } = parsed.data;
    const blocked = findBlockedTerm(
      `${fields.displayName} ${fields.about} ${fields.profession ?? ""}`,
    );
    if (blocked) return { error: `Please remove "${blocked}".` };
    if (containsContactDetails(fields.about)) {
      return {
        error:
          "Keep phone numbers, emails and links out of the description — use the WhatsApp field instead.",
      };
    }

    const existing = await db.rishtaProfile.findUnique({
      where: { userId: user.id },
    });
    let photoUrl = existing?.photoUrl ?? null;
    const photo = formData.get("photo");
    if (photo instanceof File && photo.size > 0) {
      if (!uploadsEnabled())
        return { error: "Photo uploads are switched off." };
      const invalid = validateImage(photo);
      if (invalid) return { error: invalid };
      photoUrl = await storeImage({
        file: photo,
        folder: "rishta",
        ownerId: user.id,
      });
    }
    if (formData.get("removePhoto") === "on") photoUrl = null;

    const data = {
      ...fields,
      photoUrl,
      hidePhoto: formData.get("hidePhoto") === "on",
      whatsappNumber: whatsapp ? normalizeWhatsApp(whatsapp) : null,
      status: "PENDING" as const,
    };
    await db.rishtaProfile.upsert({
      where: { userId: user.id },
      create: { userId: user.id, ...data },
      update: data,
    });

    revalidatePath("/rishta");
    return {
      success:
        "Saved. The profile is queued for review and appears once approved.",
    };
  } catch (error) {
    return fieldError(error);
  }
}

export async function toggleRishtaVisibilityAction() {
  const user = await requireUser();
  const profile = await db.rishtaProfile.findUnique({
    where: { userId: user.id },
  });
  if (!profile) return;
  await db.rishtaProfile.update({
    where: { id: profile.id },
    data: { visible: !profile.visible },
  });
  revalidatePath("/rishta");
}

export async function deleteRishtaProfileAction() {
  const user = await requireUser();
  await db.rishtaProfile.deleteMany({ where: { userId: user.id } });
  revalidatePath("/rishta");
}

export async function reviewRishtaProfileAction(formData: FormData) {
  const user = await requireUser();
  if (user.role !== "ADMIN") throw new Error("FORBIDDEN");
  const id = String(formData.get("id") ?? "");
  const approve = String(formData.get("decision") ?? "") === "approve";
  await db.rishtaProfile.update({
    where: { id },
    data: { status: approve ? "APPROVED" : "REJECTED" },
  });
  revalidatePath("/rishta");
  revalidatePath("/admin/rishta");
}

export async function reportRishtaProfileAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const user = await requireUser();
    const profileId = String(formData.get("profileId") ?? "");
    const reason = String(formData.get("reason") ?? "")
      .trim()
      .slice(0, 300);
    if (!profileId) return { error: "Nothing to report." };
    if (reason.length < 5) return { error: "Tell us briefly what is wrong." };

    const profile = await db.rishtaProfile.findUnique({
      where: { id: profileId },
    });
    if (!profile) return { error: "That profile no longer exists." };
    if (profile.userId === user.id)
      return { error: "You cannot report your own profile." };

    await db.rishtaReport.upsert({
      where: { profileId_reporterId: { profileId, reporterId: user.id } },
      create: { profileId, reporterId: user.id, reason },
      update: { reason },
    });
    revalidatePath("/admin/rishta");
    return { success: "Thanks — our team will review this profile." };
  } catch (error) {
    return fieldError(error);
  }
}

export async function dismissRishtaReportsAction(formData: FormData) {
  const user = await requireUser();
  if (user.role !== "ADMIN") throw new Error("FORBIDDEN");
  const profileId = String(formData.get("id") ?? "");
  await db.rishtaReport.deleteMany({ where: { profileId } });
  revalidatePath("/admin/rishta");
}
