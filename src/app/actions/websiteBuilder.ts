"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { type ActionState, fieldError } from "@/lib/actions";
import { getStripe, stripeEnabled } from "@/lib/stripe";
import { siteUrl } from "@/lib/format";
import { checkCoupon, couponMetadata } from "@/lib/coupons";
import { escapeHtml, sendEmail, shell } from "@/lib/email";
import { WEBSITE_OFFER } from "@/lib/websiteOffer";
import {
  CUSTOM_PAGE_NAMES,
  CUSTOM_SOURCES,
  type CustomPage,
  EXAMPLE_SITE_KEYS,
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
  changeAllowance,
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
  wish: optional(2000),
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
        wish: input.wish,
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
  description: z.string().trim().max(700),
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
          description: input.description || undefined,
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
    const billing = formData.get("billing") === "YEAR" ? "YEAR" : "MONTH";
    const project = await db.websiteProject.update({ where: { id }, data: { powerUps, billing } });
    if (!stripeEnabled()) throw new Error("Payments are not switched on yet — email us and we will launch it by hand.");
    const quote = quoteFor(project, await loadPowerUps());
    const user = await getCurrentUser();
    const email = user?.email ?? project.email ?? undefined;

    // Website codes take money off the one-time setup fee only, never hosting.
    const setupMinor = quote.setupUsd * 100;
    const code = String(formData.get("coupon") ?? "").trim();
    let coupon: { id: string } | null = null;
    let discountMinor = 0;
    if (code) {
      const check = await checkCoupon({
        code,
        scope: "WEBSITE",
        userId: user?.id ?? "",
        subtotalMinor: setupMinor,
        currency: "USD",
      });
      if (!check.ok) return { error: check.error };
      coupon = check.coupon;
      discountMinor = Math.min(check.discountMinor, setupMinor - 100);
    }
    const custom = project.tier === "CUSTOM";
    const interval = quote.term === "YEAR" ? ("year" as const) : ("month" as const);

    const session = await getStripe().checkout.sessions.create({
      mode: "subscription",
      customer_email: email,
      client_reference_id: user?.id ?? undefined,
      metadata: {
        kind: "website",
        websiteProjectId: project.id,
        userId: user?.id ?? "",
        powerUps: project.powerUps.join(","),
        billing,
        ...couponMetadata(coupon, discountMinor),
      },
      subscription_data: {
        metadata: { kind: "website", websiteProjectId: project.id },
      },
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "usd",
            unit_amount: setupMinor - discountMinor,
            product_data: {
              name: `${custom ? "Custom designed website" : "AI website setup"} — ${project.businessName}`,
              description: custom
                ? `One-time. Up to ${WEBSITE_OFFER.customPages} pages designed from your content, mobile version, basic SEO, contact form.${discountMinor ? ` Includes your ${code.toUpperCase()} discount.` : ""}`
                : `One-time. Design, copy, photos, mobile version, basic SEO, contact form.${discountMinor ? ` Includes your ${code.toUpperCase()} discount.` : ""}`,
            },
          },
        },
        ...quote.lines.map((line) => ({
          quantity: 1,
          price_data: {
            currency: "usd",
            unit_amount: line.amountUsd * 100,
            recurring: { interval },
            product_data: {
              name:
                line.kind === "base"
                  ? `${line.label} — includes ${interval === "year" ? `${WEBSITE_OFFER.changesPerYear} changes a year` : `${WEBSITE_OFFER.changesPerMonth} change a month`}`
                  : line.label,
            },
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
        setupMinor: setupMinor - discountMinor,
        monthlyMinor: quote.recurringUsd * 100,
      },
    });
    url = session.url;
  } catch (error) {
    return fieldError(error);
  }
  redirect(url);
}

/* ---------- custom designed website ---------- */

const customSchema = z.object({
  businessName: z.string().trim().min(2, "Tell us your business name").max(120),
  category: z.enum(WEBSITE_CATEGORIES, { message: "Pick a category" }),
  city: z.string().trim().min(2, "Which city are you in?").max(120),
  email: z.string().trim().email("We email your design here — check the address").max(160),
  phone: optional(30),
  whatsapp: optional(30),
  domain: optional(120),
  wish: optional(3000),
});

async function emailDesk(subject: string, body: string) {
  await sendEmail({ to: WEBSITE_OFFER.email, subject, html: shell(subject, body) });
}

