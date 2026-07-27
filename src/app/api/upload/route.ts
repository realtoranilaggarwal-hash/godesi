import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { mediaLimit } from "@/lib/plans";
import { storeImage, uploadsEnabled, validateImage } from "@/lib/uploads";

const FOLDERS = {
  avatar: "avatars",
  gallery: "gallery",
  event: "events",
  logo: "listings",
  banner: "banners",
} as const;

type Purpose = keyof typeof FOLDERS;

function isPurpose(value: string): value is Purpose {
  return value in FOLDERS;
}

/**
 * Single-image upload endpoint. Images are resized in the browser before they
 * arrive here; this route owns authentication, type/size checks and — for
 * gallery images — the per-plan allowance.
 */
export async function POST(request: Request) {
  if (!uploadsEnabled()) {
    return NextResponse.json(
      { error: "Uploads are not configured yet." },
      { status: 503 },
    );
  }

  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Please sign in first." }, { status: 401 });
  }

  const form = await request.formData().catch(() => null);
  const file = form?.get("file");
  const purposeRaw = String(form?.get("purpose") ?? "");

  if (!(file instanceof File) || !isPurpose(purposeRaw)) {
    return NextResponse.json({ error: "No image received." }, { status: 400 });
  }

  const invalid = validateImage(file);
  if (invalid) return NextResponse.json({ error: invalid }, { status: 400 });

  if (purposeRaw === "gallery") {
    const business = await db.business.findUnique({ where: { ownerId: user.id } });
    if (!business) {
      return NextResponse.json(
        { error: "Create your business profile first." },
        { status: 400 },
      );
    }
    const [count, limit] = [
      await db.media.count({ where: { businessId: business.id } }),
      mediaLimit(user),
    ];
    if (count >= limit) {
      return NextResponse.json(
        {
          error: `Your plan allows ${limit} images. Upgrade at /pricing to add more.`,
        },
        { status: 403 },
      );
    }

    const url = await storeImage({ file, folder: "gallery", ownerId: user.id });
    const media = await db.media.create({
      data: { businessId: business.id, url, type: "IMAGE", sortOrder: count },
    });
    return NextResponse.json({ url, id: media.id, used: count + 1, limit });
  }

  const url = await storeImage({
    file,
    folder: FOLDERS[purposeRaw],
    ownerId: user.id,
  });
  return NextResponse.json({ url });
}
