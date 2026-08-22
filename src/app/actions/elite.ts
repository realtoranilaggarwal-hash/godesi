"use server";

import { revalidatePath } from "next/cache";
import { pingIndexNowInBackground } from "@/lib/indexNow";
import { redirect } from "next/navigation";
import { z } from "zod";
import type { EliteBadge, EliteStatus } from "@prisma/client";
import { db } from "@/lib/db";
import { requireUser, requireStaff } from "@/lib/auth";
import { type ActionState, fieldError } from "@/lib/actions";
import { notify } from "@/lib/notifications";
import { sendEmail, shell } from "@/lib/email";
import { normalizeWhatsApp, siteUrl, whatsappLink } from "@/lib/format";
import { isSupportedVideoUrl } from "@/lib/video";
import {
  INTERVIEW_TYPES,
  ELITE_CATEGORIES,
  elitePackageOrThrow,
  uniqueEliteSlug,
} from "@/lib/elite";
import { getStripe, stripeEnabled } from "@/lib/stripe";
import { termEnd } from "@/lib/billing";
import { BUNDLE_MONTHS } from "@/lib/bundles";

const optionalUrl = z
  .string()
  .trim()
  .url("Enter a full URL starting with https://")
  .optional()
  .or(z.literal("").transform(() => undefined));

const schema = z.object({
  fullName: z.string().trim().min(3, "Full name is required"),
  businessName: z.string().trim().max(120).optional(),
  category: z
    .string()
    .trim()
    .refine((value) => ELITE_CATEGORIES.includes(value), "Choose a category"),
  city: z.string().trim().min(2, "Which city?"),
  state: z.string().trim().max(80).optional(),
  country: z.string().trim().max(80).optional(),
  shortBio: z
    .string()
    .trim()
    .min(60, "Write at least a couple of sentences about yourself")
    .max(2200, "Keep the bio under about 300 words"),
  achievements: z.string().trim().max(2000).optional(),
  yearsExperience: z.coerce
    .number()
    .int()
    .min(0)
    .max(80)
    .optional()
    .or(z.literal("").transform(() => undefined)),
  websiteUrl: optionalUrl,
  videoUrl: optionalUrl,
  photoUrl: optionalUrl,
  contactPhone: z.string().trim().max(30).optional(),
  contactEmail: z
    .string()
    .trim()
    .email("Enter a valid email")
    .optional()
    .or(z.literal("").transform(() => undefined)),
  nominationType: z.enum(["SELF", "OTHER"]),
  nomineeName: z.string().trim().max(120).optional(),
  nomineeContact: z.string().trim().max(160).optional(),
});

