import { createHmac, timingSafeEqual } from "crypto";
import { db } from "@/lib/db";
import { sendEmail, shell, emailEnabled } from "@/lib/email";
import { siteUrl } from "@/lib/format";
import { INVITE_MAX_PER_DAY } from "@/lib/inviteLimits";

/** Member-supplied text goes into an HTML email, so it is escaped first. */
function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

const EMAIL_SHAPE = /^[^\s@,;<>]+@[^\s@,;<>]+\.[a-z]{2,}$/i;

/** Lower-cased address used for de-duplication and opt-out lookups. */
export function canonicalEmail(input: string) {
  return input.trim().toLowerCase();
}

/**
 * Splits a pasted block of addresses on commas, semicolons and newlines, keeps
 * only well-formed addresses and drops repeats within the same submission.
 */
export function parseInviteEmails(raw: string) {
  const seen = new Set<string>();
  const emails: string[] = [];
  const rejected: string[] = [];

  for (const piece of raw.split(/[\s,;]+/)) {
    const bare = piece.replace(/^[<"']+|[>"',.]+$/g, "").trim();
    if (!bare) continue;
    const canonical = canonicalEmail(bare);
    if (!EMAIL_SHAPE.test(canonical)) {
      if (rejected.length < 10) rejected.push(bare.slice(0, 80));
      continue;
    }
    if (seen.has(canonical)) continue;
    seen.add(canonical);
    emails.push(canonical);
  }

  return { emails, rejected };
}

/**
 * Opt-out links are signed rather than stored, so one cannot be edited to
 * silence somebody else's address.
 */
export function inviteOptOutToken(email: string) {
  const secret = process.env.AUTH_SECRET ?? "";
  return createHmac("sha256", secret)
    .update(`invite:${canonicalEmail(email)}`)
    .digest("hex");
}

export function inviteOptOutValid(email: string, token: string) {
  const expected = Buffer.from(inviteOptOutToken(email));
  const given = Buffer.from(token);
  return expected.length === given.length && timingSafeEqual(expected, given);
}

export function inviteOptOutUrl(email: string) {
  const query = new URLSearchParams({
    e: canonicalEmail(email),
    t: inviteOptOutToken(email),
  });
  return `${siteUrl()}/unsubscribe?${query.toString()}`;
}

function inviteHtml({
  inviterName,
  link,
  email,
  note,
}: {
  inviterName: string;
  link: string;
  email: string;
  note: string;
}) {
  const safeName = escapeHtml(inviterName);
  const safeNote = escapeHtml(note);
  const body = `
    <p style="margin:0 0 12px;font-size:15px">${safeName} uses Godesi — a free directory and page for the desi community — and thought you might want your own.</p>
    ${safeNote ? `<p style="margin:0 0 12px;padding:12px;background:#f8fafc;border-radius:12px;font-size:15px;white-space:pre-wrap">${safeNote}</p>` : ""}
    <p style="margin:0 0 16px;font-size:15px">You pick a name and get <strong>godesi.com/yourname</strong>: your photo, what you do, your links, a WhatsApp button and a QR code for your visiting card. It is free and there is no card to enter.</p>
    <p style="margin:0 0 20px">
      <a href="${link}" style="display:inline-block;background:#4f46e5;color:#fff;font-weight:700;text-decoration:none;padding:12px 18px;border-radius:12px">Claim your name</a>
    </p>
    <p style="margin:0;font-size:12px;color:#64748b">${safeName} asked us to send this one email to ${escapeHtml(email)}. We do not add you to any list.
      <a href="${inviteOptOutUrl(email)}" style="color:#64748b">Never invite me again</a>.</p>`;
  return shell(`${safeName} invited you to Godesi`, body);
}

type InviteResult = {
  sent: number;
  skippedAlready: number;
  skippedOptedOut: number;
  skippedMembers: number;
  failed: number;
  rejected: string[];
  overLimit: number;
  dailyCapReached: boolean;
};

/**
 * Sends one invitation per fresh address on behalf of a member. Addresses that
 * already got an invite from this member, that asked not to be invited, or that
 * already have a Godesi account are skipped, so nobody is mailed twice. Points
 * are deliberately not awarded here — they are credited by the referral flow if
 * and when the friend actually creates an account.
 */
export async function sendInvites({
  inviter,
  emails,
  note,
}: {
  inviter: { id: string; name: string | null; username: string };
  emails: string[];
  note: string;
}): Promise<InviteResult> {
  const result: InviteResult = {
    sent: 0,
    skippedAlready: 0,
    skippedOptedOut: 0,
    skippedMembers: 0,
    failed: 0,
    rejected: [],
    overLimit: 0,
    dailyCapReached: false,
  };

  const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const sentToday = await db.invite.count({
    where: { inviterId: inviter.id, sentAt: { gte: since } },
  });
  const room = Math.max(0, INVITE_MAX_PER_DAY - sentToday);
  if (room === 0) {
    result.dailyCapReached = true;
    result.overLimit = emails.length;
    return result;
  }

  const [already, optedOut, members] = await Promise.all([
    db.invite.findMany({
      where: { inviterId: inviter.id, emailCanonical: { in: emails } },
      select: { emailCanonical: true },
    }),
    db.inviteOptOut.findMany({
      where: { emailCanonical: { in: emails } },
      select: { emailCanonical: true },
    }),
    db.user.findMany({
      where: { email: { in: emails } },
      select: { email: true },
    }),
  ]);

  const alreadySet = new Set(already.map((row) => row.emailCanonical));
  const optedOutSet = new Set(optedOut.map((row) => row.emailCanonical));
  const memberSet = new Set(
    members.map((row) => canonicalEmail(row.email ?? "")),
  );

  const link = `${siteUrl()}/ref/${inviter.username}`;
  const inviterName = inviter.name?.trim() || `@${inviter.username}`;

  for (const email of emails) {
    if (alreadySet.has(email)) {
      result.skippedAlready += 1;
      continue;
    }
    if (optedOutSet.has(email)) {
      result.skippedOptedOut += 1;
      continue;
    }
    if (memberSet.has(email)) {
      result.skippedMembers += 1;
      continue;
    }
    if (result.sent >= room) {
      result.overLimit += 1;
      result.dailyCapReached = true;
      continue;
    }

    const delivered = emailEnabled()
      ? await sendEmail({
          to: email,
          subject: `${inviterName} invited you to Godesi`,
          html: inviteHtml({ inviterName, link, email, note }),
        })
      : false;

    if (!delivered) {
      result.failed += 1;
      continue;
    }

    await db.invite
      .create({
        data: { inviterId: inviter.id, email, emailCanonical: email },
      })
      .catch(() => null);
    result.sent += 1;
  }

  return result;
}

/**
 * Marks the invitation that brought a new member in, and returns it so the
 * referral flow can credit whoever invited them. Only the oldest unclaimed
 * invitation to that address counts, so one signup can never pay twice.
 */
export async function markInviteJoined(userId: string) {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { email: true },
  });
  const email = canonicalEmail(user?.email ?? "");
  if (!email) return null;

  const invite = await db.invite.findFirst({
    where: {
      emailCanonical: email,
      joinedUserId: null,
      inviterId: { not: userId },
    },
    orderBy: { sentAt: "asc" },
    select: { id: true, inviterId: true },
  });
  if (!invite) return null;

  const claimed = await db.invite
    .updateMany({
      where: { id: invite.id, joinedUserId: null },
      data: { joinedUserId: userId, joinedAt: new Date() },
    })
    .catch(() => null);
  if (!claimed || claimed.count === 0) return null;

  return invite;
}
