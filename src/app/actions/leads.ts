"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { type ActionState, fieldError } from "@/lib/actions";
import { canUnlockLeads } from "@/lib/plans";
import {
  cleanServiceOptions,
  cleanSpecialties,
  missingChoiceGroups,
  specialtySet,
} from "@/lib/specialties";

const leadSchema = z.object({
  title: z.string().trim().min(5, "Give your requirement a clear title"),
  description: z.string().trim().min(20, "Describe your requirement (20+ characters)"),
  category: z.string().trim().min(2, "Category is required"),
  city: z.string().trim().min(2, "City is required"),
  budgetMin: z.coerce.number().int().min(0).optional(),
  budgetMax: z.coerce.number().int().min(0).optional(),
  eventDate: z.coerce.date().optional(),
  contactName: z.string().trim().min(2, "Contact name is required"),
  contactPhone: z.string().trim().min(10, "Enter a valid contact phone"),
  contactEmail: z
    .string()
    .trim()
    .email("Enter a valid email")
    .optional()
    .or(z.literal("").transform(() => undefined)),
});

export async function createLeadAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const user = await requireUser();
    const parsed = leadSchema.safeParse({
      title: formData.get("title"),
      description: formData.get("description"),
      category: formData.get("category"),
      city: formData.get("city"),
      budgetMin: formData.get("budgetMin") || undefined,
      budgetMax: formData.get("budgetMax") || undefined,
      eventDate: formData.get("eventDate") || undefined,
      contactName: formData.get("contactName") || user.name,
      contactPhone: formData.get("contactPhone"),
      contactEmail: formData.get("contactEmail"),
    });
    if (!parsed.success) return { error: parsed.error.issues[0].message };

    const categorySlug = String(formData.get("categorySlug") ?? "") || null;
    const set = specialtySet(categorySlug);
    const picked = [
      ...formData.getAll("serviceOptions").map(String),
      ...(set?.choices ?? [])
        .filter((group) => group.mode === "single")
        .map((group) => String(formData.get(`choice-${group.key}`) ?? "")),
    ].filter(Boolean);
    const serviceOptions = [
      ...cleanSpecialties(categorySlug, picked),
      ...cleanServiceOptions(categorySlug, picked),
    ];
    const missing = missingChoiceGroups(categorySlug, serviceOptions);
    if (missing.length) return { error: `${missing[0]}: pick an option.` };

    if (
      parsed.data.budgetMin !== undefined &&
      parsed.data.budgetMax !== undefined &&
      parsed.data.budgetMax < parsed.data.budgetMin
    ) {
      return { error: "Maximum budget must be greater than minimum budget." };
    }

    await db.lead.create({
      data: {
        clientId: user.id,
        title: parsed.data.title,
        description: parsed.data.description,
        category: parsed.data.category,
        categorySlug: set ? categorySlug : null,
        serviceOptions,
        city: parsed.data.city,
        budgetMin: parsed.data.budgetMin ?? null,
        budgetMax: parsed.data.budgetMax ?? null,
        eventDate: parsed.data.eventDate ?? null,
        contactName: parsed.data.contactName,
        contactPhone: parsed.data.contactPhone,
        contactEmail: parsed.data.contactEmail ?? null,
      },
    });
  } catch (error) {
    return fieldError(error);
  }
  revalidatePath("/leads");
  revalidatePath("/wedding/requirements");
  redirect("/dashboard?posted=1");
}

export async function unlockLeadAction(formData: FormData) {
  const user = await requireUser();
  const leadId = String(formData.get("leadId") ?? "");
  if (!canUnlockLeads(user)) {
    redirect("/pricing?reason=leads");
  }
  const lead = await db.lead.findUnique({ where: { id: leadId } });
  if (!lead) throw new Error("Lead not found");

  await db.leadUnlock.upsert({
    where: { leadId_userId: { leadId, userId: user.id } },
    create: { leadId, userId: user.id },
    update: {},
  });
  revalidatePath("/leads");
  revalidatePath(`/leads/${leadId}`);
}

export async function closeLeadAction(formData: FormData) {
  const user = await requireUser();
  const leadId = String(formData.get("leadId") ?? "");
  const lead = await db.lead.findUnique({ where: { id: leadId } });
  if (!lead || lead.clientId !== user.id) throw new Error("FORBIDDEN");
  await db.lead.update({ where: { id: leadId }, data: { status: "CLOSED" } });
  revalidatePath("/leads");
  revalidatePath("/dashboard");
}