/** Members apply for themselves, or nominate somebody else for recognition. */
export async function submitEliteAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const user = await requireUser();
    const parsed = schema.safeParse({
      fullName: formData.get("fullName"),
      businessName: formData.get("businessName") || undefined,
      category: formData.get("category"),
      city: formData.get("city"),
      state: formData.get("state") || undefined,
      country: formData.get("country") || undefined,
      shortBio: formData.get("shortBio"),
      achievements: formData.get("achievements") || undefined,
      yearsExperience: formData.get("yearsExperience") || undefined,
      websiteUrl: formData.get("websiteUrl") || undefined,
      videoUrl: formData.get("videoUrl") || undefined,
      photoUrl: formData.get("photoUrl") || undefined,
      contactPhone: formData.get("contactPhone") || undefined,
      contactEmail: formData.get("contactEmail") || undefined,
      nominationType:
        formData.get("nominationType") === "OTHER" ? "OTHER" : "SELF",
      nomineeName: formData.get("nomineeName") || undefined,
      nomineeContact: formData.get("nomineeContact") || undefined,
    });
    if (!parsed.success) return { error: parsed.error.issues[0].message };
    const data = parsed.data;

    if (data.nominationType === "OTHER" && !data.nomineeName) {
      return { error: "Tell us who you are nominating." };
    }
    if (data.videoUrl && !isSupportedVideoUrl(data.videoUrl)) {
      return { error: "Video must be a YouTube or Vimeo link." };
    }

    const interviewTypes = formData
      .getAll("interviewTypes")
      .map(String)
      .filter((value) => INTERVIEW_TYPES.includes(value));
    const socialLinks = String(formData.get("socialLinks") ?? "")
      .split(/[\s,]+/)
      .map((value) => value.trim())
      .filter((value) => value.startsWith("http"))
      .slice(0, 8);
    const proofUrls = [
      ...formData.getAll("proofUrls").map(String),
      ...String(formData.get("mediaLinks") ?? "").split(/[\s,]+/),
    ]
      .map((value) => value.trim())
      .filter((value) => value.startsWith("http"))
      .slice(0, 10);

    const name =
      data.nominationType === "OTHER" ? data.nomineeName! : data.fullName;
    const existing =
      data.nominationType === "SELF"
        ? await db.eliteEntry.findFirst({
            where: { userId: user.id, nominationType: "SELF" },
          })
        : null;
    if (existing) {
      return {
        error:
          "You already have a GoDesi Elite application — check its status on your dashboard.",
      };
    }

    // An interview bought inside an upgrade package is credited on the first
    // application, so they never pay for it twice.
    const prepaid = data.nominationType === "SELF" && user.elitePrepaid;

    const entry = await db.eliteEntry.create({
      data: {
        interviewPaid: prepaid,
        eliteUntil: prepaid ? termEnd(BUNDLE_MONTHS) : null,
        slug: await uniqueEliteSlug(name, data.city),
        userId: data.nominationType === "SELF" ? user.id : null,
        nominatedById: data.nominationType === "OTHER" ? user.id : null,
        fullName: name,
        businessName: data.businessName ?? null,
        category: data.category,
        city: data.city,
        state: data.state ?? null,
        country: data.country ?? null,
        profileUrl: user.username ? `${siteUrl()}/${user.username}` : null,
        shortBio: data.shortBio,
        achievements: data.achievements ?? null,
        yearsExperience:
          typeof data.yearsExperience === "number"
            ? data.yearsExperience
            : null,
        websiteUrl: data.websiteUrl ?? null,
        videoUrl: data.videoUrl ?? null,
        photoUrl: data.photoUrl ?? null,
        socialLinks,
        proofUrls,
        interviewTypes,
        contactPhone: data.contactPhone
          ? normalizeWhatsApp(data.contactPhone)
          : null,
        contactEmail: data.contactEmail ?? null,
        nominationType: data.nominationType,
        nomineeName: data.nomineeName ?? null,
        nomineeContact: data.nomineeContact ?? null,
      },
    });

    if (prepaid) {
      await db.user.update({
        where: { id: user.id },
        data: { elitePrepaid: false },
      });
    }

    revalidatePath("/admin/desi-elite");
    revalidatePath("/dashboard");

    if (data.nominationType === "OTHER") {
      const applyUrl = `${siteUrl()}/desi-elite/apply`;
      const invite = `${name} — you have been nominated for GoDesi Elite on Godesi. Complete your profile here: ${applyUrl}`;
      if (data.nomineeContact?.includes("@")) {
        await sendEmail({
          to: data.nomineeContact,
          subject: "You have been nominated for GoDesi Elite",
          html: shell("You have been nominated", `<p>${invite}</p>`),
        }).catch(() => undefined);
      }
      return {
        success: `Thanks! We've noted the nomination for ${name}. Share this invite: ${
          data.nomineeContact && !data.nomineeContact.includes("@")
            ? whatsappLink(data.nomineeContact, invite)
            : applyUrl
        }`,
      };
    }

    await notify({
      userId: user.id,
      title: "GoDesi Elite application received",
      body: "Our team reviews applications and will contact you about the interview.",
      href: "/dashboard",
    });

    return {
      success: `Application received for ${entry.fullName}! Our team reviews every entry and will contact you about the interview.`,
    };
  } catch (error) {
    return fieldError(error);
  }
}

/** Dismisses (or records) the "want to be featured?" prompt. */
/**
 * Elite fees are one-time purchases in USD: the interview, the professional
 * film and placement boosts. Stripe confirms them through the webhook.
 */
export async function startEliteCheckoutAction(formData: FormData) {
  const user = await requireUser();
  const entryId = String(formData.get("entryId") ?? "");
  const item = elitePackageOrThrow(String(formData.get("packageId") ?? ""));

  const entry = await db.eliteEntry.findFirst({
    where: { id: entryId, userId: user.id },
    select: { id: true, fullName: true },
  });
  if (!entry) redirect("/desi-elite/apply?error=not_found");
  if (!stripeEnabled()) redirect("/desi-elite/apply?error=stripe_unavailable");

  const amountMinor = item.usd * 100;
  const order = await db.eliteOrder.create({
    data: {
      entryId: entry.id,
      userId: user.id,
      packageId: item.id,
      amountMinor,
      currency: "USD",
    },
  });

  const session = await getStripe().checkout.sessions.create({
    mode: "payment",
    customer_email: user.email,
    client_reference_id: user.id,
    metadata: {
      kind: "elite",
      eliteOrderId: order.id,
      entryId: entry.id,
      userId: user.id,
    },
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "usd",
          unit_amount: amountMinor,
          product_data: {
            name: `GoDesi Elite — ${item.label}`,
            description: entry.fullName,
          },
        },
      },
    ],
    success_url: `${siteUrl()}/desi-elite/apply?paid={CHECKOUT_SESSION_ID}`,
    cancel_url: `${siteUrl()}/desi-elite/apply?error=cancelled`,
  });

  if (!session.url) redirect("/desi-elite/apply?error=stripe_session");
  redirect(session.url);
}

