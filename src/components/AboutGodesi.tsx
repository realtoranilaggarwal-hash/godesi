import Link from "next/link";

/** One-line statement of what Godesi is; the full version lives on /about. */
export function AboutGodesi() {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-7">
      <h2 className="text-lg font-black text-slate-900 sm:text-xl">What is Godesi?</h2>
      <p className="mt-2 text-sm leading-relaxed text-slate-700">
        A free directory and community marketplace for the desi community worldwide —
        find local businesses and professionals, post what you need, and discover events,
        homes and news near you.
      </p>

      <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-sm font-semibold">
        <Link href="/about" className="text-indigo-600 hover:underline">
          About Godesi
        </Link>
        <Link href="/why-godesi" className="text-indigo-600 hover:underline">
          Everything you get
        </Link>
        <Link href="/claim" className="text-indigo-600 hover:underline">
          Claim godesi.com/yourname
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
