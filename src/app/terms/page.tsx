import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/LegalPage";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Terms of service",
  description: "The rules for listing, buying and advertising on Godesi.",
};

export default function TermsPage() {
  return (
    <LegalPage title="Terms of service">
      <p>
        These terms govern your use of Godesi. By creating an account, listing a
        business, posting a requirement, booking a ticket or buying advertising you
        agree to them.
      </p>

      <h2>1. Accounts</h2>
      <p>
        You must give accurate details and keep your password secure. You are
        responsible for everything done through your account. We may suspend accounts
        that break these terms or applicable law.
      </p>

      <h2>2. Listings and content</h2>
      <ul>
        <li>You must own the rights to any name, logo, photo or text you upload.</li>
        <li>Listings must describe a real business and real contact details.</li>
        <li>
          No illegal, adult, hateful, misleading or spam content. We may edit, hide or
          remove any listing, event, review or news submission.
        </li>
        <li>
          You keep ownership of your content and grant us a licence to display and
          promote it on Godesi.
        </li>
      </ul>

      <h2>3. Memberships</h2>
      <p>
        Paid plans run for 30 days from the date payment is confirmed and are charged
        upfront. Plan benefits are described on the{" "}
        <Link href="/pricing" className="text-indigo-600 underline">
          pricing page
        </Link>{" "}
        and may change; existing paid periods are honoured.
      </p>

      <h2>4. Events and tickets</h2>
      <p>
        Organisers, not Godesi, are responsible for their events: accuracy, delivery,
        safety, permits and refunds. We issue tickets and collect payment on the
        organiser&apos;s behalf. Attendees must present a valid QR ticket for entry.
      </p>

      <h2>5. Leads</h2>
      <p>
        Buyer requirements are posted by users. Unlocking contact details does not
        guarantee a response or any business outcome. Contacting a buyer for anything
        other than their stated requirement is prohibited.
      </p>

      <h2>6. Advertising</h2>
      <p>
        Banner bookings are subject to our approval and available inventory. Creatives
        must meet the stated dimensions and must not include adult, gambling or
        misleading financial content. Impression and click figures reported in your
        dashboard are our measurement of record.
      </p>

      <h2>7. Payments</h2>
      <p>
        Card payments are processed by Stripe and wallet payments by PayPal. We do not
        store card details. Prices are shown in Indian rupees for visitors in India and
        in US dollars elsewhere.
      </p>

      <h2>8. Liability</h2>
      <p>
        Godesi is a directory and marketplace. We do not verify every business, event
        or requirement, and we are not a party to any transaction between users. To the
        extent permitted by law our liability is limited to the fees you paid us in the
        preceding three months.
      </p>

      <h2>9. Changes and contact</h2>
      <p>
        We may update these terms; material changes will be posted on this page. Reach
        us at{" "}
        <a href={`mailto:${SITE.supportEmail}`} className="text-indigo-600 underline">
          {SITE.supportEmail}
        </a>
        .
      </p>
    </LegalPage>
  );
}