export async function elitePromptAction(formData: FormData) {
  const user = await requireUser();
  const answer = String(formData.get("answer") ?? "");
  await db.user.update({
    where: { id: user.id },
    data: { elitePrompt: answer.slice(0, 20) || "LATER" },
  });
  revalidatePath("/dashboard");
}

export async function updateEliteAction(formData: FormData) {
  await requireStaff();
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "") as EliteStatus;
  const badge = String(formData.get("badge") ?? "") as EliteBadge;
  const interviewUrl = String(formData.get("interviewUrl") ?? "").trim();
  const assignedTo = String(formData.get("assignedTo") ?? "").trim();
  const adminNote = String(formData.get("adminNote") ?? "").trim();
  const videoUrl = String(formData.get("videoUrl") ?? "").trim();
  const awards = String(formData.get("awards") ?? "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(0, 12);
  const awardTitle = String(formData.get("awardTitle") ?? "").trim();
  const awardYearRaw = String(formData.get("awardYear") ?? "").trim();
  const videoPackage = String(formData.get("videoPackage") ?? "").trim();

  const entry = await db.eliteEntry.findUnique({ where: { id } });
  if (!entry) throw new Error("Entry not found");

  const updated = await db.eliteEntry.update({
    where: { id },
    data: {
      status,
      badge,
      interviewUrl: interviewUrl || null,
      assignedTo: assignedTo || null,
      adminNote: adminNote || null,
      videoUrl: videoUrl || entry.videoUrl,
      awards,
      awardTitle: awardTitle || null,
      awardYear: awardYearRaw ? Number(awardYearRaw) : null,
      videoPackage: videoPackage || entry.videoPackage,
      reviewedAt: new Date(),
      publishedAt:
        status === "PUBLISHED"
          ? (entry.publishedAt ?? new Date())
          : entry.publishedAt,
    },
  });

  if (entry.userId && status !== entry.status) {
    const messages: Partial<
      Record<EliteStatus, { title: string; body: string }>
    > = {
      APPROVED: {
        title: "Your GoDesi Elite application is approved",
        body: "Our team will contact you to arrange your interview.",
      },
      INTERVIEW_PENDING: {
        title: "GoDesi Elite interview being scheduled",
        body: "Watch for a call or WhatsApp message from our team.",
      },
      PUBLISHED: {
        title: "You are published in GoDesi Elite 🎉",
        body: "Your recognition profile is live.",
      },
      REJECTED: {
        title: "GoDesi Elite application update",
        body: "Your application was not accepted this time. You are welcome to reapply.",
      },
    };
    const message = messages[status];
    if (message) {
      await notify({
        userId: entry.userId,
        title: message.title,
        body: message.body,
        href:
          status === "PUBLISHED" ? `/desi-elite/${updated.slug}` : "/dashboard",
      });
      const owner = await db.user.findUnique({
        where: { id: entry.userId },
        select: { email: true },
      });
      if (owner?.email) {
        await sendEmail({
          to: owner.email,
          subject: message.title,
          html: shell(
            message.title,
            `<p>${message.body}</p><p><a href="${siteUrl()}/desi-elite">GoDesi Elite</a></p>`,
          ),
        }).catch(() => undefined);
      }
    }
  }

  revalidatePath("/admin/desi-elite");
  revalidatePath("/desi-elite");
  revalidatePath(`/desi-elite/${updated.slug}`);
  if (updated.status === "PUBLISHED")
    pingIndexNowInBackground(`/desi-elite/${updated.slug}`);
}

export async function deleteEliteAction(formData: FormData) {
  await requireStaff();
  const id = String(formData.get("id") ?? "");
  await db.eliteEntry.delete({ where: { id } });
  revalidatePath("/admin/desi-elite");
  revalidatePath("/desi-elite");
}
