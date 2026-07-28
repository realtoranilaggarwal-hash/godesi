"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import { requestCountry } from "@/lib/currency";
import { isStaff, requireUser } from "@/lib/auth";
import { normalizeWhatsApp } from "@/lib/format";
import { FAITHS, uniqueWorshipSlug } from "@/lib/worship";
import { type ActionState, fieldError } from "@/lib/actions";

const schema = z.object({
  faith: z.enum(FAITHS as [string, ...string[]]),
  name: z.string().trim().min(3, "Name of the temple, gurudwara, mosque or church"),
  description: z.string().trim().max(1200).optional(),
  address: z.string().trim().max(300).optional(),
  city: z.string().trim().min(2, "Which city?"),
  state: z.string().trim().max(80).optional(),
  country: z.string().trim().min(2, "Which country?"),
  whatsapp: z.string().trim().optional(),
  phone: z.string().trim().max(30).optional(),
  websiteUrl: z
    .string()
    .trim()
    .url("Enter a valid website URL")
    .optional()
    .or(z.literal("").transform(() => undefined)),
});

/** Admin submissions publish straight away; everyone else waits for approval. */
export async function submitWorshipAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  let destination: string | null = null;
  try {
    const user = await requireUser();
    const parsed = schema.safeParse({
      faith: formData.get("faith"),
      name: formData.get("name"),
      description: formData.get("description") || undefined,
      address: formData.get("address") || undefined,
      city: formData.get("city"),
      state: formData.get("state") || undefined,
      country: formData.get("country") || requestCountry(),
      whatsapp: formData.get("whatsapp") || undefined,
      phone: formData.get("phone") || undefined,
      websiteUrl: formData.get("websiteUrl") || undefined,
    });
    if (!parsed.success) return { error: parsed.error.issues[0].message };

    const images = formData
      .getAll("images")
      .map((value) => String(value).trim())
      .filter((value) => value.startsWith("https://"))
      .slice(0, 10);

    const isAdmin = isStaff(user);
    const place = await db.worshipPlace.create({
      data: {
        slug: await uniqueWorshipSlug(parsed.data.name, parsed.data.city),
        faith: parsed.data.faith as (typeof FAITHS)[number],
        name: parsed.data.name,
        description: parsed.data.description ?? null,
        address: parsed.data.address ?? null,
        city: parsed.data.city,
        state: parsed.data.state ?? null,
        country: parsed.data.country,
        whatsapp: parsed.data.whatsapp ? normalizeWhatsApp(parsed.data.whatsapp) : null,
        phone: parsed.data.phone ?? null,
        websiteUrl: parsed.data.websiteUrl ?? null,
        source: "user",
        status: isAdmin ? "APPROVED" : "PENDING",
        submittedById: user.id,
        images: { create: images.map((url, index) => ({ url, sortOrder: index })) },
      },
    });

    revalidatePath("/religious");
    if (isAdmin) destination = `/religious/${place.slug}`;
    else {
      return {
        success: "Thanks! Your listing is queued for review and goes live once approved.",
      };
    }
  } catch (error) {
    return fieldError(error);
  }
  redirect(destination);
}

export async function reviewWorshipAction(formData: FormData) {
  const user = await requireUser();
  if (!isStaff(user)) throw new Error("FORBIDDEN");

  const id = String(formData.get("id") ?? "");
  const approve = String(formData.get("decision") ?? "") === "approve";
  await db.worshipPlace.update({
    where: { id },
    data: { status: approve ? "APPROVED" : "REJECTED" },
  });

  revalidatePath("/religious");
  revalidatePath("/admin");
}
