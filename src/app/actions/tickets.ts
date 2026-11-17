"use server";

import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";

/**
 * Door check-in by the event organiser or an admin. Only the first scan sets
 * checkedInAt; a second one comes back as a duplicate so a reused QR is caught.
 */
export async function checkInTicketAction(formData: FormData) {
  const user = await requireUser();
  const code = String(formData.get("code") ?? "").trim();
  const ticket = await db.ticket.findUnique({
    where: { code },
    select: { id: true, status: true, event: { select: { organizerId: true } } },
  });
  if (!ticket) redirect("/dashboard/tickets");
  const page = `/tickets/${encodeURIComponent(code)}`;
  if (user.role !== "ADMIN" && user.id !== ticket.event.organizerId) redirect(page);
  if (ticket.status !== "CONFIRMED") redirect(page);

  const claimed = await db.ticket.updateMany({
    where: { id: ticket.id, status: "CONFIRMED", checkedInAt: null },
    data: { checkedInAt: new Date() },
  });
  redirect(`${page}?checkin=${claimed.count ? "done" : "duplicate"}`);
}
