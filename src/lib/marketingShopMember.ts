import type { User } from "@prisma/client";
import { db } from "@/lib/db";
import { siteUrl } from "@/lib/format";

export type MarketingShopMember = {
  name: string;
  email: string;
  phone: string;
  business: string;
  /** Where the QR code printed on every item points: their business page, else their member profile. */
  qrUrl: string;
  website: string;
  hasBusiness: boolean;
};

/** The signed-in buyer plus their GoDesi business page, so the team knows which QR and details to print. */
export async function marketingShopMember(user: User): Promise<MarketingShopMember> {
  const business = await db.business.findUnique({
    where: { ownerId: user.id },
    select: { name: true, slug: true, phone: true, websiteUrl: true },
  });
  const qrUrl = business
    ? `${siteUrl()}/business/${business.slug}`
    : user.username
      ? `${siteUrl()}/${user.username}`
      : "";
  return {
    name: user.name,
    email: user.email,
    phone: business?.phone ?? user.phone ?? "",
    business: business?.name ?? "",
    qrUrl,
    website: business?.websiteUrl ?? "",
    hasBusiness: Boolean(business),
  };
}
