"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { getCurrentUser, requireStaff } from "@/lib/auth";
import { type ActionState, fieldError } from "@/lib/actions";
import { sendEmail, shell } from "@/lib/email";
import { siteUrl } from "@/lib/format";
import { SITE } from "@/lib/site";
import { MEDIA_APPLICATION_STATUSES, MEDIA_ROLE_IDS } from "@/lib/media";

const schema = z.object({
  name: z.string().trim().min(2, "Your name is required").max(120),
  email: z.string().trim().email("Enter a valid email"),
  phone: z.string().trim().max(30).optional(),
  city: z.string().trim().min(2, "Which city are you in?").max(80),
  languages: z.string().trim().max(200).optional(),
  experience: z
    .string()
    .trim()
    .min(40, "Tell us a little more about what you have done")
    .max(3000),
  availability: z.string().trim().max(300).optional(),
});

/** Join-the-team form on /media/join; lands on the admin Media desk. */
export async function applyToMediaTeamAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const parsed = schema.safeParse({
      name: formData.get("name"),
      email: formData.get("email"),
      phone: formData.get("phone") || undefined,
      city: formData.get("city"),
      languages: formData.get("languages") || undefined,
      experience: formData.get("experience"),
      availability: formData.get("availability") || undefined,
    });
    if (!parsed.success) return { error: parsed.error.issues[0].message };
    const data = parsed.data;

    const roles = formData
      .getAll("roles")
      .map(String)
      .filter((role) => MEDIA_ROLE_IDS.includes(role));
    if (!roles.length) return { error: "Pick at least one role." };

    const links = String(formData.get("links") ?? "")
      .split(/[\s,]+/)
      .map((value) => value.trim())
      .filter((value) => /^https?:\/\//.test(value))
      .slice(0, 6);

    const user = await getCurrentUser();
    const application = await db.mediaApplication.create({
      data: {
        userId: user?.id ?? null,
        name: data.name,
        email: data.email,
        phone: data.phone ?? null,
        city: data.city,
        roles,
        languages: data.languages ?? null,
        experience: data.experience,
        links,
        availability: data.availability ?? null,
      },
    });

    revalidatePath("/admin/media");
    await sendEmail({
      to: SITE.supportEmail,
      subject: `GoDesi Media team: ${data.name} (${roles.join(", ")})`,
      html: shell(
        "New team application",
        `<p><b>${data.name}</b> · ${data.city} · ${data.email}${
          data.phone ? ` · ${data.phone}` : ""
        }</p><p>Roles: ${roles.join(", ")}</p><p>${data.experience.replace(
          /\n/g,
          "<br>",
        )}</p><p><a href="${siteUrl()}/admin/media#${application.id}">Open on the Media desk</a></p>`,
      ),
    }).catch(() => undefined);
    await sendEmail({
      to: data.email,
      subject: "Thanks for offering to join GoDesi Media",
      html: shell(
        "We have your application",
        `<p>Thanks ${data.name} — our team reads every application and will reach out from ${SITE.supportEmail} or WhatsApp within a few days.</p><p>Meanwhile, watch a couple of episodes: <a href="${siteUrl()}/media">GoDesi Media</a>.</p>`,
      ),
    }).catch(() => undefined);

    return {
      success:
        "Thanks! We read every application and will be in touch within a few days.",
    };
  } catch (error) {
    return fieldError(error);
  }
}

export async function updateMediaApplicationAction(formData: FormData) {
  await requireStaff();
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");
  const adminNote = String(formData.get("adminNote") ?? "").trim();
  if (
    !MEDIA_APPLICATION_STATUSES.includes(
      status as (typeof MEDIA_APPLICATION_STATUSES)[number],
    )
  )
    throw new Error("Unknown status");
  await db.mediaApplication.update({
    where: { id },
    data: { status, adminNote: adminNote || null },
  });
  revalidatePath("/admin/media");
}
