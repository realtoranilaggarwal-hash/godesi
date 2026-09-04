"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { type ActionState, fieldError } from "@/lib/actions";
import { getStripe, stripeEnabled } from "@/lib/stripe";
import { siteUrl } from "@/lib/format";
import {
  BASE_SETUP_USD,
  isPowerUpKey,
  nextDesignSeed,
  suggestedPowerUps,
  WEBSITE_CATEGORIES,
  WEBSITE_GOALS,
  WEBSITE_SOURCES,
  type WebsiteSources,
  websitePath,
} from "@/lib/websiteBuilder";
import { gatherFacts } from "@/lib/websiteFacts";
import { quoteWish, writeContent } from "@/lib/websiteContent";
import {
  loadPowerUps,
  loadProject,
  projectFound,
  quoteFor,
  rememberProject,
} from "@/lib/websiteProjects";

const optional = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .transform((value) => value || undefined);

const link = z
  .string()
  .trim()
  .max(500)
  .optional()
  .transform((value) => {
    if (!value) return undefined;
    const withScheme = /^https?:\/\//i.test(value) ? value : `https://${value}`;
    try {
      const url = new URL(withScheme);
      return url.protocol === "https:" || url.protocol === "http:" ? url.toString() : undefined;
    } catch {
      return undefined;
    }
  });

const startSchema = z.object({
  businessName: z.string().trim().min(2, "Tell us your business name").max(120),
  category: z.enum(WEBSITE_CATEGORIES, { message: "Pick a category" }),
  city: z.string().trim().min(2, "Which city are you in?").max(120),
  phone: optional(30),
  email: optional(160),
  whatsapp: optional(30),
  address: optional(240),
  domain: optional(120),
  google: link,
  yelp: link,
  website: link,
  facebook: link,
  instagram: link,
});

const goalKeys = WEBSITE_GOALS.map((goal) => goal.key);

async function owned(id: string) {
  const project = await loadProject(id);
  if (!project) throw new Error("FORBIDDEN");
  if (project.status === "PAID" || project.status === "LIVE") {
    throw new Error("This website is already paid for — email us for changes.");
  }
  return project;
}

/** Step 1: the short form plus pasted links; reads the public pages at once. */
export async function startWebsiteAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  let id: string;
  try {
    const raw = Object.fromEntries(
      [...startSchema.keyof().options].map((key) => [key, formData.get(key) ?? ""]),
    );
    const input = startSchema.parse(raw);
    const sources: WebsiteSources = {};
    for (const source of WEBSITE_SOURCES) {
      const value = input[source.key];
      if (value) sources[source.key] = value;
    }
    const user = await getCurrentUser();

    const found = await gatherFacts({
      sources,
      businessName: input.businessName,
      city: input.city,
    });

    const project = await db.websiteProject.create({
      data: {
        userId: user?.id,
        businessName: input.businessName,
        category: input.category,
        city: input.city,
        phone: input.phone ?? found.phone,
        email: input.email ?? found.email,
        whatsapp: input.whatsapp,
        address: input.address ?? found.address,
        domain: input.domain,
        sources: sources as Prisma.InputJsonObject,
        found: found as unknown as Prisma.InputJsonObject,
      },
    });
    rememberProject(project.id);
    id = project.id;
  } catch (error) {
    return fieldError(error);
  }
  redirect(websitePath(id, "/verify"));
}

const verifySchema = z.object({
  businessName: z.string().trim().min(2).max(120),
  phone: optional(30),
  email: optional(160),
  whatsapp: optional(30),
  address: optional(240),
  description: optional(700),
  keepPhotos: z.array(z.string().url()).max(12),
});

/** Step 2: the owner corrects what we found and drops photos they dislike. */
export async function verifyFactsAction(
  id: string,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const project = await owned(id);
    const input = verifySchema.parse({
      businessName: formData.get("businessName") ?? "",
      phone: formData.get("phone") ?? "",
      email: formData.get("email") ?? "",
      whatsapp: formData.get("whatsapp") ?? "",
      address: formData.get("address") ?? "",
      description: formData.get("description") ?? "",
      keepPhotos: formData.getAll("keepPhotos").map(String),
    });
    const found = projectFound(project);
    const nextFound = found
      ? {
          ...found,
          description: input.description ?? found.description,
          photos: found.photos.filter((photo) => input.keepPhotos.includes(photo)),
        }
      : input.description
        ? { photos: [], from: [], description: input.description }
        : null;
    await db.websiteProject.update({
      where: { id },
      data: {
        businessName: input.businessName,
        phone: input.phone ?? null,
        email: input.email ?? null,
        whatsapp: input.whatsapp ?? null,
        address: input.address ?? null,
        found: nextFound ? (nextFound as unknown as Prisma.InputJsonObject) : undefined,
      },
    });
  } catch (error) {
    return fieldError(error);
  }
  redirect(websitePath(id, "/goals"));
}

