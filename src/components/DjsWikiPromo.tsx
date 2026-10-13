import Link from "next/link";

/**
 * The DJs.wiki offer: a DJ who lists in Godesi's DJ and sound section is also
 * published on djs.wiki, our DJ-only directory, free for the first year.
 */
export const DJ_CATEGORY_SLUGS = [
  "events-wedding-dj-and-sound",
  "events-wedding-dhol-and-baraat",
  "events-wedding-live-bands",
  "events-wedding-anchors-and-artists",
  "events-wedding-stage-and-sound-rentals",
];

const DJ_SIGNUP =
  "/dashboard/profile?category=events-wedding&subcategory=events-wedding-dj-and-sound&type=business";

const PERKS = [
  { icon: "🔗", title: "One profile, two sites", text: "Godesi.com and DJs.wiki" },
  { icon: "🔄", title: "Published for you", text: "Your card appears on DJs.wiki" },
  { icon: "🔍", title: "Marketing and SEO on us", text: "We promote the directory" },
  { icon: "📞", title: "Enquiries come to you", text: "No commission on bookings" },
];

/** The full offer, for the top of a DJ category page. */
export function DjsWikiBanner() {
  return (
    <section className="overflow-hidden rounded-3xl border-2 border-fuchsia-300 bg-white">
      <div className="grid gap-0 md:grid-cols-[1.1fr_1fr]">
        <div className="p-5 sm:p-6">
          <p className="inline-flex items-center gap-2 rounded-full bg-amber-100 px-3 py-1 text-xs font-black uppercase tracking-wide text-amber-900">
            🎧 Free for 1 year · limited time
          </p>
          <h2 className="mt-2 text-2xl font-black leading-tight sm:text-3xl">
            Get a free{" "}
            <a
              href="https://djs.wiki"
              target="_blank"
              rel="noopener"
              className="text-fuchsia-700 underline decoration-fuchsia-300 underline-offset-4"
            >
              DJs.wiki
            </a>{" "}
            membership with your Godesi DJ listing
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            List your DJ service here — services, music languages, equipment and
            rig, packages, event types, performance area, years of experience,
            availability, videos and photos — and the same profile is published
            on DJs.wiki, the world&apos;s first DJs wiki directory. One form, two
            directories, free for your first year.
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
              href={DJ_SIGNUP}
              className="rounded-xl bg-fuchsia-700 px-4 py-2.5 text-sm font-bold text-white hover:bg-fuchsia-800"
            >
              List my DJ service free
            </Link>
            <a
              href="https://djs.wiki"
              target="_blank"
              rel="noopener"
              className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50"
            >
              Visit DJs.wiki
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
            src="/djs-wiki-offer.jpg"
            alt="GoDesi DJ Services — free DJs.wiki membership for one year"
            loading="lazy"
            className="h-full w-full object-contain"
          />
        </div>
      </div>
    </section>
  );
}

/** The small version, for the sponsored rail and other spare space. */
export function DjsWikiCard({ className = "" }: { className?: string }) {
  return (
    <Link
      href="/categories/events-wedding-dj-and-sound"
      className={`block rounded-2xl bg-gradient-to-br from-fuchsia-800 to-purple-900 p-4 text-white shadow-sm transition hover:brightness-110 ${className}`}
    >
      <p className="text-[11px] font-black uppercase tracking-wide text-amber-300">
        Free for 1 year
      </p>
      <p className="mt-1 text-base font-black leading-tight">
        🎧 DJs — get a free DJs.wiki listing
      </p>
      <p className="mt-1 text-xs text-white/85">
        List in Godesi&apos;s DJ &amp; sound section and your profile is
        published on DJs.wiki too — the world&apos;s first DJs wiki directory.
      </p>
      <span className="mt-2 inline-block text-xs font-bold text-amber-300">
        List free →
      </span>
    </Link>
  );
}
