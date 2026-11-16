"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireStaff, requireUser } from "@/lib/auth";
import { type ActionState, fieldError } from "@/lib/actions";
import { sendEmail, shell } from "@/lib/email";
import { siteUrl } from "@/lib/format";
import { SITE } from "@/lib/site";
import { notify } from "@/lib/notifications";
import { cleanOfferPhone } from "@/lib/offerInterests";
import {
  ambassadorPromoCode,
  newCampaignCode,
} from "@/lib/ambassadorPromo";
import {
  AMBASSADOR_HELP_IDS,
  AMBASSADOR_PLEDGE,
  parseJoinGoals,
} from "@/lib/joinGoals";

export async function saveJoinGoalsAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const user = await requireUser();
    const joinGoals = parseJoinGoals(formData.getAll("goals"));
    await db.user.update({
      where: { id: user.id },
      data: { joinGoals, joinGoalsAt: joinGoals.length ? new Date() : null },
    });
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/goals");
    return {
      success: joinGoals.length
        ? "Saved — your next steps are on your dashboard."
        : "Saved — nothing ticked.",
    };
  } catch (error) {
    return fieldError(error);
  }
}

/** Squashes case and spacing so "anil  Kumar" matches "Anil Kumar". */
function sameName(a: string, b: string) {
  const clean = (value: string) =>
    value.trim().toLowerCase().replace(/\s+/g, " ");
  return clean(a) === clean(b);
}

const ambassadorSchema = z.object({
  city: z.string().trim().min(2, "Which city or area will you cover?").max(80),
  pitch: z
    .string()
    .trim()
    .min(30, "Tell us a little more about why you want to represent GoDesi")
    .max(2000),
  signedName: z.string().trim().min(2, "Type your full name to sign").max(120),
  businessName: z.string().trim().max(120).optional(),
  socialUrl: z
    .string()
    .trim()
    .url("Enter a full link, e.g. https://instagram.com/yourpage")
    .max(300)
    .optional()
    .or(z.literal("").transform(() => undefined)),
});

/** Ambassador application on /ambassador; staff review it on /admin/ambassadors. */
export async function applyAmbassadorAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const user = await requireUser();
    const parsed = ambassadorSchema.safeParse({
      city: formData.get("city"),
      pitch: formData.get("pitch"),
      signedName: formData.get("signedName"),
      businessName: formData.get("businessName") ?? undefined,
      socialUrl: formData.get("socialUrl") ?? undefined,
    });
    if (!parsed.success) return { error: parsed.error.issues[0].message };
    const data = parsed.data;

    const ticked = new Set(formData.getAll("pledge").map(String));
    if (AMBASSADOR_PLEDGE.some((_, index) => !ticked.has(String(index))))
      return { error: "Please tick every line of the ethics pledge." };
    if (!sameName(data.signedName, user.name))
      return {
        error: `Sign with the name on your account: ${user.name}. You can change it on your profile.`,
      };

    const helps = formData
      .getAll("helps")
      .map(String)
      .filter((id) => AMBASSADOR_HELP_IDS.includes(id));
    const phone = cleanOfferPhone(formData.get("phone"));

    const existing = await db.ambassador.findUnique({
      where: { userId: user.id },
      select: { status: true },
    });
    if (existing?.status === "APPROVED")
      return { error: "You are already a GoDesi ambassador." };

    const fields = {
      city: data.city,
      phone,
      pitch: data.pitch,
      helps,
      signedName: data.signedName,
      businessName: data.businessName || null,
      socialUrl: data.socialUrl ?? null,
      pledgedAt: new Date(),
      status: "PENDING" as const,
    };
    const application = await db.ambassador.upsert({
      where: { userId: user.id },
      create: { userId: user.id, ...fields },
      // A reapplication can change business details, so they need review again.
      update: { ...fields, businessApprovedAt: null },
    });
    if (!user.joinGoals.includes("ambassador"))
      await db.user.update({
        where: { id: user.id },
        data: {
          joinGoals: [...user.joinGoals, "ambassador"],
          joinGoalsAt: new Date(),
        },
      });

    revalidatePath("/ambassador");
    revalidatePath("/admin/ambassadors");
    await sendEmail({
      to: SITE.supportEmail,
      subject: `GoDesi ambassador application: ${user.name} (${data.city})`,
      html: shell(
        "New ambassador application",
        `<p><b>${user.name}</b> · ${data.city} · ${user.email}${
          phone ? ` · ${phone}` : ""
        }</p><p>${data.pitch.replace(/\n/g, "<br>")}</p><p><a href="${siteUrl()}/admin/ambassadors#${application.id}">Open on the Ambassadors desk</a></p>`,
      ),
    }).catch(() => undefined);

    return {
      success:
        "Thanks — your pledge is signed. The GoDesi team will review your application and get back to you within a few days.",
    };
  } catch (error) {
    return fieldError(error);
  }
}

