"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/auth";
import { readBusinessLink } from "@/lib/businessLink";
import { normalizeWhatsApp } from "@/lib/format";
import { uniqueSlug } from "@/lib/slug";
import { titleCase } from "@/lib/titlecase";

const DESK = "/admin/listings/wire";

/** Next's redirect() works by throwing, so it must pass through a catch. */
function isRedirect(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    typeof (error as { digest?: unknown }).digest === "string" &&
    (error as { digest: string }).digest.startsWith("NEXT_REDIRECT")
  );
}

/** Sends the desk back with a reason rather than losing what it typed. */
function reject(reason: string): never {
  redirect(`${DESK}?error=${encodeURIComponent(reason)}`);
}

function refresh() {
  revalidatePath(DESK);
  revalidatePath("/search");
}

/**
 * Reads a pasted business page and hands the facts back to be confirmed. The
 * draft travels in the URL: nothing is stored until a person has looked at it.
 */
export async function readBusinessLinkAction(formData: FormData) {
  await requirePermission("listings");
  const link = String(formData.get("link") ?? "").trim();
  if (!/^https?:\/\//i.test(link)) {
    reject("Paste the business's own web address, starting with https://");
  }

  const host = new URL(link).hostname.replace(/^www\./, "");
  let draft;
  try {
    draft = await readBusinessLink(link);
  } catch (error) {
    // A page that hides behind a login still gets a form, prefilled with the
    // link: the desk types what it can see on its own screen.
    redirect(
      `${DESK}?${new URLSearchParams({
        link,
        host,
        missing: "anything",
        error: `Could not read that page (${
          error instanceof Error ? error.message : "failed"
        }) — fill the fields in from what you can see.`,
      }).toString()}#confirm`,
    );
  }

  redirect(
    `${DESK}?${new URLSearchParams({
      link: draft.sourceUrl,
      host: draft.host,
      name: draft.name,
      about: draft.about.slice(0, 1200),
      phone: draft.phone,
      website: draft.websiteUrl,
      address: draft.address,
      city: draft.city,
      state: draft.state,
      category: draft.categorySlug,
      type: draft.professional ? "PROFESSIONAL" : "BUSINESS",
      missing: draft.missing.join(", "),
    }).toString()}#confirm`,
  );
}

const linkedSchema = z.object({
  name: z.string().trim().min(2, "Give the business a name.").max(120),
  city: z.string().trim().min(2, "City is needed.").max(80),
  state: z.string().trim().max(40).optional(),
  categorySlug: z.string().trim().min(1, "Pick a category."),
  subcategorySlug: z.string().trim().optional(),
  address: z.string().trim().max(240).optional(),
  description: z.string().trim().max(3000).optional(),
  phone: z.string().trim().max(30).optional(),
  websiteUrl: z
    .string()
    .trim()
    .max(300)
    .optional()
    .or(z.literal("").transform(() => undefined)),
  sourceUrl: z.string().trim().url("Keep the link to the page it came from.").max(500),
  profileType: z.enum(["BUSINESS", "PROFESSIONAL"]).default("BUSINESS"),
  publishPhone: z.string().trim().optional(),
});

/**
 * Saves the confirmed draft as an unclaimed card the business can claim, with
 * the page it came from credited on it.
 */
export async function saveLinkedBusinessAction(formData: FormData) {
  await requirePermission("listings");
  const parsed = linkedSchema.safeParse({
    name: formData.get("name"),
    city: formData.get("city"),
    state: formData.get("state") || undefined,
    categorySlug: formData.get("categorySlug"),
    subcategorySlug: formData.get("subcategorySlug") || undefined,
    address: formData.get("address") || undefined,
    description: formData.get("description") || undefined,
    phone: formData.get("phone") || undefined,
    websiteUrl: formData.get("websiteUrl") || undefined,
    sourceUrl: formData.get("sourceUrl"),
    profileType: formData.get("profileType") || "BUSINESS",
    publishPhone: formData.get("publishPhone") || undefined,
  });
  if (!parsed.success) {
    reject(parsed.error.issues.map((issue) => issue.message).join(" "));
  }

  const category = await db.category.findUnique({
    where: { slug: parsed.data.categorySlug },
    include: { children: { select: { slug: true, name: true } } },
  });
  if (!category || category.parentSlug) reject("Pick a category from the list.");
  const subcategory = parsed.data.subcategorySlug
    ? category.children.find((child) => child.slug === parsed.data.subcategorySlug)
    : undefined;

  const already = await db.business.findFirst({
    where: {
      OR: [
        { sourceUrl: parsed.data.sourceUrl },
        {
          name: { equals: parsed.data.name, mode: "insensitive" },
          city: { equals: parsed.data.city, mode: "insensitive" },
        },
      ],
    },
    select: { slug: true, name: true },
  });
  if (already) {
    reject(`“${already.name}” is already listed as /b/${already.slug}`);
  }

  const city = titleCase(parsed.data.city);
  const host = new URL(parsed.data.sourceUrl).hostname.replace(/^www\./, "");
  // A number read off someone else's page is only published when the desk says
  // it is the business's own public number; otherwise it is kept for the
  // invite so we can ask the owner to claim the card.
  const publish = parsed.data.publishPhone === "on" && Boolean(parsed.data.phone);

  try {
    await db.business.create({
      data: {
        slug: await uniqueSlug(parsed.data.name, city),
        name: parsed.data.name,
        city,
        state: parsed.data.state || null,
        categorySlug: category.slug,
        subcategorySlug: subcategory?.slug ?? null,
        category: subcategory?.name ?? category.name,
        address: parsed.data.address || null,
        description: parsed.data.description || null,
        phone: publish ? (parsed.data.phone ?? null) : null,
        whatsappNumber:
          publish && parsed.data.phone
            ? normalizeWhatsApp(parsed.data.phone)
            : null,
        websiteUrl: parsed.data.websiteUrl ?? null,
        profileType: parsed.data.profileType,
        status: "APPROVED",
        source: host,
        sourceUrl: parsed.data.sourceUrl,
        inviteNote:
          !publish && parsed.data.phone
            ? `Number published on ${host}: ${parsed.data.phone} (not shown on the card)`
            : null,
      },
    });
  } catch (error) {
    if (isRedirect(error)) throw error;
    reject(
      `Could not save that listing: ${
        error instanceof Error ? error.message.slice(0, 300) : "unknown error"
      }`,
    );
  }

  refresh();
  redirect(`${DESK}?added=1`);
}

/** Takes a hand-added card off the site; nothing brings it back by itself. */
export async function removeLinkedBusinessAction(formData: FormData) {
  await requirePermission("listings");
  const id = String(formData.get("id") ?? "");
  const business = await db.business.findUnique({
    where: { id },
    select: { id: true, ownerId: true, sourceUrl: true },
  });
  // Only unclaimed rows we added ourselves: a claimed card belongs to its owner.
  if (!business?.sourceUrl || business.ownerId) return;

  await db.business.update({
    where: { id: business.id },
    data: { status: "REJECTED" },
  });
  refresh();
}
