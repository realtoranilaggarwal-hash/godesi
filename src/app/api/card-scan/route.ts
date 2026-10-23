import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { effectivePlan } from "@/lib/plans";
import { extractCardFields } from "@/lib/cardScan";

export const dynamic = "force-dynamic";

/** Premium members (and founding members, who get premium perks) can use the scanner. */
function canScan(user: { plan: "FREE" | "PRO" | "PREMIUM"; planExpiresAt: Date | null; foundingNumber: number | null; role: string }) {
  return (
    user.role === "ADMIN" ||
    effectivePlan(user) === "PREMIUM" ||
    user.foundingNumber !== null
  );
}

const saveSchema = z.object({
  mode: z.literal("save"),
  fields: z.object({
    phone: z.string().trim().max(40).optional(),
    whatsapp: z.string().trim().max(40).optional(),
    email: z.string().trim().max(120).optional(),
    website: z.string().trim().max(200).optional(),
    address: z.string().trim().max(200).optional(),
    city: z.string().trim().max(80).optional(),
    state: z.string().trim().max(80).optional(),
  }),
});

/** ~1.4MB of base64 — the client downscales photos before sending. */
const MAX_IMAGE_CHARS = 1_900_000;

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Log in first" }, { status: 401 });
  }
  if (!canScan(user)) {
    return NextResponse.json(
      { error: "Card scanning is a Premium feature" },
      { status: 403 },
    );
  }
  const business = await db.business.findUnique({
    where: { ownerId: user.id },
    select: { id: true, slug: true },
  });
  if (!business) {
    return NextResponse.json(
      { error: "Create your GoDesi card first" },
      { status: 400 },
    );
  }

  const body = (await request.json().catch(() => null)) as
    | { mode?: string; image?: string; fields?: unknown }
    | null;
  if (!body?.mode) {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }

  if (body.mode === "scan") {
    const image = typeof body.image === "string" ? body.image : "";
    const match = image.match(/^data:(image\/(?:jpeg|jpg|png|webp));base64,(.+)$/);
    if (!match) {
      return NextResponse.json(
        { error: "Send a JPEG, PNG or WebP photo" },
        { status: 400 },
      );
    }
    if (match[2].length > MAX_IMAGE_CHARS) {
      return NextResponse.json(
        { error: "Photo too large — try a tighter shot" },
        { status: 400 },
      );
    }
    try {
      const fields = await extractCardFields({
        data: match[2],
        mimeType: match[1] === "image/jpg" ? "image/jpeg" : match[1],
      });
      return NextResponse.json({ ok: true, fields });
    } catch (error) {
      return NextResponse.json(
        { error: error instanceof Error ? error.message : "Scan failed" },
        { status: 422 },
      );
    }
  }

  if (body.mode === "save") {
    const parsed = saveSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Check the fields" }, { status: 400 });
    }
    const { fields } = parsed.data;
    const website = fields.website
      ? /^https?:\/\//i.test(fields.website)
        ? fields.website
        : `https://${fields.website}`
      : undefined;

    await db.business.update({
      where: { id: business.id },
      data: {
        ...(fields.phone ? { phone: fields.phone } : {}),
        ...(fields.whatsapp ? { whatsappNumber: fields.whatsapp } : {}),
        ...(fields.email ? { publicEmail: fields.email } : {}),
        ...(website ? { websiteUrl: website } : {}),
        ...(fields.address ? { address: fields.address } : {}),
        ...(fields.city ? { city: fields.city } : {}),
        ...(fields.state ? { state: fields.state } : {}),
      },
    });
    return NextResponse.json({ ok: true, slug: business.slug });
  }

  return NextResponse.json({ error: "Bad request" }, { status: 400 });
}
