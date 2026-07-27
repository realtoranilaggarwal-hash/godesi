import { put } from "@vercel/blob";
import type { Plan } from "@prisma/client";

/** Gallery allowance: free listings keep 5 images, paid plans get 20. */
export const IMAGE_LIMITS: Record<Plan, number> = {
  FREE: 5,
  PRO: 20,
  PREMIUM: 20,
};

export const MAX_UPLOAD_BYTES = 6 * 1024 * 1024;
const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export function uploadsEnabled() {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

export function imageLimit(plan: Plan) {
  return IMAGE_LIMITS[plan];
}

export function validateImage(file: File) {
  if (!ALLOWED.includes(file.type)) {
    return "Upload a JPG, PNG, WebP or GIF image.";
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    return "Images must be 6 MB or smaller — try a smaller photo.";
  }
  return null;
}

function extensionFor(type: string) {
  if (type === "image/png") return "png";
  if (type === "image/webp") return "webp";
  if (type === "image/gif") return "gif";
  return "jpg";
}

/**
 * Stores an image in Vercel Blob under a per-owner folder and returns its
 * public URL. Blob generates a random suffix, so uploads never collide.
 */
export async function storeImage({
  file,
  folder,
  ownerId,
}: {
  file: File;
  folder: "avatars" | "gallery" | "events" | "listings" | "banners";
  ownerId: string;
}) {
  const blob = await put(
    `${folder}/${ownerId}/${Date.now()}.${extensionFor(file.type)}`,
    file,
    { access: "public", addRandomSuffix: true, contentType: file.type },
  );
  return blob.url;
}
