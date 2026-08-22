import Link from "next/link";

/**
 * The GoDesi.wiki offer: any member who lists on Godesi is also published on
 * godesi.wiki, the desi wiki directory, free for the first year — with the
 * marketing and search optimisation done for them.
 */
const LISTING_START = "/dashboard/profile?type=business";

const PERKS = [
  {
    icon: "🔗",
    title: "One profile, two platforms",
    text: "Godesi.com and GoDesi.wiki",
  },
  {
    icon: "🔄",
    title: "Published for you",
    text: "Everything you enter appears on GoDesi.wiki",
  },
  {
    icon: "🔍",
    title: "Marketing and SEO on us",
    text: "We promote the directory so customers find you",
  },
  {
    icon: "📞",
    title: "Enquiries come to you",
    text: "No commission on your work",
  },
];

/** The full offer, for the top of the home page and the marketing page. */
export function GodesiWikiBanner() {
  return (
    <section className="overflow-hidden rounded-3xl border-2 border-amber-300 bg-white">
      <div className="grid gap-0 md:grid-cols-[1.1fr_1fr]">
        <div className="p-5 sm:p-6">
          <p className="inline-flex items-center gap-2 rounded-full bg-amber-100 px-3 py-1 text-xs font-black uppercase tracking-wide text-amber-900">
            🌐 Free for 1 year · limited time
          </p>
          <h2 className="mt-2 text-2xl font-black leading-tight sm:text-3xl">
            Free marketing, free SEO and a free{" "}
            <a
              href="https://godesi.wiki"
              target="_blank"
              rel="noopener"
              className="text-amber-700 underline decoration-amber-300 underline-offset-4"
            >
              GoDesi.wiki
            </a>{" "}
            membership
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            List your business here — pick any categories, then add the micro
            detail: services and products, languages you speak, service areas,
            working hours, price range, special offers, payment options, photos
            and videos. Everything you enter is also published on GoDesi.wiki,
            the world&apos;s first exclusive desi wiki directory, free for your
            first year.
          </p>
          <ul className="mt-4 grid gap-2 sm:grid-cols-2">
            {PERKS.map((perk) => (
              <li key={perk.title} className="flex gap-2 text-sm">
                <span aria-hidden>{perk.icon}</span>
                <span>
                  <span className="font-bold text-slate-900">{perk.title}</span>
                  <span className="block text-xs text-slate-500">
                    {perk.text}
                  </span>
                </span>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link
              href={LISTING_START}
              className="rounded-xl bg-amber-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-amber-700"
            >
              List my business free
            </Link>
            <a
              href="https://godesi.wiki"
              target="_blank"
              rel="noopener"
              className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50"
            >
              Visit GoDesi.wiki
            </a>
          </div>
          <p className="mt-2 text-xs text-slate-500">
            Only what you publish on your Godesi card is shown — the phone field
            is optional, so leave it out and no number appears.
          </p>
        </div>
        <div className="bg-slate-900">
          {/* The offer poster, shown whole so the small print stays readable. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/godesi-marketing.jpg"
            alt="GoDesi marketing services — free marketing, free SEO and a free GoDesi.wiki membership for one year"
            loading="lazy"
            className="h-full w-full object-contain"
          />
        </div>
      </div>
    </section>
  );
}

/** The small version, for the sponsored rail and other spare space. */
export function GodesiWikiCard({ className = "" }: { className?: string }) {
  return (
    <Link
      href="/marketing"
      className={`block rounded-2xl bg-gradient-to-br from-amber-700 to-slate-900 p-4 text-white shadow-sm transition hover:brightness-110 ${className}`}
    >
      <p className="text-[11px] font-black uppercase tracking-wide text-amber-300">
        Free for 1 year
      </p>
      <p className="mt-1 text-base font-black leading-tight">
        🌐 Free GoDesi.wiki membership
      </p>
      <p className="mt-1 text-xs text-white/85">
        List free on Godesi.com and everything you enter is published on
        GoDesi.wiki too — plus free marketing and SEO.
      </p>
      <span className="mt-2 inline-block text-xs font-bold text-amber-300">
        See what you get →
      </span>
    </Link>
  );
}
