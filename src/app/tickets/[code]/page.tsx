import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { formatMinor } from "@/lib/format";
import { formatEventDate } from "@/lib/events";
import { Alert, Badge, Card, LinkButton } from "@/components/ui";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Your ticket", robots: { index: false } };

export default async function TicketPage({ params }: { params: { code: string } }) {
  const user = await getCurrentUser();
  if (!user) redirect(`/login?next=/tickets/${params.code}`);

  const ticket = await db.ticket.findUnique({
    where: { code: params.code },
    include: {
      event: {
        select: {
          slug: true,
          title: true,
          startsAt: true,
          timeZone: true,
          venue: true,
          city: true,
          organizerId: true,
        },
      },
    },
  });
  if (!ticket) notFound();

  const allowed =
    user.role === "ADMIN" ||
    user.id === ticket.userId ||
    user.id === ticket.event.organizerId;
  if (!allowed) notFound();

  return (
    <div className="mx-auto max-w-md space-y-4">
      <Card className="space-y-4 text-center">
        <Badge tone={ticket.status === "CONFIRMED" ? "green" : "amber"}>{ticket.status}</Badge>
        <h1 className="text-xl font-black">{ticket.event.title}</h1>
        <div className="space-y-1 text-sm text-slate-600">
          <p>📅 {formatEventDate(ticket.event.startsAt, ticket.event.timeZone)}</p>
          <p>
            📍 {ticket.event.venue}, {ticket.event.city}
          </p>
          <p>
            🎫 {ticket.quantity} seat(s) ·{" "}
            {ticket.amountMinor ? formatMinor(ticket.amountMinor, ticket.currency) : "Free"}
          </p>
        </div>

        {ticket.status === "CONFIRMED" ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`/api/tickets/${ticket.code}/qr`}
              alt="Ticket QR code"
              width={260}
              height={260}
              className="mx-auto rounded-xl border border-slate-200"
            />
            <p className="font-mono text-lg font-bold tracking-widest">{ticket.code}</p>
            <p className="text-xs text-slate-500">
              Show this QR at the gate. Checked in:{" "}
              {ticket.checkedInAt ? "yes" : "not yet"}
            </p>
            <LinkButton href={`/api/tickets/${ticket.code}/qr?download=1`} variant="secondary">
              Download ticket QR
            </LinkButton>
          </>
        ) : (
          <Alert>
            This ticket is not confirmed yet. If you completed the payment it will confirm
            within a minute — refresh this page.
          </Alert>
        )}
      </Card>

      <p className="text-center text-sm text-slate-500">
        <Link href={`/events/${ticket.event.slug}`} className="font-semibold text-indigo-600">
          Back to event
        </Link>{" "}
        ·{" "}
        <Link href="/dashboard/tickets" className="font-semibold text-indigo-600">
          All my tickets
        </Link>
      </p>
    </div>
  );
}
