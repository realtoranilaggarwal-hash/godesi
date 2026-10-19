import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { formatMinor } from "@/lib/format";
import { formatEventDate } from "@/lib/events";
import { Alert, Badge, LinkButton } from "@/components/ui";
import { QuoraEvent, usdValue } from "@/components/QuoraEvent";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Your ticket", robots: { index: false } };

export default async function TicketPage({
  params,
  searchParams,
}: {
  params: { code: string };
  searchParams: { paid?: string };
}) {
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
      tier: { select: { name: true } },
    },
  });
  if (!ticket) notFound();

  const allowed =
    user.role === "ADMIN" ||
    user.id === ticket.userId ||
    user.id === ticket.event.organizerId;
  if (!allowed) notFound();

  const paidUsd =
    searchParams.paid && ticket.amountMinor
      ? await usdValue(ticket.amountMinor, ticket.currency)
      : undefined;

  const confirmed = ticket.status === "CONFIRMED";
  const ticketWord = `ticket${ticket.quantity === 1 ? "" : "s"}`;

  return (
    <div className="mx-auto max-w-md space-y-4">
      {searchParams.paid ? (
        <QuoraEvent event="Purchase" valueUsd={paidUsd} />
      ) : null}

      {confirmed ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-center text-emerald-900">
          <p className="text-lg font-black">🎉 You&apos;re in! Your {ticketWord} {ticket.quantity === 1 ? "is" : "are"} confirmed.</p>
          <p className="mt-1 text-sm">
            We emailed {ticket.quantity === 1 ? "it" : "them"} to{" "}
            <span className="break-all font-semibold">{ticket.buyerEmail}</span>. You can
            also open {ticket.quantity === 1 ? "it" : "them"} any time under My tickets.
          </p>
        </div>
      ) : null}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg">
        <div className="bg-gradient-to-r from-indigo-600 to-fuchsia-600 px-5 py-4 text-white">
          <p className="text-xs font-bold uppercase tracking-widest opacity-80">
            🎟️ GoDesi.com ticket · Admit {ticket.quantity}
          </p>
          <h1 className="mt-1 break-words text-xl font-black">{ticket.event.title}</h1>
        </div>
        <div className="space-y-1 px-5 py-4 text-sm text-slate-700">
          <p>📅 {formatEventDate(ticket.event.startsAt, ticket.event.timeZone)}</p>
          <p className="break-words">
            📍 {ticket.event.venue}, {ticket.event.city}
          </p>
          <p>
            🎫 {ticket.tier ? `${ticket.tier.name} · ` : ""}
            {ticket.quantity} {ticketWord} ·{" "}
            {ticket.amountMinor ? formatMinor(ticket.amountMinor, ticket.currency) : "Free"}
          </p>
          <p className="break-words">👤 {ticket.buyerName}</p>
        </div>

        <div className="relative border-t-2 border-dashed border-slate-300" aria-hidden>
          <span className="absolute -left-3 -top-3 h-6 w-6 rounded-full bg-slate-50" />
          <span className="absolute -right-3 -top-3 h-6 w-6 rounded-full bg-slate-50" />
        </div>

        <div className="space-y-3 px-5 py-5 text-center">
          <Badge tone={confirmed ? "green" : "amber"}>{ticket.status}</Badge>
          {confirmed ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`/api/tickets/${ticket.code}/qr`}
                alt="Ticket QR code"
                width={240}
                height={240}
                className="mx-auto rounded-xl border border-slate-200"
              />
              <p className="font-mono text-lg font-bold tracking-widest">{ticket.code}</p>
              <p className="text-xs text-slate-500">
                Show this QR code at the entrance, on your phone or printed. One code
                admits {ticket.quantity}. Checked in: {ticket.checkedInAt ? "yes" : "not yet"}
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
        </div>
      </div>

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