export async function reviewAmbassadorAction(formData: FormData) {
  await requireStaff();
  const id = String(formData.get("id") ?? "");
  const decision = String(formData.get("decision") ?? "");
  const adminNote = String(formData.get("adminNote") ?? "").trim() || null;
  if (!["APPROVED", "DECLINED", "PENDING"].includes(decision))
    throw new Error("Unknown decision");

  const current = await db.ambassador.findUniqueOrThrow({
    where: { id },
    include: {
      user: { select: { id: true, name: true, email: true, username: true } },
    },
  });

  if (decision === "APPROVED" && current.status !== "APPROVED") {
    const last = await db.ambassador.aggregate({
      _max: { certificateNo: true },
    });
    const certificateNo =
      current.certificateNo ?? (last._max.certificateNo ?? 0) + 1;
    await db.ambassador.update({
      where: { id },
      data: {
        status: "APPROVED",
        approvedAt: new Date(),
        certificateNo,
        promoCode:
          current.promoCode ??
          ambassadorPromoCode({ id, certificateNo }),
        adminNote,
      },
    });
    const certificate = `${siteUrl()}/ambassador/certificate/${id}`;
    await notify({
      userId: current.user.id,
      title: "🤝 You are now a GoDesi Local Ambassador",
      body: "Your badge is on your profile and your certificate is ready to print.",
      href: `/ambassador/certificate/${id}`,
    });
    await sendEmail({
      to: current.user.email,
      subject: "Welcome, GoDesi Local Ambassador",
      html: shell(
        "You are a GoDesi Local Ambassador",
        `<p>Congratulations ${current.user.name} — the GoDesi team has approved you as Local Ambassador for ${current.city}.</p><p>Your badge now shows on your profile. <a href="${certificate}">Open and print your certificate</a>.</p><p>Thank you for keeping the pledge you signed.</p>`,
      ),
    }).catch(() => undefined);
  } else {
    await db.ambassador.update({
      where: { id },
      data: {
        status: decision as "APPROVED" | "DECLINED" | "PENDING",
        adminNote,
        ...(decision === "APPROVED" ? {} : { approvedAt: null }),
      },
    });
  }

  revalidatePath("/admin/ambassadors");
  revalidatePath("/ambassador");
  if (current.user.username) revalidatePath(`/${current.user.username}`);
}

const businessSchema = z.object({
  businessName: z.string().trim().min(2, "Business name is required").max(120),
  socialUrl: z
    .string()
    .trim()
    .url("Enter a full link, e.g. https://instagram.com/yourpage")
    .max(300)
    .optional()
    .or(z.literal("").transform(() => undefined)),
  logoUrl: z
    .string()
    .trim()
    .max(500)
    .refine((value) => /^(https:\/\/|\/)/.test(value), "Upload the logo again")
    .optional()
    .or(z.literal("").transform(() => undefined)),
  businessInfo: z.string().trim().max(1000).optional(),
});

/** Approved ambassadors submit their business for the recognition wall; staff re-review every change. */
export async function saveAmbassadorBusinessAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const user = await requireUser();
    const ambassador = await db.ambassador.findUnique({
      where: { userId: user.id },
      select: { id: true, status: true },
    });
    if (ambassador?.status !== "APPROVED")
      return { error: "Only approved ambassadors can submit a business." };
    if (formData.get("notFinancial") !== "on")
      return {
        error:
          "Mortgage, real-estate and insurance businesses can't be featured through the ambassador program.",
      };
    const parsed = businessSchema.safeParse({
      businessName: formData.get("businessName"),
      socialUrl: formData.get("socialUrl") ?? undefined,
      logoUrl: formData.get("logoUrl") ?? undefined,
      businessInfo: formData.get("businessInfo") ?? undefined,
    });
    if (!parsed.success) return { error: parsed.error.issues[0].message };
    await db.ambassador.update({
      where: { id: ambassador.id },
      data: {
        businessName: parsed.data.businessName,
        socialUrl: parsed.data.socialUrl ?? null,
        logoUrl: parsed.data.logoUrl ?? null,
        businessInfo: parsed.data.businessInfo || null,
        businessApprovedAt: null,
      },
    });
    revalidatePath("/ambassador");
    revalidatePath("/ambassador/dashboard");
    revalidatePath("/admin/ambassadors");
    return {
      success:
        "Saved — the GoDesi team will review your business before it is featured.",
    };
  } catch (error) {
    return fieldError(error);
  }
}

