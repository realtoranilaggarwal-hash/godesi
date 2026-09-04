import { cookies } from "next/headers";
import type { WebsiteProject } from "@prisma/client";
import { db } from "@/lib/db";
import { getCurrentUser, isStaff } from "@/lib/auth";
import { sendEmail, shell } from "@/lib/email";
import { siteUrl } from "@/lib/format";
import { WEBSITE_OFFER } from "@/lib/websiteOffer";
import {
  BASE_MONTHLY_USD,
  BASE_SETUP_USD,
  EMPTY_FACTS,
  type FoundFacts,
  isPowerUpKey,
  mergePowerUps,
  type PowerUp,
  type QuotedItem,
  type SiteContent,
  type WebsiteSources,
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
}: {
  projectId: string;
  sessionId: string;
  subscriptionId: string | null;
  setupMinor: number;
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
  await sendEmail({
    to: WEBSITE_OFFER.email,
    subject: `Website paid: ${updated.businessName} (${updated.city})`,
    html: shell(
      "New website to launch",
      `<h2>New website to launch</h2>
       <p><strong>${updated.businessName}</strong> — ${updated.category}, ${updated.city}</p>
       <p>Setup $${(setup / 100).toFixed(0)}; monthly $${((updated.monthlyMinor ?? 0) / 100).toFixed(0)}.</p>
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
  monthlyUsd: number;
  lines: { label: string; monthlyUsd: number; kind: "base" | "powerUp" | "custom" }[];
};

/** Setup once, then base hosting plus every ticked feature per month. */
export function quoteFor(
  project: WebsiteProject,
  powerUps: PowerUp[],
): Quote {
  const lines: Quote["lines"] = [
    { label: "Hosting, domain, SSL & care", monthlyUsd: BASE_MONTHLY_USD, kind: "base" },
  ];
  for (const key of project.powerUps) {
    if (!isPowerUpKey(key)) continue;
    const item = powerUps.find((entry) => entry.key === key);
    if (item?.active) lines.push({ label: item.label, monthlyUsd: item.monthlyUsd, kind: "powerUp" });
  }
  // Custom wishes are estimates a person confirms first; they are never billed here.
  return {
    setupUsd: BASE_SETUP_USD,
    monthlyUsd: lines.reduce((sum, line) => sum + line.monthlyUsd, 0),
    lines,
  };
}
