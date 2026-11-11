"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { type ActionState, fieldError } from "@/lib/actions";
import { pingIndexNowInBackground } from "@/lib/indexNow";
import { titleCase } from "@/lib/titlecase";
import { rememberVenue, venuePath } from "@/lib/venues";

const optionalUrl = z
  .string()
  .trim()
  .url("Enter a valid URL, starting with https://")
  .optional()
  .or(z.literal("").transform(() => undefined));

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .transform((value) => value || undefined);

const venueSchema = z.object({
  name: z.string().trim().min(3, "Venue name is required").max(120),
  city: z.string().trim().min(2, "City is required").max(80),
  state: optionalText(60),
  country: optionalText(60),
  address: optionalText(300),
  website: optionalUrl,
  mapsUrl: optionalUrl,
});

/**
 * Adds a venue page. A venue already on Godesi under the same name and city is
 * not duplicated: its blank details are filled in and the owner lands on it.
 */
export async function createVenueAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  let path: string;
  try {
    await requireUser();
    const parsed = venueSchema.safeParse({
      name: formData.get("name") ?? undefined,
      city: formData.get("city") ?? undefined,
      state: formData.get("state") ?? undefined,
      country: formData.get("country") ?? undefined,
      address: formData.get("address") ?? undefined,
      website: formData.get("website") ?? undefined,
      mapsUrl: formData.get("mapsUrl") ?? undefined,
    });
    if (!parsed.success) {
      return { error: parsed.error.issues[0]?.message ?? "Check the form." };
    }
    const venue = await rememberVenue({
      name: titleCase(parsed.data.name),
      city: titleCase(parsed.data.city),
      state: parsed.data.state ?? null,
      country: parsed.data.country ?? null,
      address: parsed.data.address ?? null,
      website: parsed.data.website ?? null,
      mapsUrl: parsed.data.mapsUrl ?? null,
    });
    path = venuePath(venue);
    pingIndexNowInBackground(path);
  } catch (error) {
    return fieldError(error);
  }
  redirect(path);
}
