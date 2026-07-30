"use server";

import { db } from "@/lib/db";
import { getCurrentUser, requireStaff, requireUser } from "@/lib/auth";
import { type ActionState } from "@/lib/actions";
import { chatCooldown, cleanChatBody } from "@/lib/chat";

/** Posts one line into the global chit-chat room. */
export async function postChatMessageAction(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireUser();
  const body = cleanChatBody(String(formData.get("body") ?? ""));
  if (body.length < 2) {
    return { error: "Type a message first (links are not allowed)." };
  }

  const cooldown = await chatCooldown(user.id);
  if (cooldown) return { error: cooldown };

  await db.chatMessage.create({
    data: { userId: user.id, body, place: user.location ?? null },
  });
  return { success: "Sent" };
}

/** Anyone signed in can flag a line; three flags hide it until staff review. */
export async function reportChatMessageAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) return;
  const id = String(formData.get("id") ?? "");
  const message = await db.chatMessage.findUnique({ where: { id } });
  if (!message) return;

  await db.chatMessage.update({
    where: { id },
    data: { reports: { increment: 1 }, hidden: message.reports + 1 >= 3 },
  });
}

export async function hideChatMessageAction(formData: FormData) {
  await requireStaff();
  const id = String(formData.get("id") ?? "");
  await db.chatMessage.update({ where: { id }, data: { hidden: true } });
}
