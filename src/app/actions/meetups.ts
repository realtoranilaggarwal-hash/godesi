"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { normalizeWhatsApp } from "@/lib/format";
import { type ActionState, fieldError } from "@/lib/actions";
import { containsContactDetails, findBlockedTerm } from "@/lib/moderation";
import {
  INTENT_LABELS,
  MEETUP_MAX_AGE,
  MEETUP_MIN_AGE,
  roundCoord,
} from "@/lib/meetups";

const schema = z.object({
  displayName: z.string().trim().min(2, "What should people call you?").max(60),
  age: z.coerce
    .number()
    .int()
    .min(MEETUP_MIN_AGE, "Connect is for adults 18 and over")
    .max(MEETUP_MAX_AGE, "Enter a valid age")
    .optional(),
  gender: z.enum(["WOMAN", "MAN", "OTHER"]),
  marital: z.enum(["SINGLE", "MARRIED", "PREFER_NOT_SAY"]),
  city: z.string().trim().min(2, "Which city are you in?").max(80),
  state: z.string().trim().max(80).optional(),
  bio: z
    .string()
    .trim()
    .min(30, "Write a couple of lines about what you would like to meet about")
    .max(600, "Keep it under 600 characters"),
  whatsapp: z.string().trim().optional(),
});

/**
 * Creates or updates the member's own Connect profile. Every submission goes back
 * to review, so edited text cannot slip past moderation.
 */
export async function saveMeetupProfileAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const user = await requireUser();
    const parsed = schema.safeParse({
      displayName: formData.get("displayName"),
      age: formData.get("age") || undefined,
      gender: formData.get("gender"),
      marital: formData.get("marital"),
      city: formData.get("city"),
      state: formData.get("state") || undefined,
      bio: formData.get("bio"),
      whatsapp: formData.get("whatsapp") || undefined,
    });
    if (!parsed.success) return { error: parsed.error.issues[0].message };

    if (formData.get("adult") !== "on") {
      return { error: "Please confirm you are 18 or older." };
    }
    if (formData.get("risk") !== "on") {
      return {
        error:
          "Please accept that you meet people at your own risk and will do your own checks.",
      };
    }

    const intents = formData
      .getAll("intents")
      .map((value) => String(value))
      .filter((value) => value in INTENT_LABELS);
    if (!intents.length) return { error: "Pick at least one thing you are open to." };

    const blocked = findBlockedTerm(
      `${parsed.data.displayName} ${parsed.data.bio} ${parsed.data.city}`,
    );
    if (blocked) {
      return {
        error: `Connect is for business, coffee and friendly chats only — please remove "${blocked}".`,
      };
    }
    if (containsContactDetails(parsed.data.bio)) {
      return {
        error:
          "Please keep phone numbers, emails and links out of your description — add your WhatsApp number in its own field instead.",
      };
    }

    const data = {
      displayName: parsed.data.displayName,
      age: parsed.data.age ?? null,
      adultConfirmedAt: new Date(),
      riskAcceptedAt: new Date(),
      gender: parsed.data.gender,
      marital: parsed.data.marital,
      city: parsed.data.city,
      state: parsed.data.state ?? null,
      intents: intents.join(","),
      bio: parsed.data.bio,
      whatsappNumber: parsed.data.whatsapp
        ? normalizeWhatsApp(parsed.data.whatsapp)
        : null,
      visiting: formData.get("visiting") === "on",
      status: "PENDING" as const,
    };

    await db.meetupProfile.upsert({
      where: { userId: user.id },
      create: { userId: user.id, ...data },
      update: data,
    });

    revalidatePath("/connect");
    return {
      success:
        "Thanks! Your Connect profile is queued for review and goes live once approved.",
    };
  } catch (error) {
    return fieldError(error);
  }
}

/**
 * Stores the member's approximate location so travellers and newcomers can find
 * people near them. Coordinates are rounded to roughly a kilometre and are only
 * saved when the member asks for it.
 */
export async function shareMeetupLocationAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const user = await requireUser();
    const latitude = Number(formData.get("latitude"));
    const longitude = Number(formData.get("longitude"));
    if (
      !Number.isFinite(latitude) ||
      !Number.isFinite(longitude) ||
      Math.abs(latitude) > 90 ||
      Math.abs(longitude) > 180
    ) {
      return { error: "We could not read your location — please try again." };
    }

    const profile = await db.meetupProfile.findUnique({
      where: { userId: user.id },
    });
    if (!profile) {
      return {
        error: "Create your Connect profile first, then share your location.",
      };
    }

    await db.meetupProfile.update({
      where: { id: profile.id },
      data: {
        latitude: roundCoord(latitude),
        longitude: roundCoord(longitude),
        locationSharedAt: new Date(),
      },
    });

    revalidatePath("/connect");
    return {
      success:
        "Shared. Members nearby can now see roughly how far away you are — never your exact address.",
    };
  } catch (error) {
    return fieldError(error);
  }
}

/** Turns "friends near me" off again and forgets the stored coordinates. */
export async function stopSharingMeetupLocationAction() {
  const user = await requireUser();
  await db.meetupProfile.updateMany({
    where: { userId: user.id },
    data: { latitude: null, longitude: null, locationSharedAt: null },
  });
  revalidatePath("/connect");
}

/** Members can hide their own profile without deleting it. */
export async function toggleMeetupVisibilityAction() {
  const user = await requireUser();
  const profile = await db.meetupProfile.findUnique({ where: { userId: user.id } });
  if (!profile) return;

  await db.meetupProfile.update({
    where: { id: profile.id },
    data: { visible: !profile.visible },
  });

  revalidatePath("/connect");
}

export async function deleteMeetupProfileAction() {
  const user = await requireUser();
  await db.meetupProfile.deleteMany({ where: { userId: user.id } });
  revalidatePath("/connect");
}

export async function reportMeetupProfileAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const user = await requireUser();
    const profileId = String(formData.get("profileId") ?? "");
    const reason = String(formData.get("reason") ?? "").trim().slice(0, 300);
    if (!profileId) return { error: "Nothing to report." };
    if (reason.length < 5) return { error: "Tell us briefly what is wrong." };

    const profile = await db.meetupProfile.findUnique({ where: { id: profileId } });
    if (!profile) return { error: "That profile no longer exists." };
    if (profile.userId === user.id) return { error: "You cannot report yourself." };

    await db.meetupReport.upsert({
      where: { profileId_reporterId: { profileId, reporterId: user.id } },
      create: { profileId, reporterId: user.id, reason },
      update: { reason },
    });

    revalidatePath("/admin");
    return { success: "Thanks — our team will review this profile." };
  } catch (error) {
    return fieldError(error);
  }
}

export async function reviewMeetupProfileAction(formData: FormData) {
  const user = await requireUser();
  if (user.role !== "ADMIN") throw new Error("FORBIDDEN");

  const id = String(formData.get("id") ?? "");
  const approve = String(formData.get("decision") ?? "") === "approve";

  await db.meetupProfile.update({
    where: { id },
    data: { status: approve ? "APPROVED" : "REJECTED" },
  });

  revalidatePath("/connect");
  revalidatePath("/admin");
}
