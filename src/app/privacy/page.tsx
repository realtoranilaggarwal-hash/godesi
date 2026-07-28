import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/LegalPage";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy policy",
  description: "What data Godesi collects, why, and the choices you have.",
};

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy policy">
      <p>
        This policy explains what we collect when you use Godesi, why we collect it and
        what control you have.
      </p>

      <h2>What we collect</h2>
      <ul>
        <li>
          <strong>Account data</strong> — name, email and a hashed password. We never
          store your password in readable form.
        </li>
        <li>
          <strong>Google sign-in data</strong> — if you choose &ldquo;Sign in with
          Google&rdquo; we receive only your name, email address and profile picture from
          your Google account, and use them solely to create and identify your Godesi
          account. We request no other Google data, never sell or share it with
          advertisers, and you can remove Godesi&apos;s access at any time from your
          Google account permissions.
        </li>
        <li>
          <strong>Listing data</strong> — everything you choose to publish: business
          name, description, city, address, phone, WhatsApp number, links and images.
        </li>
        <li>
          <strong>Transaction data</strong> — plan, ticket and advertising purchases with
          the amount, currency and the payment provider&apos;s reference. Card numbers
          are handled by Stripe and never reach our servers.
        </li>
        <li>
          <strong>Usage data</strong> — profile views, QR scans, WhatsApp clicks and
          banner impressions/clicks, stored as counts rather than personal profiles.
        </li>
        <li>
          <strong>Approximate country</strong> — derived from your IP by our host so we
          can show prices in the right currency.
        </li>
      </ul>

      <h2>How we use it</h2>
      <ul>
        <li>To run your listing, tickets, leads and advertising.</li>
        <li>To show businesses and advertisers how their placements perform.</li>
        <li>To take payments and prevent fraud and abuse.</li>
        <li>To moderate content and enforce our terms.</li>
      </ul>

      <h2>What we publish</h2>
      <p>
        Anything in your public listing is visible to everyone. Phone and email on a
        listing are shown only for paid plans; WhatsApp chat is available on all plans.
        Buyer contact details in a requirement are only revealed to Premium members who
        unlock them.
      </p>

      <h2>Who we share with</h2>
      <p>
        Only the service providers we need to operate: our hosting and database
        providers, Stripe and PayPal for payments, and email delivery. We do not sell
        your personal data.
      </p>

      <h2>Advertising and analytics</h2>
      <p>
        We use Google AdSense to fill advertising space we have not sold directly. Google
        and its partners may use cookies or device identifiers to show and measure ads;
        you can control this at{" "}
        <a
          href="https://myadcenter.google.com"
          target="_blank"
          rel="noreferrer"
          className="text-indigo-600 underline"
        >
          Google My Ad Center
        </a>
        . Site traffic is measured with Umami, which is cookie-free and does not build
        personal profiles; a summary is public on our{" "}
        <Link href="/about" className="text-indigo-600 underline">
          about page
        </Link>
        . Banner and link impressions and clicks are counted in aggregate for advertisers.
      </p>

      <h2>Starter listings and claims</h2>
      <p>
        Some listings were created from openly licensed public data (OpenStreetMap, used
        under the ODbL with attribution) and are marked unclaimed. They contain business
        contact details, not personal data about consumers. If a listing is yours you can
        claim it and edit it, or ask us to remove it — no account needed.
      </p>

      <h2>Fraud prevention</h2>
      <p>
        For referrals we record the IP address and a device fingerprint of the signup so
        we can hold duplicate or self-referred accounts for review. This data is used only
        to prevent abuse of reward points.
      </p>

      <h2>Retention and your rights</h2>
      <p>
        We keep account and listing data while your account is active and transaction
        records for as long as tax rules require. You can ask us to correct or delete
        your data, or to send you a copy, by emailing{" "}
        <a href={`mailto:${SITE.supportEmail}`} className="text-indigo-600 underline">
          {SITE.supportEmail}
        </a>
        .
      </p>

      <h2>Cookies</h2>
      <p>
        See our{" "}
        <Link href="/cookies" className="text-indigo-600 underline">
          cookie policy
        </Link>{" "}
        for the cookies we set and how to refuse the optional ones.
      </p>

      <h2>Your choices</h2>
      <ul>
        <li>Edit or unpublish your listing at any time from your dashboard.</li>
        <li>Delete your account, which removes your listing, profile and Connect entry.</li>
        <li>Unsubscribe from non-essential email; we still send transactional messages such as OTP codes and tickets.</li>
        <li>
          Ask for a copy of your data, correction or deletion — including under GDPR,
          UK GDPR and the CCPA/CPRA where they apply to you.
        </li>
      </ul>

      <h2>International transfers</h2>
      <p>
        Godesi is operated from the United States and our hosting, database and email
        providers process data there. If you use Godesi from India, the EU, the UK or
        elsewhere, your data is transferred to and stored in the US.
      </p>

      <h2>Security</h2>
      <p>
        Passwords are hashed, traffic is encrypted in transit, and payment card details
        never reach our servers. No system is perfectly secure; tell us immediately if you
        suspect a problem with your account.
      </p>

      <h2>Children</h2>
      <p>Godesi is not intended for anyone under 18.</p>
    </LegalPage>
  );
}
