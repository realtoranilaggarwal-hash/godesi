"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { type ActionState, fieldError } from "@/lib/actions";
import { requestCurrency } from "@/lib/currency";

const MAX_PACKAGES = 8;

const schema = z.object({
  name: z.string().min(3, "Name your package"),
  price: z.coerce.number().int().min(0).max(50_000_000),
  currency: z.enum(["INR", "USD"]).optional(),
  description: z.string().max(400).optional(),
  includes: z.string().max(800).optional(),
});

export async function addPackageAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const user = await requireUser();
    const business = await db.business.findUnique({ where: { ownerId: user.id } });
    if (!business) return { error: "Create your business profile first." };

    const parsed = schema.safeParse({
      name: formData.get("name"),
      price: formData.get("price") || 0,
      currency: formData.get("currency") || undefined,
      description: formData.get("description") || undefined,
      includes: formData.get("includes") || undefined,
    });
    if (!parsed.success) return { error: parsed.error.issues[0].message };

    const count = await db.vendorPackage.count({ where: { businessId: business.id } });
    if (count >= MAX_PACKAGES) {
      return { error: `You can list up to ${MAX_PACKAGES} packages.` };
    }

    await db.vendorPackage.create({
      data: {
        businessId: business.id,
        name: parsed.data.name,
        price: parsed.data.price,
        currency: parsed.data.currency ?? requestCurrency(),
        description: parsed.data.description ?? null,
        includes: parsed.data.includes ?? null,
        sortOrder: count,
      },
    });

    revalidatePath("/dashboard/packages");
    revalidatePath(`/b/${business.slug}`);
    return { success: "Package added." };
  } catch (error) {
    return fieldError(error);
  }
}

export async function deletePackageAction(formData: FormData) {
  const user = await requireUser();
  const id = String(formData.get("id") ?? "");
  const item = await db.vendorPackage.findUnique({
    where: { id },
    include: { business: { select: { ownerId: true, slug: true } } },
  });
  if (!item) return;
  if (item.business.ownerId !== user.id && user.role !== "ADMIN") {
    throw new Error("FORBIDDEN");
  }

  await db.vendorPackage.delete({ where: { id } });
  revalidatePath("/dashboard/packages");
  revalidatePath(`/b/${item.business.slug}`);
}
