import Link from "next/link";

/**
 * Fills a placement nobody has bought and Google has not filled. An empty band
 * earns nothing and looks broken, so the space sells Godesi instead: post a
 * requirement, list a business, get wedding quotes. Deterministic per slot so
 * the server and the browser render the same promo.
 */
const PROMOS = [
  {
    emoji: "🏪",
    title: "List your business free",
    text: "A page with photos, reviews, WhatsApp and a QR card.",
    cta: "Create my card",
    href: "/signup",
    tone: "from-indigo-600 to-violet-600",
  },
  {
    emoji: "📣",
    title: "Need a quote?",
    text: "Post what you need and desi businesses come back to you.",
    cta: "Post a requirement",
    href: "/leads/new",
    tone: "from-emerald-600 to-teal-600",
  },
  {
    emoji: "💍",
    title: "Planning a wedding?",
    text: "Caterers, decorators, priests, mehndi, photographers.",
    cta: "Get wedding quotes",
    href: "/wedding",
    tone: "from-rose-500 to-amber-500",
  },
  {
    emoji: "🎟️",
    title: "Selling event tickets?",
    text: "List your garba, concert or mela free and sell on Godesi.",
    cta: "List an event",
    href: "/events/new",
    tone: "from-fuchsia-600 to-pink-600",
  },
  {
    emoji: "🏠",
    title: "Selling or renting?",
    text: "Post a home, a room or a flat to desi buyers near you.",
    cta: "Post a property",
    href: "/listings/new?kind=PROPERTY_SALE",
    tone: "from-sky-600 to-blue-700",
  },
  {
    emoji: "🏆",
    title: "GoDesi Elite",
    text: "Desi leaders, founders and professionals recognised here.",
    cta: "See who's in",
    href: "/desi-elite",
    tone: "from-amber-600 to-orange-600",
  },
  {
    emoji: "🌐",
    title: "Free GoDesi.wiki membership",
    text: "List free and you are published on GoDesi.wiki too, with free SEO.",
    cta: "See what you get",
    href: "/marketing",
    tone: "from-amber-600 to-slate-800",
  },
  {
    emoji: "🎧",
    title: "DJs — free DJs.wiki listing",
    text: "List in the DJ section and you are published on DJs.wiki too.",
    cta: "List free for a year",
    href: "/categories/events-wedding-dj-and-sound",
    tone: "from-fuchsia-700 to-purple-800",
  },
  {
    emoji: "🎁",
    title: "Earn while you refer",
    text: "Points for every friend who lists, redeemable for coupons.",
    cta: "See rewards",
    href: "/rewards",
    tone: "from-purple-600 to-indigo-700",
  },
] as const;

export function HousePromo({
  width,
  height,
  /** Anything stable about the placement, so two slots on a page differ. */
  seed = "",
  className = "",
}: {
  width: number;
  height: number;
  seed?: string;
  className?: string;
}) {
  let hash = 0;
  for (const character of seed) hash = (hash * 31 + character.charCodeAt(0)) % 9973;
  const promo = PROMOS[hash % PROMOS.length];
  const tall = height > width;

  return (
    <Link
      href={promo.href}
      style={{ aspectRatio: `${width} / ${height}`, maxWidth: width }}
      className={`mx-auto flex flex-col justify-center gap-1 overflow-hidden rounded-xl bg-gradient-to-br ${promo.tone} p-3 text-center text-white transition hover:opacity-95 ${className}`}
    >
      <span className={tall ? "text-3xl" : "text-2xl"}>{promo.emoji}</span>
      <span className="text-sm font-black leading-tight">{promo.title}</span>
      <span className="text-[11px] leading-snug text-white/90">{promo.text}</span>
      <span className="mt-0.5 text-[11px] font-bold underline">{promo.cta} →</span>
    </Link>
  );
}