/** The custom website order: links, example sites and up to ten pages of the owner's words. */
export async function startCustomWebsiteAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const input = customSchema.parse(
      Object.fromEntries(
        [...customSchema.keyof().options].map((key) => [key, formData.get(key) ?? ""]),
      ),
    );
    const sources: Record<string, string> = {};
    for (const key of [...CUSTOM_SOURCES.map((source) => source.key), ...EXAMPLE_SITE_KEYS]) {
      const value = link.parse(String(formData.get(key) ?? ""));
      if (value) sources[key] = value;
    }
    const pages: CustomPage[] = [];
    for (let index = 0; index < WEBSITE_OFFER.customPages; index++) {
      const text = String(formData.get(`pageText${index}`) ?? "").trim().slice(0, 6000);
      if (!text) continue;
      const name =
        String(formData.get(`pageName${index}`) ?? "").trim().slice(0, 80) ||
        CUSTOM_PAGE_NAMES[index] ||
        `Page ${index + 1}`;
      pages.push({ name, text });
    }
    if (!Object.keys(sources).length && !pages.length) {
      return { error: "Give us at least one link (old website, Google, Yelp…) or one page of content." };
    }
    const user = await getCurrentUser();
    const project = await db.websiteProject.create({
      data: {
        userId: user?.id,
        tier: "CUSTOM",
        businessName: input.businessName,
        category: input.category,
        city: input.city,
        email: input.email,
        phone: input.phone,
        whatsapp: input.whatsapp,
        domain: input.domain,
        wish: input.wish,
        sources: sources as Prisma.InputJsonObject,
        pageContent: pages as unknown as Prisma.InputJsonArray,
      },
    });
    rememberProject(project.id);
    await emailDesk(
      `Custom website order: ${project.businessName} (${project.city})`,
      `<h2>New $${WEBSITE_OFFER.customPriceUsd} custom website request</h2>
       <p><strong>${escapeHtml(project.businessName)}</strong> — ${escapeHtml(project.category)}, ${escapeHtml(project.city)}</p>
       <p>${Object.keys(sources).length} links · ${pages.length} pages of content</p>
       ${input.wish ? `<p><strong>What they want:</strong> ${escapeHtml(input.wish)}</p>` : ""}
       <p><a href="${siteUrl()}/admin/website/${project.id}">Open in the admin</a></p>`,
    );
  } catch (error) {
    return fieldError(error);
  }
  redirect("/website/custom?sent=1");
}

async function projectForToken(token: string) {
  const project = await db.websiteProject.findUnique({ where: { previewToken: token } });
  if (!project || !project.designUrl || project.status === "CANCELLED") throw new Error("FORBIDDEN");
  return project;
}

/** "I love it" on the private preview: on to features and payment. */
export async function approveLookAction(token: string, code?: string) {
  const project = await projectForToken(token);
  rememberProject(project.id);
  if (project.status === "PAID" || project.status === "LIVE") redirect(websitePath(project.id, "/done"));
  if (project.includedIn) {
    const now = new Date();
    await db.websiteProject.update({
      where: { id: project.id },
      data: { status: "PAID", approvedAt: project.approvedAt ?? now, paidAt: project.paidAt ?? now },
    });
    await emailDesk(
      `Approved — launch it: ${project.businessName}`,
      `<p>${escapeHtml(project.businessName)} pressed &ldquo;I love it&rdquo; on their Partner Package website. It's already paid for — put it live.</p>
       <p><a href="${siteUrl()}/admin/website/${project.id}">Open in the admin</a></p>`,
    );
    redirect(websitePath(project.id, "/done"));
  }
  await db.websiteProject.update({
    where: { id: project.id },
    data: { status: "APPROVED", approvedAt: project.approvedAt ?? new Date() },
  });
  const query = code ? `?code=${encodeURIComponent(code)}` : "";
  redirect(`${websitePath(project.id, "/features")}${query}`);
}

/** "I want changes" on the private preview: noted on the project and emailed to the desk. */
export async function lookChangesAction(
  token: string,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const project = await projectForToken(token);
    if (project.status === "PAID" || project.status === "LIVE") {
      return { error: "This website is already paid for — use “Request a change” on your website page." };
    }
    const notes = String(formData.get("notes") ?? "").trim().slice(0, 3000);
    if (notes.length < 5) return { error: "Tell us what to change." };
    const stamp = new Date().toISOString().slice(0, 10);
    await db.websiteProject.update({
      where: { id: project.id },
      data: {
        changeNotes: [project.changeNotes, `[${stamp}] ${notes}`].filter(Boolean).join("\n\n"),
      },
    });
    await emailDesk(
      `Design changes asked: ${project.businessName}`,
      `<h2>${escapeHtml(project.businessName)} wants changes</h2>
       <p style="white-space:pre-wrap">${escapeHtml(notes)}</p>
       <p><a href="${siteUrl()}/admin/website/${project.id}">Open in the admin</a></p>`,
    );
  } catch (error) {
    return fieldError(error);
  }
  return { success: "Thanks — we'll make the changes and send you the new version." };
}

/** A change to a paid site; hosting includes one a month (twelve a year on yearly). */
export async function requestSiteChangeAction(
  id: string,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const project = await loadProject(id);
    if (!project) throw new Error("FORBIDDEN");
    if (project.status !== "PAID" && project.status !== "LIVE") {
      return { error: "Change requests open once your website is paid for." };
    }
    const text = String(formData.get("text") ?? "").trim().slice(0, 3000);
    if (text.length < 5) return { error: "Tell us what to change." };
    const allowance = await changeAllowance(project);
    if (!allowance.left) {
      return {
        error: allowance.yearly
          ? `You've used all ${allowance.limit} changes for this year. Email ${WEBSITE_OFFER.email} and we'll quote this one.`
          : `You've used this month's free change. Ask again next month, or email ${WEBSITE_OFFER.email} and we'll quote it.`,
      };
    }
    await db.websiteChangeRequest.create({ data: { projectId: project.id, text } });
    await emailDesk(
      `Site change asked: ${project.businessName}`,
      `<h2>${escapeHtml(project.businessName)} asked for a change</h2>
       <p style="white-space:pre-wrap">${escapeHtml(text)}</p>
       <p>${allowance.used + 1} of ${allowance.limit} this ${allowance.yearly ? "year" : "month"}.</p>
       <p><a href="${siteUrl()}/admin/website/${project.id}">Open in the admin</a></p>`,
    );
    revalidatePath(websitePath(project.id, "/done"));
  } catch (error) {
    return fieldError(error);
  }
  return { success: "Got it — we'll make the change and email you when it's done." };
}
