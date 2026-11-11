"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { slugify } from "@/lib/slug";
import { DEFAULT_DISCLOSURE, WELLNESS_CATEGORIES } from "@/lib/wellness";

async function requireAdmin() {
  const user = await requireUser();
  if (user.role !== "ADMIN") throw new Error("FORBIDDEN");
  return user;
}

const optionalUrl = z
  .string()
  .trim()
  .max(2000)
  .refine((value) => !value || /^https?:\/\//.test(value) || value.startsWith("/"), "Use a full https:// link or a /path")
  .transform((value) => value || null);

const productSchema = z.object({
  name: z.string().trim().min(2).max(120),
  merchantName: z.string().trim().min(2).max(80),
  description: z.string().trim().max(400).transform((value) => value || null),
  imageUrl: optionalUrl,
  regularUrl: optionalUrl,
  affiliateUrl: z
    .string()
    .trim()
    .max(2000)
    .refine((value) => !value || /^https:\/\//.test(value), "Affiliate link must start with https://")
    .transform((value) => value || null),
  category: z.enum(WELLNESS_CATEGORIES.map((c) => c.slug) as [string, ...string[]]),
  disclosureText: z.string().trim().max(300).transform((value) => value || DEFAULT_DISCLOSURE),
  active: z.boolean(),
});

const ebookSchema = z.object({
  title: z.string().trim().min(3).max(140),
  description: z.string().trim().min(10).max(8000),
  coverUrl: optionalUrl,
  pdfUrl: z
    .string()
    .trim()
    .min(3, "Give the PDF file name in private/ebooks/ or a full https:// link")
    .max(2000),
  active: z.boolean(),
});

function done(message: string): never {
  revalidateTag("wellness-products");
  revalidateTag("wellness-ebook");
  revalidatePath("/admin/wellness");
  redirect(`/admin/wellness?msg=${encodeURIComponent(message)}`);
}

function fail(message: string): never {
  redirect(`/admin/wellness?err=${encodeURIComponent(message)}`);
}

async function uniqueSlug(model: "product" | "ebook", text: string, id?: string) {
  const base = slugify(text).slice(0, 70) || model;
  let slug = base;
  for (let attempt = 2; ; attempt += 1) {
    const clash =
      model === "product"
        ? await db.wellnessProduct.findUnique({ where: { slug }, select: { id: true } })
        : await db.wellnessEbook.findUnique({ where: { slug }, select: { id: true } });
    if (!clash || clash.id === id) return slug;
    slug = `${base}-${attempt}`;
  }
}

/** Admin: add or update a reusable wellness product. */
export async function saveWellnessProductAction(formData: FormData) {
  await requireAdmin();
  const parsed = productSchema.safeParse({
    name: formData.get("name") ?? "",
    merchantName: formData.get("merchantName") ?? "",
    description: formData.get("description") ?? "",
    imageUrl: formData.get("imageUrl") ?? "",
    regularUrl: formData.get("regularUrl") ?? "",
    affiliateUrl: formData.get("affiliateUrl") ?? "",
    category: formData.get("category") ?? "",
    disclosureText: formData.get("disclosureText") ?? "",
    active: formData.get("active") === "on",
  });
  if (!parsed.success) fail(parsed.error.issues[0].message);
  const id = String(formData.get("id") ?? "") || undefined;
  const data = { ...parsed.data, slug: await uniqueSlug("product", parsed.data.name, id) };
  if (id) await db.wellnessProduct.update({ where: { id }, data });
  else await db.wellnessProduct.create({ data });
  done(id ? "Product saved." : "Product added.");
}

export async function deleteWellnessProductAction(formData: FormData) {
  await requireAdmin();
  await db.wellnessProduct.delete({ where: { id: String(formData.get("id")) } }).catch(() => null);
  done("Product deleted.");
}

/** Admin: add or update the free ebook. */
export async function saveWellnessEbookAction(formData: FormData) {
  await requireAdmin();
  const parsed = ebookSchema.safeParse({
    title: formData.get("title") ?? "",
    description: formData.get("description") ?? "",
    coverUrl: formData.get("coverUrl") ?? "",
    pdfUrl: formData.get("pdfUrl") ?? "",
    active: formData.get("active") === "on",
  });
  if (!parsed.success) fail(parsed.error.issues[0].message);
  const id = String(formData.get("id") ?? "") || undefined;
  const data = { ...parsed.data, slug: await uniqueSlug("ebook", parsed.data.title, id) };
  if (id) await db.wellnessEbook.update({ where: { id }, data });
  else await db.wellnessEbook.create({ data });
  done(id ? "eBook saved." : "eBook added.");
}

export async function deleteWellnessEbookAction(formData: FormData) {
  await requireAdmin();
  await db.wellnessEbook.delete({ where: { id: String(formData.get("id")) } }).catch(() => null);
  done("eBook deleted.");
}
