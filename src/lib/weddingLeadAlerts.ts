import type { Lead } from "@prisma/client";
import { db } from "@/lib/db";
import { notify } from "@/lib/notifications";
import { emailEnabled, sendEmail, shell } from "@/lib/email";
import { siteUrl } from "@/lib/format";
import { WEDDING_SLUG, weddingServiceSlug } from "@/lib/wedding";

/** Most vendors a single request is sent to, so nobody's inbox fills with noise. */
const MAX_ALERTS = 25;

/** "Wedding — Photographers, Caterers" → the service slugs ticked on the form. */
function requestedServices(lead: Pick<Lead, "category">) {
  const [, list = ""] = lead.category.split("—");
  return list
    .split(",")
    .map((name) => name.trim())
    .filter((name) => name && name !== "not decided yet")
    .map(weddingServiceSlug);
}

export function isWeddingLead(lead: Pick<Lead, "category" | "categorySlug">) {
  return (
    lead.categorySlug?.startsWith(WEDDING_SLUG) === true ||
    /wedding/i.test(lead.category)
  );
}

/**
 * Sends a fresh wedding requirement to the vendors who can serve it: the ticked
 * services in the couple's town first, then the same services elsewhere in that
 * state. The couple's phone stays locked — the alert only says a request is
 * waiting, so vendors still unlock it from /wedding/requirements.
 */
export async function alertWeddingVendors(lead: Lead) {
  const services = requestedServices(lead);
  const serviceFilter = services.length
    ? {
        OR: [
          { subcategorySlug: { in: services } },
          { extraCategorySlugs: { hasSome: services } },
        ],
      }
    : {};
  const base = {
    status: "APPROVED" as const,
    categorySlug: WEDDING_SLUG,
    ownerId: { not: null },
    ...serviceFilter,
  };
  const select = {
    id: true,
    ownerId: true,
    owner: { select: { email: true } },
  } as const;

  const local = await db.business.findMany({
    where: { ...base, city: { equals: lead.city, mode: "insensitive" } },
    orderBy: { featuredRank: "desc" },
    take: MAX_ALERTS,
    select,
  });

  let nearby: typeof local = [];
  if (local.length < MAX_ALERTS) {
    const town = await db.business.findFirst({
      where: { city: { equals: lead.city, mode: "insensitive" }, state: { not: null } },
      select: { state: true },
    });
    if (town?.state) {
      nearby = await db.business.findMany({
        where: {
          ...base,
          state: town.state,
          id: { notIn: local.map((row) => row.id) },
        },
        orderBy: { featuredRank: "desc" },
        take: MAX_ALERTS - local.length,
        select,
      });
    }
  }

  const vendors = [...local, ...nearby].filter(
    (row) => row.ownerId && row.ownerId !== lead.clientId,
  );
  if (!vendors.length) return 0;

  const href = `/wedding/requirements?city=${encodeURIComponent(lead.city)}`;
  const when = lead.eventDate ? ` on ${lead.eventDate.toDateString()}` : "";
  const title = `💍 New wedding request in ${lead.city}`;
  const body = `${lead.title}${when}. Open it on GoDesi to reply.`;

  await Promise.allSettled(
    vendors.map(async (row) => {
      await notify({ userId: row.ownerId as string, title, body, href });
      if (!emailEnabled() || !row.owner?.email) return;
      await sendEmail({
        to: row.owner.email,
        subject: title,
        html: shell(
          title,
          `<p style="margin:0 0 12px">A family just posted a wedding requirement that matches your business:</p>
           <p style="margin:0 0 12px;font-weight:700">${escapeHtml(lead.title)}${escapeHtml(when)}</p>
           <p style="margin:0 0 16px">${escapeHtml(lead.description.slice(0, 280))}</p>
           <p><a href="${siteUrl()}${href}" style="display:inline-block;background:#e11d48;color:#fff;padding:10px 18px;border-radius:10px;font-weight:700;text-decoration:none">See the request</a></p>
           <p style="margin:16px 0 0;font-size:12px;color:#64748b">You get these because your wedding business is listed on GoDesi.</p>`,
        ),
      });
    }),
  );
  return vendors.length;
}

function escapeHtml(text: string) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
