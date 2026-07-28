import Link from "next/link";

/** Plain-language statement of what Godesi is, required on the home page. */
export function AboutGodesi() {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-7">
      <h2 className="text-xl font-black text-slate-900 sm:text-2xl">
        What is Godesi?
      </h2>
      <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-700">
        Godesi is a free online directory and community marketplace for the
        South Asian (desi) community worldwide. Local businesses, professionals,
        freelancers, wedding vendors, temples and event organisers publish a
        profile — a digital business card with photos, services, hours, a QR code
        and a WhatsApp button — and members use Godesi to search those profiles,
        post what they need, browse and book community events, list or find
        homes, rooms and second-hand items, read desi news and share resource
        links.
      </p>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl bg-slate-50 p-4">
          <h3 className="text-sm font-bold text-slate-900">
            If you are looking for something
          </h3>
          <p className="mt-1 text-sm text-slate-600">
            Search by service and city, browse categories, contact a provider on
            WhatsApp or by phone, post a requirement so providers come to you,
            and buy tickets to community events. Browsing and searching need no
            account.
          </p>
        </div>
        <div className="rounded-2xl bg-slate-50 p-4">
          <h3 className="text-sm font-bold text-slate-900">
            If you offer a service
          </h3>
          <p className="mt-1 text-sm text-slate-600">
            Create a free account to publish your business or professional
            profile, add listings and events, reply to buyer requirements,
            collect reviews, and optionally pay for a featured spot or a banner
            advert. Godesi is not a party to any deal — you deal directly with
            the customer.
          </p>
        </div>
      </div>

      <p className="mt-5 max-w-3xl text-sm leading-relaxed text-slate-700">
        <strong className="font-bold">Signing in.</strong> An account is only
        needed to publish or manage your own content. You can sign in with an
        email and password or with Google. When you choose Google we receive only
        your name, email address and profile picture, and we use them solely to
        create and identify your Godesi account — nothing is sold or shared with
        advertisers.
      </p>

      <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-sm font-semibold">
        <Link href="/about" className="text-indigo-600 hover:underline">
          About Godesi
        </Link>
        <Link href="/faq" className="text-indigo-600 hover:underline">
          How it works
        </Link>
        <Link href="/privacy" className="text-indigo-600 hover:underline">
          Privacy policy
        </Link>
        <Link href="/terms" className="text-indigo-600 hover:underline">
          Terms of service
        </Link>
        <Link href="/contact" className="text-indigo-600 hover:underline">
          Contact us
        </Link>
      </div>
    </section>
  );
}
