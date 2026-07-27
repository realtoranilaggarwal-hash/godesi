import Link from "next/link";

const BENEFITS = [
  {
    icon: "📇",
    title: "Digital business card",
    body: "A shareable page at godesi.com/yourname with your photos, services and hours — send it instead of a PDF.",
    href: "/add-business",
    cta: "Create yours free",
  },
  {
    icon: "📲",
    title: "QR code on every profile",
    body: "Put it on visiting cards, flyers or your shop window. One scan opens your full profile.",
    href: "/faq#qr",
    cta: "How it works",
  },
  {
    icon: "💬",
    title: "WhatsApp contact button",
    body: "Customers message you directly — no middleman, no commission on your work.",
    href: "/add-business",
    cta: "Add your business",
  },
  {
    icon: "🎯",
    title: "Real buyer requirements",
    body: "People post what they need with budget and city. Reach them before they call anyone else.",
    href: "/leads",
    cta: "See open requests",
  },
  {
    icon: "🏆",
    title: "Refer & earn points",
    body: "Invite others and earn points for every signup, profile and upgrade — spend them on ads and promotions.",
    href: "/dashboard/referrals",
    cta: "Get your link",
  },
  {
    icon: "🎟",
    title: "Coupons & tickets",
    body: "Sell tiered event tickets with QR entry and hand out your own discount codes to customers.",
    href: "/events/new",
    cta: "Post an event",
  },
  {
    icon: "📢",
    title: "Banner advertising",
    body: "Book a rotating banner monthly or by views — it retires itself when your views are delivered.",
    href: "/advertise",
    cta: "See rates",
  },
  {
    icon: "🔗",
    title: "Text links from $10",
    body: "No artwork needed — your link sits in the Recommended links box on matching category pages.",
    href: "/resources/new",
    cta: "Advertise a link",
  },
];

export function WhyGodesi() {
  return (
    <section className="rounded-3xl bg-slate-50 p-5 sm:p-7">
      <h2 className="text-xl font-black text-slate-900 sm:text-2xl">
        Why list on Godesi?
      </h2>
      <p className="mt-1 text-sm text-slate-600">
        Everything you need to be found, contacted and hired — free to start.
      </p>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {BENEFITS.map((benefit) => (
          <div
            key={benefit.title}
            className="flex flex-col rounded-2xl bg-white p-4 shadow-sm"
          >
            <span className="text-2xl" aria-hidden>
              {benefit.icon}
            </span>
            <h3 className="mt-2 text-sm font-bold text-slate-900">
              {benefit.title}
            </h3>
            <p className="mt-1 flex-1 text-sm text-slate-600">{benefit.body}</p>
            <Link
              href={benefit.href}
              className="mt-3 text-sm font-semibold text-rose-600 hover:underline"
            >
              {benefit.cta} →
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}
