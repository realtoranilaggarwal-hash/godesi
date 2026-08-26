"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { emailEnabled } from "@/lib/email";
import { INVITE_MAX_PER_SUBMIT } from "@/lib/inviteLimits";
import {
  canonicalEmail,
  parseInviteEmails,
  sendInvites,
} from "@/lib/invites";
import { type ActionState, fieldError } from "@/lib/actions";

const NOTE_MAX = 300;

/**
 * Sends invitations to the addresses a member typed in themselves. Nothing is
 * imported from anybody's address book, and no points are awarded here: the
 * referral flow pays out only if an invited friend really creates an account.
 */
export async function inviteFriendsAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const user = await requireUser();
    if (!user.username) {
      return {
        error: "Pick your godesi.com/name first — the invite carries that link.",
      };
    }

    const { emails, rejected } = parseInviteEmails(
      String(formData.get("emails") ?? ""),
    );
    const own = canonicalEmail(user.email ?? "");
    const friends = emails.filter((email) => email !== own);

    if (!friends.length) {
      return {
        error: rejected.length
          ? `That does not look like an email address: ${rejected.slice(0, 3).join(", ")}`
          : "Add at least one friend's email address.",
      };
    }
    if (friends.length > INVITE_MAX_PER_SUBMIT) {
      return {
        error: `${INVITE_MAX_PER_SUBMIT} addresses at a time, please — you pasted ${friends.length}.`,
      };
    }
    if (!emailEnabled()) {
      return {
        error:
          "Invites are switched off right now. Share your referral link instead — it earns the same points.",
      };
    }

    const result = await sendInvites({
      inviter: { id: user.id, name: user.name, username: user.username },
      emails: friends,
      note: String(formData.get("note") ?? "")
        .trim()
        .slice(0, NOTE_MAX),
    });

    const notes: string[] = [];
    if (result.skippedAlready)
      notes.push(`${result.skippedAlready} already invited by you`);
    if (result.skippedMembers)
      notes.push(`${result.skippedMembers} already on Godesi`);
    if (result.skippedOptedOut)
      notes.push(`${result.skippedOptedOut} asked not to be invited`);
    if (result.failed) notes.push(`${result.failed} could not be delivered`);
    if (result.overLimit)
      notes.push(`${result.overLimit} left for tomorrow — daily limit`);
    if (rejected.length)
      notes.push(`${rejected.length} were not valid addresses`);

    const tail = notes.length ? ` (${notes.join(", ")})` : "";

    revalidatePath("/dashboard/rewards");
    revalidatePath("/dashboard");

    if (!result.sent) {
      return { error: `Nothing was sent${tail}.` };
    }

    return {
      success: `Sent ${result.sent} ${result.sent === 1 ? "invite" : "invites"}${tail}. You earn points when they join.`,
    };
  } catch (error) {
    return fieldError(error);
  }
}
