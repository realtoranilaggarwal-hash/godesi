import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Refund policy",
  description: "How refunds work for memberships, event tickets and advertising.",
};

export default function RefundsPage() {
  return (
    <LegalPage title="Refund policy">
      <h2>Memberships</h2>
      <p>
        Paid plans are billed for a 30-day period. If something goes wrong on our side —
        a failed upgrade, a double charge or a plan that was never applied — write to us
        within 7 days and we will refund it in full. We do not refund unused days of a
        working plan.
      </p>

      <h2>Event tickets</h2>
      <p>
        Refunds for tickets are set by the event organiser, who receives the payment. If
        an event is cancelled or materially changed by the organiser you are entitled to
        a refund of the ticket price. Contact the organiser first; if they do not respond
        within 7 days, contact us and we will help.
      </p>

      <h2>Advertising</h2>
      <p>
        If we reject your creative and you do not want to supply a replacement, we refund
        the booking in full. If we cancel a live campaign early, we refund the unused
        days pro rata. Bookings already delivered are not refundable, and we do not
        guarantee a specific number of impressions on monthly placements.
      </p>

      <h2>How to request one</h2>
      <p>
        Email{" "}
        <a href={`mailto:${SITE.supportEmail}`} className="text-indigo-600 underline">
          {SITE.supportEmail}
        </a>{" "}
        with the payment reference shown in your dashboard. Approved refunds are returned
        to the original payment method and typically take 5–10 business days to appear.
      </p>
    </LegalPage>
  );
}
