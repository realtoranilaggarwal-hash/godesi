import { db } from "@/lib/db";
import { nextPosition } from "@/lib/banners";
import { sendEmail, shell } from "@/lib/email";
import { siteUrl } from "@/lib/format";
import { notify } from "@/lib/notifications";

const MONTH_MS = 30 * 24 * 60 * 60 * 1000;

export function bannerArtUrl(bannerId: string) {
  return `${siteUrl()}/api/banners/${bannerId}/art`;
}

/**
 * Turns a points redemption into a live 300×250 sidebar banner for a month,
 * built from the member's business card (or their profile when they have no
 * card), and emails them that it is up. Returns false when the member has
 * nowhere on GoDesi for the banner to link to.
 */
export async function publishPointsBanner(userId: string) {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: {
      name: true,
      email: true,
      username: true,
      headline: true,
      business: {
        select: { slug: true, name: true, category: true, city: true },
      },
    },
  });
  if (!user) return false;

  const business = user.business;
  const path = business
    ? `/b/${business.slug}`
    : user.username
      ? `/${user.username}`
      : null;
  if (!path) return false;

  const name = business?.name ?? user.name;
  const line = business
    ? `${business.category} · ${business.city}`
    : (user.headline ?? "");
  const startsAt = new Date();
  const endsAt = new Date(startsAt.getTime() + MONTH_MS);

  const created = await db.banner.create({
    data: {
      slot: "SIDEBAR",
      position: await nextPosition("SIDEBAR"),
      title: line ? `${name} — ${line}` : name,
      imageUrl: `${siteUrl()}/logo-godesi.png`,
      linkUrl: `${siteUrl()}${path}`,
      status: "ACTIVE",
      active: true,
      startsAt,
      endsAt,
      advertiserId: userId,
    },
  });
  const art = bannerArtUrl(created.id);
  await db.banner.update({
    where: { id: created.id },
    data: { imageUrl: art },
  });

  const until = endsAt.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
  await notify({
    userId,
    title: "Your banner is live 🎉",
    body: `It shows in the GoDesi sidebar until ${until}.`,
    href: path,
  });
  await sendEmail({
    to: user.email,
    subject: "Your GoDesi banner is live",
    html: shell(
      "Your banner is live 🎉",
      `<p style="margin:0 0 12px;color:#334155">Thanks for using your points! We made this 300 × 250 banner from your ${
        business ? "business card" : "profile"
      } and it now rotates in the sidebar beside listings, events and news on GoDesi until <strong>${until}</strong>.</p>
       <p style="margin:0 0 16px"><img src="${art}" alt="${name.replace(/"/g, "&quot;")}" width="300" height="250" style="border:1px solid #e2e8f0;border-radius:12px" /></p>
       <p style="margin:0 0 16px;color:#334155">Anyone who clicks it lands on <a href="${siteUrl()}${path}" style="color:#4f46e5">${siteUrl().replace(/^https?:\/\//, "")}${path}</a> — keep your ${
         business ? "card" : "profile"
       } photos and details up to date, because the banner picks them up automatically.</p>
       <p style="margin:0"><a href="${siteUrl()}${path}" style="display:inline-block;background:#4f46e5;color:#fff;border-radius:10px;padding:12px 18px;font-weight:700;text-decoration:none">See my page</a></p>`,
    ),
  });
  return true;
}
