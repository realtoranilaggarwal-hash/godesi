import { cookies } from "next/headers";
import type { WebsiteProject } from "@prisma/client";
import { db } from "@/lib/db";
import { getCurrentUser, isStaff } from "@/lib/auth";
import { sendEmail, shell } from "@/lib/email";
import { siteUrl } from "@/lib/format";
import { WEBSITE_OFFER } from "@/lib/websiteOffer";
import { recordCouponFromMetadata } from "@/lib/coupons";
import {
  BASE_MONTHLY_USD,
  BASE_YEARLY_USD,
  CUSTOM_SOURCES,
  type CustomPage,
  EMPTY_FACTS,
  EXAMPLE_SITE_KEYS,
  type HostingTerm,
  type FoundFacts,
  isPowerUpKey,
  mergePowerUps,
  type PowerUp,
  type QuotedItem,
  setupUsdFor,
  type SiteContent,
  type WebsiteSources,
  websitePath,
} from "@/lib/websiteBuilder";

/**
 * A website project is started before anyone signs in, so ownership is a
 * cookie listing the projects this browser created; a signed-in member also
 * owns any project stamped with their id. Staff see everything.
 */
const COOKIE = "godesi_web_projects";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 90;

function cookieProjectIds() {
  return (cookies().get(COOKIE)?.value ?? "").split(",").filter(Boolean);
}

export function rememberProject(id: string) {
  const ids = Array.from(new Set([id, ...cookieProjectIds()])).slice(0, 20);
  cookies().set(COOKIE, ids.join(","), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: COOKIE_MAX_AGE,
  });
}

/** The project if this browser or member owns it (or staff), else null. */
export async function loadProject(id: string) {
  const project = await db.websiteProject.findUnique({ where: { id } });
  if (!project) return null;
  const user = await getCurrentUser();
  if (user && isStaff(user)) return project;
  if (user && project.userId === user.id) return project;
  if (cookieProjectIds().includes(project.id)) {
    if (user && !project.userId) {
      await db.websiteProject.update({
        where: { id: project.id },
        data: { userId: user.id },
      });
    }
    return project;
  }
  return null;
}

/* ---------- typed views of the JSON columns ---------- */

const record = (value: unknown): Record<string, unknown> =>
  value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};

export function projectSources(project: WebsiteProject): WebsiteSources {
  const raw = record(project.sources);
  const out: WebsiteSources = {};
  for (const key of ["google", "yelp", "website", "facebook", "instagram"] as const) {
    if (typeof raw[key] === "string" && raw[key]) out[key] = raw[key] as string;
  }
  return out;
}

/** Every link the owner gave, labelled, for the staff desk. */
export function projectLinks(project: WebsiteProject): { label: string; url: string }[] {
  const raw = record(project.sources);
  const labels: Record<string, string> = Object.fromEntries(
    CUSTOM_SOURCES.map((source) => [source.key, source.label]),
  );
  EXAMPLE_SITE_KEYS.forEach((key, index) => {
    labels[key] = `Example site ${index + 1}`;
  });
  return Object.entries(raw)
    .filter((entry): entry is [string, string] => typeof entry[1] === "string" && Boolean(entry[1]))
    .map(([key, url]) => ({ label: labels[key] ?? key, url }));
}

export function projectPages(project: WebsiteProject): CustomPage[] {
  if (!Array.isArray(project.pageContent)) return [];
  return (project.pageContent as unknown[])
    .map((page) => record(page))
    .filter((page) => typeof page.name === "string" && typeof page.text === "string")
    .map((page) => ({ name: page.name as string, text: page.text as string }));
}

/**
 * Where the customer sees their design: custom sites only through the
 * private GoDesi link, so the designer's own address never appears.
 */
export function previewHref(project: WebsiteProject) {
  if (project.tier === "CUSTOM") {
    return project.previewToken ? `/website/look/${project.previewToken}` : null;
  }
  return websitePath(project.id, "/site");
}

export function hostingTerm(project: WebsiteProject): HostingTerm {
  return project.billing === "YEAR" ? "YEAR" : "MONTH";
}

/**
 * Hosting includes one change a month, or twelve a year when paid yearly
 * (counted from the anniversary of the payment).
 */
export async function changeAllowance(project: WebsiteProject, now = new Date()) {
  const yearly = hostingTerm(project) === "YEAR";
  const limit = yearly ? WEBSITE_OFFER.changesPerYear : WEBSITE_OFFER.changesPerMonth;
  let since: Date;
  if (yearly) {
    since = new Date(project.paidAt ?? project.createdAt);
    since.setUTCFullYear(now.getUTCFullYear());
    if (since > now) since.setUTCFullYear(now.getUTCFullYear() - 1);
  } else {
    since = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  }
  const used = await db.websiteChangeRequest.count({
    where: { projectId: project.id, createdAt: { gte: since } },
  });
  return { limit, used, left: Math.max(0, limit - used), yearly };
}

export function projectFound(project: WebsiteProject): FoundFacts | null {
  if (!project.found) return null;
  const raw = record(project.found);
  return {
    ...EMPTY_FACTS,
    ...(raw as unknown as Partial<FoundFacts>),
    photos: Array.isArray(raw.photos) ? (raw.photos as string[]) : [],
    from: Array.isArray(raw.from) ? (raw.from as string[]) : [],
  };
}

