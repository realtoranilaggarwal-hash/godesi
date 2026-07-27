import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Cookie policy",
  description: "The cookies Godesi uses and how to control them.",
};

export default function CookiesPage() {
  return (
    <LegalPage title="Cookie policy">
      <p>
        Cookies are small files stored by your browser. We keep our use of them to a
        minimum and ask for consent before anything optional.
      </p>

      <h2>Essential cookies</h2>
      <ul>
        <li>
          <strong>godesi_session</strong> — keeps you signed in. It contains a signed
          token, no personal details, and expires after 30 days or when you sign out.
          Without it you cannot use a dashboard, book a ticket or manage a listing.
        </li>
      </ul>
      <p>
        These are strictly necessary, so they are set without consent. Blocking them
        breaks sign-in.
      </p>

      <h2>Optional cookies and measurement</h2>
      <p>
        When you accept optional cookies we may measure aggregate performance — which
        pages, listings and banners are viewed and clicked. Today this measurement is
        stored as counters against a listing or banner, not against you as an
        individual, and we do not run third-party advertising trackers. If that ever
        changes we will name the providers here first.
      </p>

      <h2>Your choice</h2>
      <p>
        The banner on your first visit lets you choose &quot;Accept all&quot; or
        &quot;Essential only&quot;. Your choice is remembered in your browser&apos;s
        local storage. To change it, clear your site data for godesi.com and the banner
        will appear again. You can also block or delete cookies in your browser
        settings.
      </p>

      <h2>Third parties</h2>
      <p>
        Stripe and PayPal set their own cookies on their checkout pages to process
        payments and prevent fraud, governed by their own policies. Embedded content
        such as Google Maps links may also set cookies when you interact with it.
      </p>

      <h2>Questions</h2>
      <p>
        Email{" "}
        <a href={`mailto:${SITE.supportEmail}`} className="text-indigo-600 underline">
          {SITE.supportEmail}
        </a>
        .
      </p>
    </LegalPage>
  );
}
