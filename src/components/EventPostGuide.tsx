import Link from "next/link";

const WHY = [
  "Free to list, live in about two minutes — no approval queue.",
  "The people here are already desi, in your city.",
  "Real ticketing: card payments, QR tickets, ticket tiers and coupon codes.",
  "No GoDesi ticket fee on free events or on a Pro / Featured plan.",
  "Door check-in and an attendee list with who referred each booking.",
];

const STEPS: { title: string; body: string; href?: string; link?: string }[] = [
  {
    title: "Post it here",
    body: "Add a clear poster, date, venue (or online link) and ticket prices. A full write-up and agenda help it show up in searches.",
  },
  {
    title: "Your own event page goes live",
    body: "It joins the GoDesi events board, your city's events page, its category page and GoDesi search.",
  },
  {
    title: "Search engines hear about it",
    body: "We tell search engines about the new page straight away, and it goes into our sitemap. Eventringer.com, our events site, gives it a page of its own too.",
  },
  {
    title: "Share it with the share kit",
    body: "Your event page has a ready-made message for WhatsApp and Facebook groups, Nextdoor and Patch. Copy, paste, done.",
  },
  {
    title: "Give out a coupon code",
    body: "Early-bird or group codes get people to book sooner, and give your partners something to share.",
    href: "/dashboard/coupons",
    link: "Make a coupon",
  },
  {
    title: "Get featured",
    body: "Featured events get the gold frame, the top of the events page, the home page and the side rail, and may go in the GoDesi newsletter.",
    href: "/events/partner",
    link: "Get featured free with a partner deal",
  },
  {
    title: "Put a banner on every page",
    body: "For a big show, book a banner across GoDesi.com.",
    href: "/advertise",
    link: "See banner prices",
  },
];

function GuideBody() {
  return (
    <div className="space-y-4 text-sm">
      <div>
        <p className="font-bold text-slate-900">Why post on GoDesi?</p>
        <ul className="mt-2 space-y-1.5 text-slate-600">
          {WHY.map((line) => (
            <li key={line} className="flex gap-2">
              <span className="text-emerald-600">✓</span>
              <span>{line}</span>
            </li>
          ))}
        </ul>
      </div>
      <div>
        <p className="font-bold text-slate-900">
          How GoDesi helps promote it, step by step
        </p>
        <ol className="mt-2 space-y-3">
          {STEPS.map((step, index) => (
            <li key={step.title} className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white">
                {index + 1}
              </span>
              <div>
                <p className="font-semibold text-slate-900">{step.title}</p>
                <p className="text-slate-600">{step.body}</p>
                {step.href ? (
                  <Link
                    href={step.href}
                    className="font-semibold text-indigo-600"
                  >
                    {step.link} →
                  </Link>
                ) : null}
              </div>
            </li>
          ))}
        </ol>
      </div>
      <Link
        href="/events/how-it-works"
        className="block font-semibold text-indigo-600"
      >
        Fees and everywhere your event gets listed →
      </Link>
    </div>
  );
}

/** "Why post here / how we promote it" guide beside the post-event form. */
export function EventPostGuide({
  collapsible = false,
}: {
  collapsible?: boolean;
}) {
  if (collapsible) {
    return (
      <details className="rounded-2xl border border-indigo-100 bg-indigo-50/60 p-4">
        <summary className="cursor-pointer text-sm font-bold text-indigo-900">
          📣 Why post on GoDesi, and how we promote your event
        </summary>
        <div className="mt-3">
          <GuideBody />
        </div>
      </details>
    );
  }
  return (
    <section className="rounded-2xl border border-indigo-100 bg-indigo-50/60 p-4">
      <p className="mb-3 text-base font-bold text-indigo-900">
        📣 Why post here, and how we promote it
      </p>
      <GuideBody />
    </section>
  );
}
