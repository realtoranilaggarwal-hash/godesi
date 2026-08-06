import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/LegalPage";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Terms of service and marketplace rules",
  description:
    "The rules for listing a business, buying and selling, booking event tickets and advertising on Godesi, plus your rights, our obligations and how disputes are handled.",
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

      <h3>Housing, real estate and room listings</h3>
      <p>
        Fair Housing Notice: Godesi is committed to providing an inclusive platform for
        housing and real estate listings. All users must comply with applicable fair
        housing laws. Listings must not discriminate based on race, color, religion,
        sex, disability, familial status, national origin, sexual orientation, gender
        identity, or any other protected characteristic under applicable laws. Users are
        solely responsible for the content they post. Godesi does not verify listings and
        is not responsible for any claims or agreements between parties.
      </p>
      <p>
        Room &amp; Shared Housing Disclaimer: Listings for shared housing or roommates
        are intended for individuals seeking compatible living arrangements. While users
        may describe preferences (such as lifestyle, cleanliness, or habits),
        discriminatory language or exclusion based on protected characteristics is
        strictly prohibited. Please ensure all listings comply with local housing and
        anti-discrimination laws.
      </p>

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

      <h2>7. Claimed and unclaimed listings</h2>
      <p>
        Some listings are starter entries created from openly licensed public data or
        added by our team, and are marked <strong>unclaimed</strong>. If a listing is
        yours you can claim it; we verify ownership before transferring control. Claiming
        a listing you do not own, or claiming on someone&apos;s behalf without authority,
        will have the listing removed and the account suspended. Any business can ask us
        to remove its listing entirely by emailing us.
      </p>

      <h2>8. Reviews</h2>
      <p>
        Reviews must describe your own genuine experience. Paying for reviews, reviewing
        your own business or a competitor&apos;s, and posting abusive, defamatory or
        off-topic content are all prohibited. We may remove reviews that break these
        rules, but we do not remove a review simply because it is unfavourable.
      </p>

      <h2>9. Connect and community</h2>
      <p>
        Connect exists for networking, mentorship, cultural meetups and activities. It is
        not a dating service. Adult, sexual, harassing or discriminatory content is
        removed and the account blocked. Meet in public places and use your own judgement;
        we do not run background checks on members.
      </p>

      <h2>10. Reward points and referrals</h2>
      <p>
        Points are a promotional benefit, not money: they have no cash value, cannot be
        transferred or withdrawn, and may expire or be adjusted if a referral turns out to
        be self-referred, duplicated or otherwise abusive. We may change point values and
        redemption options at any time.
      </p>

      <h2>11. Payments</h2>
      <p>
        Card payments are processed by Stripe and wallet payments by PayPal. We do not
        store card details. Prices are shown in Indian rupees for visitors in India and
        in US dollars elsewhere.
      </p>

      <h2>12. Refunds and cancellations</h2>
      <p>
        Memberships, advertising and link promotions are prepaid and non-refundable once
        delivery has begun, except where the law requires otherwise or where we fail to
        deliver the placement you bought. Event refunds are the organiser&apos;s
        responsibility. Our{" "}
        <Link href="/refunds" className="text-indigo-600 underline">
          refund policy
        </Link>{" "}
        has the detail.
      </p>

      <h2>13. Intellectual property and takedowns</h2>
      <p>
        Godesi&apos;s name, design and software are ours. Starter listings drawn from
        OpenStreetMap are used under the ODbL with attribution. We do not copy listing
        data from other directories, and you must not copy, scrape or bulk-download
        content from Godesi. If you believe content here infringes your rights, email us
        with the URL, what is infringed and proof of ownership and we will act promptly.
      </p>

      <h2>14. Liability</h2>
      <p>
        Godesi is a directory and marketplace. We do not verify every business, event
        or requirement, and we are not a party to any transaction between users. To the
        extent permitted by law our liability is limited to the fees you paid us in the
        preceding three months.
      </p>

      <h2>15. Suspension and termination</h2>
      <p>
        You can delete your account at any time. We may suspend or remove an account,
        listing, event or advertisement that breaks these terms, harms other users or
        exposes us to legal risk. Fees for undelivered placements are refunded when we
        remove content for reasons outside your control.
      </p>

      <h2>16. Governing law</h2>
      <p>
        These terms are governed by the laws of the State of New Jersey, USA, and the
        courts located there have exclusive jurisdiction, unless local consumer law in
        your country gives you a different right.
      </p>

      <h2>17. Changes and contact</h2>
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
