"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { type ActionState, fieldError } from "@/lib/actions";
import { toMinor } from "@/lib/format";
import { joinList } from "@/lib/agents";

const profileSchema = z.object({
  brokerage: z.string().trim().max(120).optional(),
  brokerageAddress: z.string().trim().max(240).optional(),
  brokerageWebsite: z
    .string()
    .trim()
    .url("Enter a valid brokerage website URL")
    .optional(),
  serviceAreas: z.string().trim().max(600).optional(),
  licenseNumber: z
    .string()
    .trim()
    .min(2, "Your real estate licence number is required")
    .max(60),
  licenseState: z.string().trim().max(60).optional(),
  licenseType: z.enum(["Salesperson", "Broker", "Broker Associate"]).optional(),
  licenseDocUrl: z.string().trim().url("Re-upload the licence document").optional(),
  mlsId: z.string().trim().max(60).optional(),
  mlsBoard: z.string().trim().max(120).optional(),
  designations: z.string().trim().max(300).optional(),
  awards: z.string().trim().max(300).optional(),
  yearsExperience: z.coerce.number().int().min(0).max(70).optional(),
  transactions: z.coerce.number().int().min(0).max(100_000).optional(),
  totalSales: z.coerce.number().min(0).optional(),
  avgPrice: z.coerce.number().min(0).optional(),
  currency: z.enum(["USD", "INR"]),
});

const saleSchema = z.object({
  soldOn: z.coerce.date(),
  address: z.string().trim().min(4, "Add the property address").max(160),
  price: z.coerce.number().min(1, "Add the sale price"),
  side: z.enum(["BUYER", "SELLER", "BOTH"]),
});

async function ownedBusiness() {
  const user = await requireUser();
  const business = await db.business.findUnique({ where: { ownerId: user.id } });
  if (!business) throw new Error("Create your business card first.");
  return business;
}

function optional(formData: FormData, key: string) {
  const value = formData.get(key);
  return value ? String(value) : undefined;
}

/** Saves the real estate credentials shown on an agent's public card. */
export async function saveAgentProfileAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const business = await ownedBusiness();

    const parsed = profileSchema.safeParse({
      brokerage: optional(formData, "brokerage"),
      brokerageAddress: optional(formData, "brokerageAddress"),
      brokerageWebsite: optional(formData, "brokerageWebsite"),
      serviceAreas: optional(formData, "serviceAreas"),
      licenseNumber: optional(formData, "licenseNumber") ?? "",
      licenseState: optional(formData, "licenseState"),
      licenseType: optional(formData, "licenseType"),
      licenseDocUrl: optional(formData, "licenseDocUrl"),
      mlsId: optional(formData, "mlsId"),
      mlsBoard: optional(formData, "mlsBoard"),
      designations: optional(formData, "designations"),
      awards: optional(formData, "awards"),
      yearsExperience: optional(formData, "yearsExperience"),
      transactions: optional(formData, "transactions"),
      totalSales: optional(formData, "totalSales"),
      avgPrice: optional(formData, "avgPrice"),
      currency: formData.get("currency") ?? "USD",
    });
    if (!parsed.success) return { error: parsed.error.issues[0].message };

    const languages = joinList([
      ...formData.getAll("languages").map(String),
      ...(optional(formData, "languagesOther") ?? "").split(","),
    ]);

    const data = {
      brokerage: parsed.data.brokerage ?? null,
      brokerageAddress: parsed.data.brokerageAddress ?? null,
      brokerageWebsite: parsed.data.brokerageWebsite ?? null,
      serviceAreas: joinList((parsed.data.serviceAreas ?? "").split(",")),
      licenseNumber: parsed.data.licenseNumber,
      licenseState: parsed.data.licenseState ?? null,
      licenseType: parsed.data.licenseType ?? null,
      licenseDocUrl: parsed.data.licenseDocUrl ?? null,
      mlsId: parsed.data.mlsId ?? null,
      mlsBoard: parsed.data.mlsBoard ?? null,
      languages,
      designations: joinList((parsed.data.designations ?? "").split(",")),
      awards: joinList((parsed.data.awards ?? "").split(",")),
      yearsExperience: parsed.data.yearsExperience ?? null,
      transactions: parsed.data.transactions ?? null,
      totalSalesMinor:
        parsed.data.totalSales === undefined ? null : toMinor(parsed.data.totalSales),
      avgPriceMinor:
        parsed.data.avgPrice === undefined ? null : toMinor(parsed.data.avgPrice),
      currency: parsed.data.currency,
    };

    await db.agentProfile.upsert({
      where: { businessId: business.id },
      create: { businessId: business.id, ...data },
      update: data,
    });

    revalidatePath("/dashboard/agent");
    revalidatePath(`/b/${business.slug}`);
    return { success: "Agent profile saved." };
  } catch (error) {
    return fieldError(error);
  }
}

export async function addAgentSaleAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const business = await ownedBusiness();
    const profile = await db.agentProfile.findUnique({
      where: { businessId: business.id },
    });
    if (!profile) return { error: "Save your agent profile first." };

    const parsed = saleSchema.safeParse({
      soldOn: formData.get("soldOn"),
      address: formData.get("address"),
      price: formData.get("price"),
      side: formData.get("side") ?? "SELLER",
    });
    if (!parsed.success) return { error: parsed.error.issues[0].message };

    await db.agentSale.create({
      data: {
        profileId: profile.id,
        soldOn: parsed.data.soldOn,
        address: parsed.data.address,
        priceMinor: toMinor(parsed.data.price),
        side: parsed.data.side,
      },
    });

    revalidatePath("/dashboard/agent");
    revalidatePath(`/b/${business.slug}`);
    return { success: "Sale added." };
  } catch (error) {
    return fieldError(error);
  }
}

export async function deleteAgentSaleAction(formData: FormData) {
  const business = await ownedBusiness();
  const profile = await db.agentProfile.findUnique({
    where: { businessId: business.id },
  });
  if (!profile) return;

  await db.agentSale.deleteMany({
    where: { id: String(formData.get("id") ?? ""), profileId: profile.id },
  });

  revalidatePath("/dashboard/agent");
  revalidatePath(`/b/${business.slug}`);
}
