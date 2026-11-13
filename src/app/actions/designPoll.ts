"use server";

import { createHash, randomBytes } from "node:crypto";
import { revalidatePath, revalidateTag } from "next/cache";
import { cookies, headers } from "next/headers";
import { z } from "zod";
import { db } from "@/lib/db";
import { sendEmail, shell, escapeHtml } from "@/lib/email";
import { SITE } from "@/lib/site";
import { DESIGN_VOTES_TAG } from "@/lib/designShowcase";
import { emptyTally, type DesignTally, type DesignVoteKey } from "@/lib/designVotes";

const DAY_MS = 24 * 60 * 60 * 1000;
const BOT_UA = /bot|crawl|spider|slurp|preview|fetch|curl|wget|python|headless/i;
const SESSION_COOKIE = "godesi_dv_sid";
const VOTED_COOKIE = "godesi_design_votes";

const voteSchema = z.object({
  projectId: z.string().trim().min(1).max(40),
  vote: z.enum(["NEW", "OLD", "NEEDS_WORK"]),
  comment: z.string().trim().max(140).optional(),
});

async function tallyFor(projectId: string): Promise<DesignTally> {
  const groups = await db.designVote.groupBy({
    by: ["vote"],
    where: { projectId },
    _count: { _all: true },
  });
  const tally = emptyTally();
  for (const group of groups) {
    if (group.vote in tally) tally[group.vote as DesignVoteKey] = group._count._all;
  }
  return tally;
}

/** One vote per visitor (IP + browser, or cookie) per design per day. */
export async function voteDesignAction(input: { projectId: string; vote: string; comment?: string }) {
  const parsed = voteSchema.safeParse({
    projectId: input.projectId,
    vote: input.vote,
    comment: input.comment || undefined,
  });
  if (!parsed.success) return { ok: false as const, error: "Pick New, Old or Needs work." };
  const { projectId, vote, comment } = parsed.data;

  const store = headers();
  const userAgent = store.get("user-agent") ?? "";
  if (BOT_UA.test(userAgent)) return { ok: false as const, error: "Voting isn't available." };

  const project = await db.websiteProject.findFirst({
    where: { id: projectId, designUrl: { not: null }, previewToken: { not: null } },
    select: { id: true },
  });
  if (!project) return { ok: false as const, error: "That design isn't on this page any more." };

  const ip = (store.get("x-forwarded-for") ?? "").split(",")[0].trim() || store.get("x-real-ip") || "";
  const voterHash = createHash("sha256").update(`design-vote|${ip}|${userAgent}`).digest("hex");
  const jar = cookies();
  let sessionId = jar.get(SESSION_COOKIE)?.value;
  if (!sessionId || !/^[A-Za-z0-9_-]{16,64}$/.test(sessionId)) {
    sessionId = randomBytes(16).toString("base64url");
    jar.set(SESSION_COOKIE, sessionId, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 365 * 24 * 60 * 60,
    });
  }

  // Repeats inside a day are accepted quietly but not counted twice.
  const recent = await db.designVote.count({
    where: {
      projectId,
      createdAt: { gte: new Date(Date.now() - DAY_MS) },
      OR: [{ voterHash }, { sessionId }],
    },
  });
  if (recent === 0) {
    await db.designVote.create({ data: { projectId, vote, comment, voterHash, sessionId } });
    revalidateTag(DESIGN_VOTES_TAG);
    revalidatePath("/website/examples");
  }

  const voted = new Set((jar.get(VOTED_COOKIE)?.value ?? "").split(",").filter(Boolean));
  voted.add(projectId);
  jar.set(VOTED_COOKIE, Array.from(voted).slice(-60).join(","), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: DAY_MS / 1000,
  });

  return { ok: true as const, tally: await tallyFor(projectId), counted: recent === 0 };
}

const inquirySchema = z.object({
  name: z.string().trim().min(2, "Enter your name").max(80),
  phone: z.string().trim().min(7, "Enter a valid phone").max(30),
  email: z.string().trim().email("Enter a valid email").max(120),
  website: z.string().trim().max(300).optional(),
});

/** "Want a redesign like this?" — a lead for the desk, like the course seller form. */
export async function redesignInquiryAction(formData: FormData) {
  const parsed = inquirySchema.safeParse({
    name: formData.get("name") ?? undefined,
    phone: formData.get("phone") ?? undefined,
    email: formData.get("email") ?? undefined,
    website: (formData.get("website") as string | null) || undefined,
  });
  if (!parsed.success) {
    return { ok: false as const, error: parsed.error.issues[0].message };
  }
  const d = parsed.data;
  // One request per person per day — repeats are accepted quietly so bots get no signal.
  const recent = await db.partnerLead.count({
    where: {
      site: "godesi.com",
      intent: "buy",
      category: "website-redesign",
      createdAt: { gte: new Date(Date.now() - DAY_MS) },
      OR: [{ email: d.email }, { phone: d.phone }],
    },
  });
  if (recent > 0) return { ok: true as const };
  await db.partnerLead.create({
    data: {
      site: "godesi.com",
      intent: "buy",
      category: "website-redesign",
      city: "Website redesign",
      name: d.name,
      phone: d.phone,
      email: d.email,
      message: d.website ? `Current website: ${d.website}` : "No current website given",
    },
  });
  const rows = [
    ["Name", d.name],
    ["Phone", d.phone],
    ["Email", d.email],
    ["Current website", d.website ?? "—"],
  ]
    .map(
      ([label, value]) =>
        `<tr><td style="padding:4px 12px 4px 0;color:#64748b;vertical-align:top">${label}</td><td style="padding:4px 0"><b>${escapeHtml(value)}</b></td></tr>`,
    )
    .join("");
  await sendEmail({
    to: SITE.supportEmail,
    subject: `Website redesign request — ${d.name}`,
    replyTo: d.email,
    html: shell(
      "New website redesign request",
      `<p>Someone on the before/after examples page wants a redesign.</p><table>${rows}</table><p><a href="https://godesi.com/admin/partner-leads">Open the requests desk</a></p>`,
    ),
  }).catch(() => null);
  return { ok: true as const };
}
