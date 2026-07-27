"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { type ActionState, fieldError } from "@/lib/actions";
import { normalizeUsername, usernameError } from "@/lib/profiles";

const schema = z.object({
  name: z.string().trim().min(2, "Your name is required"),
  username: z.string().trim().min(3, "Pick a username"),
  bio: z.string().trim().max(500, "Keep your bio under 500 characters").optional(),
  location: z.string().trim().max(120).optional(),
  avatarUrl: z
    .string()
    .trim()
    .url("Upload a photo or paste a valid image URL")
    .optional()
    .or(z.literal("").transform(() => undefined)),
});

export async function savePersonalProfileAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const user = await requireUser();
    const value = (key: string) => String(formData.get(key) ?? "");

    const parsed = schema.safeParse({
      name: value("name"),
      username: value("username"),
      bio: value("bio"),
      location: value("location"),
      avatarUrl: value("avatarUrl"),
    });
    if (!parsed.success) return { error: parsed.error.issues[0].message };

    const username = normalizeUsername(parsed.data.username);
    const invalid = usernameError(username);
    if (invalid) return { error: invalid };

    const taken = await db.user.findUnique({
      where: { username },
      select: { id: true },
    });
    if (taken && taken.id !== user.id) {
      return { error: "That username is already taken — try another." };
    }

    const previous = user.username;
    await db.user.update({
      where: { id: user.id },
      data: {
        name: parsed.data.name,
        username,
        bio: parsed.data.bio || null,
        location: parsed.data.location || null,
        avatarUrl: parsed.data.avatarUrl ?? null,
      },
    });

    revalidatePath("/dashboard/me");
    revalidatePath(`/${username}`);
    if (previous && previous !== username) revalidatePath(`/${previous}`);
    return { success: `Saved. Your profile is live at godesi.com/${username}` };
  } catch (error) {
    return fieldError(error);
  }
}
