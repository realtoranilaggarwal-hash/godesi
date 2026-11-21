import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { formatMinor } from "@/lib/format";
import { formatEventDate } from "@/lib/events";
import { Alert, Badge, LinkButton } from "@/components/ui";
import { QuoraEvent, usdValue } from "@/components/QuoraEvent";
import { ScrollTop } from "@/components/ScrollTop";
import { SubmitButton } from "@/components/SubmitButton";
import { checkInTicketAction } from "@/app/actions/tickets";
import { sponsorsForEvent } from "@/lib/sponsors";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Your ticket", robots: { index: false } };

export default async function TicketPage({
  params,
  searchParams,
}: {
  params: { code: string };
  searchParams: { paid?: string; checkin?: string };
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
      tier: { select: { name: true, kind: true, admits: true, price: true } },
    },
  });
  if (!ticket) notFound();

  const doorStaff = user.role === "ADMIN" || user.id === ticket.event.organizerId;
  const allowed = doorStaff || user.id === ticket.userId;
  if (!allowed) notFound();

  const paidUsd =
    searchParams.paid && ticket.amountMinor
      ? await usdValue(ticket.amountMinor, ticket.currency)
      : undefined;

  const confirmed = ticket.status === "CONFIRMED";
  const sponsorGifts = confirmed
    ? (await sponsorsForEvent(ticket.eventId)).filter((s) => s.buyerGift)
    : [];
  const ticketWord = `ticket${ticket.quantity === 1 ? "" : "s"}`;
  const admits = ticket.quantity * (ticket.tier?.admits ?? 1);
  const checkedInLabel = ticket.checkedInAt
    ? formatEventDate(ticket.checkedInAt, ticket.event.timeZone)
    : null;
  /** The green "admit" state is only for the scan that just checked in; a forged ?checkin=done on an older check-in still warns. */
  const justCheckedIn =
    searchParams.checkin === "done" &&
    ticket.checkedInAt &&
    Date.now() - ticket.checkedInAt.getTime() < 2 * 60 * 1000;

  return (
    <div className="mx-auto max-w-md space-y-4">
      <ScrollTop />
      {searchParams.paid ? (
        <QuoraEvent event="Purchase" valueUsd={paidUsd} />
      ) : null}

      {doorStaff ? (
        <div className="space-y-2 rounded-2xl border border-slate-200 bg-white p-4 text-center shadow">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Door check-in</p>
          {!confirmed ? (
            <div className="rounded-xl border-2 border-red-500 bg-red-50 p-3 text-red-800">
              <p className="text-lg font-black">⛔ Not confirmed — do not admit</p>
              <p className="text-sm">This ticket is {ticket.status.toLowerCase()}, not paid.</p>
            </div>
          ) : justCheckedIn ? (
            <div className="rounded-xl border-2 border-emerald-500 bg-emerald-50 p-3 text-emerald-900">
              <p className="text-lg font-black">✅ Checked in — admit {admits}</p>
              <p className="text-sm">{checkedInLabel}</p>
            </div>
          ) : checkedInLabel ? (
            <div role="alert" className="rounded-xl border-2 border-red-600 bg-red-600 p-4 text-white">
              <p className="text-xl font-black">⚠️ Already checked in at {checkedInLabel}</p>
              <p className="mt-1 text-sm">
                This QR code was already used at the door. Do not admit again without checking
                with the organiser.
              </p>
            </div>
          ) : (
            <form action={checkInTicketAction}>
              <input type="hidden" name="code" value={ticket.code} />
              <SubmitButton className="w-full !py-3 text-lg" pendingLabel="Checking in...">
                Mark checked in · admit {admits}
              </SubmitButton>
            </form>
          )}
        </div>
      ) : null}

      {confirmed && (!doorStaff || user.id === ticket.userId) ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-center text-emerald-900">
          <p className="text-lg font-black">🎉 You&apos;re in! Your {ticketWord} {ticket.quantity === 1 ? "is" : "are"} confirmed.</p>
          <p className="mt-1 text-sm">
            We emailed {ticket.quantity === 1 ? "it" : "them"} to{" "}
            <span className="break-all font-semibold">{ticket.buyerEmail}</span>. You can
            also open {ticket.quantity === 1 ? "it" : "them"} any time under My tickets.
          </p>
        </div>
      ) : null}

      {sponsorGifts.length ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          <p className="font-bold">🎁 Gifts from our sponsors for ticket holders</p>
          <ul className="mt-2 space-y-1">
            {sponsorGifts.map((s) => (
              <li key={s.id}>
                <Link href={`/business/${s.business.slug}?src=sponsor`} className="font-semibold underline">
                  {s.business.name}
                </Link>
                : {s.buyerGift}
              </li>
            ))}
          </ul>
          <p className="mt-2 text-xs">Show this ticket to the sponsor to claim it.</p>
        </div>
      ) : null}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg">
        <div className="flex items-center justify-between gap-3 border-b border-slate-100 bg-white px-5 py-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-godesi.png" alt="GoDesi.com" width={136} height={40} className="h-10 w-auto" />
          <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400">godesi.com</span>
        </div>
        <div className="bg-gradient-to-r from-indigo-600 to-fuchsia-600 px-5 py-4 text-white">
          <p className="text-xs font-bold uppercase tracking-widest opacity-80">
            🎟️ GoDesi.com {ticket.tier?.kind === "SPONSOR" ? "sponsor pass" : "ticket"} · {admits ? `Admit ${admits}` : "No entry included"}
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
            {ticket.amountMinor
              ? formatMinor(ticket.amountMinor, ticket.currency)
              : ticket.tier?.price
                ? "Complimentary · paid in full"
                : "Free"}
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
                admits {admits}. Checked in: {checkedInLabel ?? "not yet"}
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