export function projectContent(project: WebsiteProject): SiteContent | null {
  if (!project.content) return null;
  const raw = record(project.content);
  if (typeof raw.headline !== "string") return null;
  return raw as unknown as SiteContent;
}

export function projectQuoted(project: WebsiteProject): QuotedItem[] {
  return Array.isArray(project.quoted)
    ? (project.quoted as unknown as QuotedItem[])
    : [];
}

/** Every picture we may show: the owner's uploads first, then what we found. */
export function projectPhotos(project: WebsiteProject) {
  const found = projectFound(project)?.photos ?? [];
  return Array.from(new Set([...project.uploads, ...found]));
}

/**
 * Marks a project paid from the Stripe webhook. Keyed on the checkout session,
 * so a retried webhook is a no-op, and the staff inbox is told once.
 */
export async function confirmWebsitePayment({
  projectId,
  sessionId,
  subscriptionId,
  setupMinor,
  metadata,
}: {
  projectId: string;
  sessionId: string;
  subscriptionId: string | null;
  setupMinor: number;
  metadata?: Record<string, string> | null;
}) {
  const project = await db.websiteProject.findUnique({ where: { id: projectId } });
  if (!project || project.paidAt) return project;
  const setup = project.setupMinor ?? setupMinor;
  const updated = await db.websiteProject.update({
    where: { id: projectId },
    data: {
      status: "PAID",
      paidAt: new Date(),
      stripeSessionId: sessionId,
      stripeSubscriptionId: subscriptionId,
      setupMinor: setup,
    },
  });
  if (metadata?.couponId) {
    if (updated.userId) {
      await recordCouponFromMetadata({
        metadata,
        userId: updated.userId,
        currency: "USD",
        reference: sessionId,
      });
    } else {
      await db.coupon.update({
        where: { id: metadata.couponId },
        data: { timesRedeemed: { increment: 1 } },
      });
    }
  }
  const term = hostingTerm(updated) === "YEAR" ? "year" : "mo";
  await sendEmail({
    to: WEBSITE_OFFER.email,
    subject: `Website paid: ${updated.businessName} (${updated.city})`,
    html: shell(
      "New website to launch",
      `<h2>New website to launch</h2>
       <p><strong>${updated.businessName}</strong> — ${updated.category}, ${updated.city}</p>
       <p>${updated.tier === "CUSTOM" ? "Custom design" : "AI website"}. Setup $${(setup / 100).toFixed(0)}${
         metadata?.couponId ? ` (after a $${(Number(metadata.couponDiscountMinor ?? 0) / 100).toFixed(2)} discount)` : ""
       }; hosting $${((updated.monthlyMinor ?? 0) / 100).toFixed(0)}/${term}.</p>
       <p>Features: ${updated.powerUps.join(", ") || "none"}</p>
       ${
         projectQuoted(updated).filter((item) => !item.powerUp).length
           ? `<p><strong>Custom extras to quote and confirm:</strong> ${projectQuoted(updated)
               .filter((item) => !item.powerUp)
               .map((item) => `${item.label} (est. $${item.monthlyUsd}/mo)`)
               .join("; ")}</p>`
           : ""
       }
       <p><a href="${siteUrl()}/admin/website/${updated.id}">Open in the admin</a></p>`,
    ),
  });
  return updated;
}

/* ---------- pricing ---------- */

export async function loadPowerUps(): Promise<PowerUp[]> {
  const overrides = await db.websitePowerUp.findMany();
  return mergePowerUps(overrides);
}

export type Quote = {
  setupUsd: number;
  term: HostingTerm;
  /** Every recurring line added up, per month (for display and reports). */
  monthlyUsd: number;
  /** What Stripe bills each term: per month, or per year when paid yearly. */
  recurringUsd: number;
  lines: {
    label: string;
    monthlyUsd: number;
    /** Charged per term. */
    amountUsd: number;
    kind: "base" | "powerUp" | "custom";
  }[];
};

/** A recurring line's price for the term; yearly hosting is cheaper than 12 months. */
export function termAmount(kind: Quote["lines"][number]["kind"], monthlyUsd: number, term: HostingTerm) {
  if (term === "MONTH") return monthlyUsd;
  return kind === "base" ? BASE_YEARLY_USD : monthlyUsd * 12;
}

/** Setup once, then hosting plus every ticked feature, monthly or yearly. */
export function quoteFor(
  project: WebsiteProject,
  powerUps: PowerUp[],
  term: HostingTerm = hostingTerm(project),
): Quote {
  const lines: Quote["lines"] = [
    {
      label: "Hosting, domain, SSL & care",
      monthlyUsd: BASE_MONTHLY_USD,
      amountUsd: termAmount("base", BASE_MONTHLY_USD, term),
      kind: "base",
    },
  ];
  for (const key of project.powerUps) {
    if (!isPowerUpKey(key)) continue;
    const item = powerUps.find((entry) => entry.key === key);
    if (item?.active) {
      lines.push({
        label: item.label,
        monthlyUsd: item.monthlyUsd,
        amountUsd: termAmount("powerUp", item.monthlyUsd, term),
        kind: "powerUp",
      });
    }
  }
  // Custom wishes are estimates a person confirms first; they are never billed here.
  return {
    setupUsd: setupUsdFor(project.tier),
    term,
    monthlyUsd: lines.reduce((sum, line) => sum + line.monthlyUsd, 0),
    recurringUsd: lines.reduce((sum, line) => sum + line.amountUsd, 0),
    lines,
  };
}