/** Step 3: goals and the free-text wish; the first draft is written here. */
export async function saveGoalsAction(
  id: string,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const project = await owned(id);
    const goals = formData
      .getAll("goals")
      .map(String)
      .filter((goal) => goalKeys.includes(goal as (typeof goalKeys)[number]));
    const wish = String(formData.get("wish") ?? "").trim().slice(0, 1000) || null;

    const content = await writeContent({
      businessName: project.businessName,
      category: project.category,
      city: project.city,
      phone: project.phone,
      whatsapp: project.whatsapp,
      email: project.email,
      address: project.address,
      goals,
      wish,
      found: projectFound(project),
    });

    await db.websiteProject.update({
      where: { id },
      data: {
        goals,
        wish,
        content: content as unknown as Prisma.InputJsonObject,
        powerUps: project.powerUps.length ? project.powerUps : suggestedPowerUps(goals),
        status: project.status === "DRAFT" ? "PREVIEW" : project.status,
      },
    });
  } catch (error) {
    return fieldError(error);
  }
  redirect(websitePath(id, "/preview"));
}

/** "Show me another design": same words, new palette, type and layout. */
export async function rerollDesignAction(id: string) {
  const project = await owned(id);
  await db.websiteProject.update({
    where: { id },
    data: { designSeed: nextDesignSeed(project.designSeed) },
  });
  redirect(websitePath(id, "/preview"));
}

/** "I want to make changes": notes are folded into a fresh draft of the copy. */
export async function requestChangesAction(
  id: string,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const project = await owned(id);
    const notes = String(formData.get("notes") ?? "").trim().slice(0, 2000);
    if (notes.length < 5) return { error: "Tell us what to change." };
    const content = await writeContent({
      businessName: project.businessName,
      category: project.category,
      city: project.city,
      phone: project.phone,
      whatsapp: project.whatsapp,
      email: project.email,
      address: project.address,
      goals: project.goals,
      wish: project.wish,
      changeNotes: notes,
      found: projectFound(project),
    });
    await db.websiteProject.update({
      where: { id },
      data: {
        changeNotes: notes,
        content: content as unknown as Prisma.InputJsonObject,
      },
    });
  } catch (error) {
    return fieldError(error);
  }
  redirect(websitePath(id, "/preview"));
}

/** "I love it": only now does the price appear. */
export async function approveDesignAction(id: string) {
  await owned(id);
  await db.websiteProject.update({
    where: { id },
    data: { status: "APPROVED", approvedAt: new Date() },
  });
  redirect(websitePath(id, "/features"));
}

/** Cart changes: ticked Power-Ups plus an "anything else" wish priced by AI. */
export async function updateCartAction(
  id: string,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const project = await owned(id);
    const powerUps = Array.from(new Set(formData.getAll("powerUps").map(String))).filter(isPowerUpKey);
    const extra = String(formData.get("extra") ?? "").trim().slice(0, 600);
    const data: Prisma.WebsiteProjectUpdateInput = { powerUps };
    if (extra) {
      const quoted = await quoteWish(extra, await loadPowerUps());
      const merged = [
        ...(Array.isArray(project.quoted) ? (project.quoted as Prisma.JsonArray) : []),
        ...(quoted as unknown as Prisma.JsonArray),
      ].slice(-6);
      data.quoted = merged;
      const fromCatalogue = quoted
        .map((item) => item.powerUp)
        .filter((key): key is NonNullable<typeof key> => Boolean(key));
      data.powerUps = Array.from(new Set([...powerUps, ...fromCatalogue]));
    }
    if (formData.get("clearQuoted") === "1") data.quoted = [];
    await db.websiteProject.update({ where: { id }, data });
  } catch (error) {
    return fieldError(error);
  }
  return { success: "Cart updated" };
}

/**
 * Checkout: one Stripe subscription carrying the setup fee as a one-off line
 * and every monthly line as recurring prices.
 */
export async function launchCheckoutAction(
  id: string,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  let url: string;
  try {
    const current = await owned(id);
    if (!current.approvedAt) throw new Error("Approve your preview first.");
    const powerUps = Array.from(new Set(formData.getAll("powerUps").map(String))).filter(
      isPowerUpKey,
    );
    const project = await db.websiteProject.update({ where: { id }, data: { powerUps } });
    if (!stripeEnabled()) throw new Error("Payments are not switched on yet — email us and we will launch it by hand.");
    const quote = quoteFor(project, await loadPowerUps());
    const user = await getCurrentUser();
    const email = user?.email ?? project.email ?? undefined;

    const session = await getStripe().checkout.sessions.create({
      mode: "subscription",
      customer_email: email,
      client_reference_id: user?.id ?? undefined,
      metadata: {
        kind: "website",
        websiteProjectId: project.id,
        userId: user?.id ?? "",
        powerUps: project.powerUps.join(","),
      },
      subscription_data: {
        metadata: { kind: "website", websiteProjectId: project.id },
      },
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "usd",
            unit_amount: BASE_SETUP_USD * 100,
            product_data: {
              name: `AI website setup — ${project.businessName}`,
              description: "One-time. Design, copy, photos, mobile version, basic SEO, contact form.",
            },
          },
        },
        ...quote.lines.map((line) => ({
          quantity: 1,
          price_data: {
            currency: "usd",
            unit_amount: line.monthlyUsd * 100,
            recurring: { interval: "month" as const },
            product_data: { name: line.label },
          },
        })),
      ],
      success_url: `${siteUrl()}${websitePath(project.id, "/done")}?session={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl()}${websitePath(project.id, "/features")}?cancelled=1`,
    });
    if (!session.url) throw new Error("Stripe did not return a checkout link.");
    await db.websiteProject.update({
      where: { id },
      data: {
        setupMinor: quote.setupUsd * 100,
        monthlyMinor: quote.monthlyUsd * 100,
      },
    });
    url = session.url;
  } catch (error) {
    return fieldError(error);
  }
  redirect(url);
}