export async function reviewAmbassadorBusinessAction(formData: FormData) {
  await requireStaff();
  const id = String(formData.get("id") ?? "");
  const approve = formData.get("approve") === "1";
  await db.ambassador.update({
    where: { id },
    data: { businessApprovedAt: approve ? new Date() : null },
  });
  revalidatePath("/admin/ambassadors");
  revalidatePath("/ambassador");
  revalidatePath("/ambassador/dashboard");
}

const campaignSchema = z.object({
  benefit: z.string().trim().max(300).optional(),
  eligibility: z.string().trim().max(500).optional(),
  rewardTickets: z
    .union([z.literal(""), z.coerce.number().int().min(1).max(1000)])
    .optional()
    .transform((value) => (typeof value === "number" ? value : null)),
});

function campaignFields(formData: FormData) {
  const parsed = campaignSchema.parse({
    benefit: formData.get("benefit") ?? undefined,
    eligibility: formData.get("eligibility") ?? undefined,
    rewardTickets: formData.get("rewardTickets") ?? undefined,
  });
  return {
    benefit: parsed.benefit || null,
    eligibility: parsed.eligibility || null,
    rewardTickets: parsed.rewardTickets,
  };
}

/**
 * Assigns an approved ambassador a tracked link for one event. Benefit and
 * eligibility text must be cleared by compliance before the campaign goes live.
 */
export async function createAmbassadorPromoAction(formData: FormData) {
  await requireStaff();
  const ambassadorId = String(formData.get("ambassadorId") ?? "");
  const eventId = String(formData.get("eventId") ?? "");
  const ambassador = await db.ambassador.findUniqueOrThrow({
    where: { id: ambassadorId },
    select: {
      id: true,
      status: true,
      certificateNo: true,
      promoCode: true,
      userId: true,
      user: { select: { name: true, email: true } },
    },
  });
  if (ambassador.status !== "APPROVED")
    throw new Error("Approve the ambassador first.");
  const event = await db.event.findUniqueOrThrow({
    where: { id: eventId },
    select: { id: true, title: true },
  });

  const promoCode = ambassador.promoCode ?? ambassadorPromoCode(ambassador);
  if (!ambassador.promoCode)
    await db.ambassador.update({
      where: { id: ambassador.id },
      data: { promoCode },
    });

  const fields = campaignFields(formData);
  const existing = await db.ambassadorPromoEvent.findUnique({
    where: { ambassadorId_eventId: { ambassadorId, eventId } },
    select: { id: true },
  });
  if (existing) {
    await db.ambassadorPromoEvent.update({
      where: { id: existing.id },
      data: { ...fields, active: true },
    });
  } else {
    let created = false;
    for (let attempt = 0; attempt < 5 && !created; attempt++) {
      try {
        await db.ambassadorPromoEvent.create({
          data: { code: newCampaignCode(promoCode), ambassadorId, eventId, ...fields },
        });
        created = true;
      } catch (error) {
        if (attempt === 4) throw error;
      }
    }
    await notify({
      userId: ambassador.userId,
      title: `📣 Your promo link for ${event.title} is ready`,
      body: "Share it and track clicks and tickets on your ambassador dashboard.",
      href: "/ambassador/dashboard",
    });
  }

  revalidatePath("/admin/ambassadors/campaigns");
  revalidatePath("/ambassador/dashboard");
}

export async function updateAmbassadorPromoAction(formData: FormData) {
  await requireStaff();
  const id = String(formData.get("id") ?? "");
  await db.ambassadorPromoEvent.update({
    where: { id },
    data: { ...campaignFields(formData), active: formData.get("active") === "on" },
  });
  revalidatePath("/admin/ambassadors/campaigns");
  revalidatePath("/ambassador/dashboard");
}

export async function deleteAmbassadorPromoAction(formData: FormData) {
  await requireStaff();
  const id = String(formData.get("id") ?? "");
  await db.ambassadorPromoEvent.delete({ where: { id } });
  revalidatePath("/admin/ambassadors/campaigns");
  revalidatePath("/ambassador/dashboard");
}
