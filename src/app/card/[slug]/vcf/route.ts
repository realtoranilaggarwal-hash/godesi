import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { siteUrl } from "@/lib/format";
import { effectivePlan } from "@/lib/plans";
import { vCard } from "@/lib/vcard";

/** "Save contact" download on the digital card — a .vcf the phone imports as a contact. */
export async function GET(
  _request: Request,
  { params }: { params: { slug: string } },
) {
  const business = await db.business.findUnique({
    where: { slug: params.slug },
    select: {
      slug: true,
      name: true,
      status: true,
      category: true,
      city: true,
      state: true,
      address: true,
      websiteUrl: true,
      phone: true,
      publicEmail: true,
      hideContact: true,
      owner: { select: { plan: true, planExpiresAt: true } },
    },
  });
  if (!business || business.status !== "APPROVED") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Same rule as the public profile: free cards are WhatsApp-only, so the
  // saved contact gets name + links but no phone/email for unpaid listings.
  const paidContact = business.owner
    ? effectivePlan(business.owner) !== "FREE" && !business.hideContact
    : false;

  const cardUrl = `${siteUrl()}/business/${business.slug}`;
  const file = vCard({
    name: business.name,
    phone: paidContact ? business.phone : null,
    email: paidContact ? business.publicEmail : null,
    website: business.websiteUrl,
    cardUrl,
    address:
      business.address ??
      [business.city, business.state].filter(Boolean).join(", "),
    note: `${business.category} — saved from GoDesi (${cardUrl})`,
  });

  return new NextResponse(file, {
    headers: {
      "Content-Type": "text/vcard; charset=utf-8",
      "Content-Disposition": `attachment; filename="${business.slug}.vcf"`,
      "Cache-Control": "public, max-age=3600",
    },
  });
}
