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
      pledgedAt: new Date(),
      status: "PENDING" as const,
    };
    const application = await db.ambassador.upsert({
      where: { userId: user.id },
      create: { userId: user.id, ...fields },
      update: fields,
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
