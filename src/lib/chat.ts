import { db } from "@/lib/db";
import { cachedQuery } from "@/lib/cache";

export const CHAT_MAX_LENGTH = 400;
/** Messages a member may post in a rolling minute / hour. */
export const CHAT_PER_MINUTE = 6;
export const CHAT_PER_HOUR = 60;
export const CHAT_PAGE_SIZE = 60;

export type ChatLine = {
  id: string;
  body: string;
  name: string;
  username: string | null;
  place: string | null;
  avatarUrl: string | null;
  createdAt: string;
  mine: boolean;
};

/**
 * Links are stripped rather than rejected: the room is for chit-chat, and
 * pasted URLs are the main spam vector.
 */
export function cleanChatBody(input: string) {
  return input
    .replace(/https?:\/\/\S+/gi, "")
    .replace(/\bwww\.\S+/gi, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, CHAT_MAX_LENGTH);
}

export async function recentChat(
  viewerId: string | null,
  take = CHAT_PAGE_SIZE,
): Promise<ChatLine[]> {
  const rows = await cachedChat(take);
  return rows.map((row) => ({ ...row, mine: row.userId === viewerId }));
}

/**
 * The rail shows the room on most pages, so the lines are shared between
 * visitors for a few seconds; the live poller keeps the open room current.
 */
const cachedChat = cachedQuery("chat-recent", 20, readChat);

async function readChat(take = CHAT_PAGE_SIZE) {
  const rows = await db.chatMessage.findMany({
    where: { hidden: false },
    orderBy: { createdAt: "desc" },
    take,
    select: {
      id: true,
      body: true,
      place: true,
      createdAt: true,
      userId: true,
      user: { select: { name: true, username: true, avatarUrl: true } },
    },
  });

  return rows.reverse().map((row) => ({
    id: row.id,
    body: row.body,
    name: row.user.name,
    username: row.user.username,
    place: row.place,
    avatarUrl: row.user.avatarUrl,
    createdAt: row.createdAt.toISOString(),
    userId: row.userId,
  }));
}

/** Returns the reason the member can't post right now, or null when they may. */
export async function chatCooldown(userId: string) {
  const [lastMinute, lastHour] = await Promise.all([
    db.chatMessage.count({
      where: { userId, createdAt: { gte: new Date(Date.now() - 60_000) } },
    }),
    db.chatMessage.count({
      where: { userId, createdAt: { gte: new Date(Date.now() - 3_600_000) } },
    }),
  ]);
  if (lastMinute >= CHAT_PER_MINUTE) {
    return "You're posting quickly — wait a minute before the next message.";
  }
  if (lastHour >= CHAT_PER_HOUR) {
    return "You've hit the hourly message limit. Try again a bit later.";
  }
  return null;
}
