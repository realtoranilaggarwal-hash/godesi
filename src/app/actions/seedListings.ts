"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { uniqueSlug } from "@/lib/slug";
import { normalizeWhatsApp } from "@/lib/format";
import { type ActionState, fieldError } from "@/lib/actions";

/**
 * Starter listings an admin types (or pastes as CSV). They have no owner until a
 * business claims them, so they carry only public, non-scraped basics.
 */

const rowSchema = z.object({
  name: z.string().trim().min(2, "Name is required"),
  city: z.string().trim().min(2, "City is required"),
  categorySlug: z.string().trim().min(1, "Category is required"),
  subcategorySlug: z.string().trim().optional(),
  state: z.string().trim().optional(),
  phone: z.string().trim().optional(),
  whatsappNumber: z.string().trim().optional(),
  websiteUrl: z.string().trim().optional(),
  address: z.string().trim().optional(),
  description: z.string().trim().max(2000).optional(),
  profileType: z
    .string()
    .trim()
    .optional()
    .transform((value) => (value ? value.toUpperCase() : ""))
    .refine(
      (value) => value === "" || value === "BUSINESS" || value === "PROFESSIONAL",
      "Type must be business or professional",
    ),
});

type Row = z.infer<typeof rowSchema>;

async function createSeedListing(row: Row) {
  const category = await db.category.findUnique({
    where: { slug: row.categorySlug },
    include: { children: { select: { slug: true, name: true } } },
  });
  if (!category || category.parentSlug) throw new Error(`Unknown category "${row.categorySlug}"`);

  const subcategory = row.subcategorySlug
    ? category.children.find((child) => child.slug === row.subcategorySlug)
    : undefined;

  const duplicate = await db.business.findFirst({
    where: { name: { equals: row.name, mode: "insensitive" }, city: { equals: row.city, mode: "insensitive" } },
    select: { id: true },
  });
  if (duplicate) throw new Error(`"${row.name}" already exists in ${row.city}`);

  await db.business.create({
    data: {
      slug: await uniqueSlug(row.name, row.city),
      name: row.name,
      city: row.city,
      state: row.state || null,
      categorySlug: category.slug,
      subcategorySlug: subcategory?.slug ?? null,
      category: subcategory?.name ?? category.name,
      phone: row.phone || null,
      whatsappNumber: row.whatsappNumber ? normalizeWhatsApp(row.whatsappNumber) : null,
      websiteUrl: row.websiteUrl || null,
      address: row.address || null,
      description: row.description || null,
      profileType: row.profileType === "PROFESSIONAL" ? "PROFESSIONAL" : "BUSINESS",
      status: "APPROVED",
    },
  });
}

export async function addSeedListingAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    await requireRole("ADMIN");
    const parsed = rowSchema.safeParse({
      name: formData.get("name"),
      city: formData.get("city"),
      state: formData.get("state"),
      categorySlug: formData.get("categorySlug"),
      subcategorySlug: formData.get("subcategorySlug") || undefined,
      phone: formData.get("phone"),
      whatsappNumber: formData.get("whatsappNumber"),
      websiteUrl: formData.get("websiteUrl"),
      profileType: formData.get("profileType"),
    });
    if (!parsed.success) return { error: parsed.error.issues[0].message };

    await createSeedListing(parsed.data);
  } catch (error) {
    return fieldError(error);
  }
  revalidatePath("/admin");
  revalidatePath("/search");
  return { success: "Seed listing added." };
}

/** Splits a CSV line, honouring "quoted, values". */
function splitCsvLine(line: string) {
  const cells: string[] = [];
  let current = "";
  let quoted = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    if (char === '"') {
      if (quoted && line[i + 1] === '"') {
        current += '"';
        i += 1;
      } else {
        quoted = !quoted;
      }
    } else if (char === "," && !quoted) {
      cells.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }
  cells.push(current.trim());
  return cells;
}

const CSV_COLUMNS = [
  "name",
  "city",
  "categorySlug",
  "subcategorySlug",
  "profileType",
  "state",
  "phone",
  "whatsappNumber",
  "websiteUrl",
  "address",
  "description",
] as const;

export const CSV_HEADER = CSV_COLUMNS.join(",");

export async function importSeedListingsAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    await requireRole("ADMIN");

    const upload = formData.get("file");
    const pasted = String(formData.get("csv") ?? "");
    const text =
      upload instanceof File && upload.size ? await upload.text() : pasted;
    const lines = text
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);
    if (!lines.length) return { error: "Paste some CSV or choose a file first." };

    const header = splitCsvLine(lines[0]).map((cell) => cell.replace(/^\uFEFF/, ""));
    const hasHeader = header[0]?.toLowerCase() === "name";
    const columns = hasHeader ? header : [...CSV_COLUMNS];
    const body = hasHeader ? lines.slice(1) : lines;
    if (body.length > 100) return { error: "Import up to 100 rows at a time." };

    let created = 0;
    const problems: string[] = [];

    for (let index = 0; index < body.length; index += 1) {
      const line = body[index];
      const cells = splitCsvLine(line);
      const record = Object.fromEntries(
        columns.map((column, position) => [column, cells[position] ?? ""]),
      );
      const parsed = rowSchema.safeParse({
        ...record,
        subcategorySlug: record.subcategorySlug || undefined,
      });
      if (!parsed.success) {
        problems.push(`Row ${index + 1}: ${parsed.error.issues[0].message}`);
        continue;
      }
      try {
        // eslint-disable-next-line no-await-in-loop
        await createSeedListing(parsed.data);
        created += 1;
      } catch (error) {
        problems.push(`Row ${index + 1}: ${(error as Error).message}`);
      }
    }

    revalidatePath("/admin");
    revalidatePath("/search");

    if (!created) return { error: problems.slice(0, 5).join(" · ") || "Nothing imported." };
    return {
      success: problems.length
        ? `Imported ${created} listing(s). Skipped: ${problems.slice(0, 5).join(" · ")}`
        : `Imported ${created} listing(s).`,
    };
  } catch (error) {
    return fieldError(error);
  }
}
