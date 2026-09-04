"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireRole, requireStaff } from "@/lib/auth";
import { type ActionState, fieldError } from "@/lib/actions";
import { isPowerUpKey, POWER_UPS } from "@/lib/websiteBuilder";

const statusSchema = z.object({
  id: z.string().min(1),
  status: z.enum(["DRAFT", "PREVIEW", "APPROVED", "PAID", "LIVE", "CANCELLED"]),
  liveUrl: z.string().trim().url().optional().or(z.literal("")),
  staffNotes: z.string().trim().max(2000).optional(),
});

/** Staff move a project along (usually PAID → LIVE with the address) and keep notes. */
export async function updateWebsiteProjectAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    await requireStaff();
    const input = statusSchema.parse({
      id: formData.get("id"),
      status: formData.get("status"),
      liveUrl: formData.get("liveUrl") ?? "",
      staffNotes: formData.get("staffNotes") ?? "",
    });
    await db.websiteProject.update({
      where: { id: input.id },
      data: {
        status: input.status,
        liveUrl: input.liveUrl || null,
        staffNotes: input.staffNotes || null,
      },
    });
    revalidatePath("/admin/website");
    return { success: "Saved" };
  } catch (error) {
    return fieldError(error);
  }
}

/** Admins set a Power-Up's monthly price or switch it off; blank = back to default. */
export async function savePowerUpPricesAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    await requireRole("ADMIN");
    for (const powerUp of POWER_UPS) {
      const key = powerUp.key;
      if (!isPowerUpKey(key)) continue;
      const raw = String(formData.get(`price-${key}`) ?? "").trim();
      const active = formData.get(`active-${key}`) === "on";
      const price = raw === "" ? powerUp.monthlyUsd : Number(raw);
      if (!Number.isInteger(price) || price < 0 || price > 999) {
        return { error: `${powerUp.label}: whole dollars between 0 and 999.` };
      }
      await db.websitePowerUp.upsert({
        where: { key },
        create: { key, monthlyUsd: price, active },
        update: { monthlyUsd: price, active },
      });
    }
    revalidatePath("/admin/website");
    return { success: "Prices saved" };
  } catch (error) {
    return fieldError(error);
  }
}
