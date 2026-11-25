import Link from "next/link";

type Group = {
  title: string;
  icon: string;
  href: string;
  tint: string;
  links: { href: string; label: string }[];
};

/** The homepage's way in, grouped by what people come to GoDesi for. */
const GROUPS: Group[] = [
  {
    title: "Community",
    icon: "👥",
    href: "/chatter",
    tint: "from-emerald-50 to-teal-50 border-emerald-200",
    links: [
      { href: "/chatter", label: "Chatter" },
      { href: "/clubs", label: "Clubs" },
      { href: "/people", label: "Members" },
      { href: "/religious", label: "Temples & gurdwaras" },
    ],
  },
  {
    title: "Rishta & Connect",
    icon: "💍",
    href: "/rishta",
    tint: "from-rose-50 to-pink-50 border-rose-200",
    links: [
      { href: "/rishta", label: "Rishta profiles" },
      { href: "/connect", label: "Meet desis near you" },
      { href: "/astrology/kundli-matching-for-marriage", label: "Kundli matching" },
    ],
  },
  {
    title: "Food",
    icon: "🍛",
    href: "/categories/food-catering",
    tint: "from-orange-50 to-amber-50 border-orange-200",
    links: [
      { href: "/categories/food-catering-restaurants", label: "Restaurants" },
      { href: "/categories/food-catering-tiffin-and-dabba-service", label: "Tiffin service" },
      { href: "/categories/food-catering-sweet-shops", label: "Sweet shops" },
      { href: "/categories/food-catering-grocery-and-indian-stores", label: "Indian grocery" },
    ],
  },
  {
    title: "Events",
    icon: "🎟️",
    href: "/events",
    tint: "from-violet-50 to-fuchsia-50 border-violet-200",
    links: [
      { href: "/events", label: "Events near you" },
      { href: "/festivals", label: "Festival calendar" },
      { href: "/venues", label: "Venues" },
    ],
  },
  {
    title: "Deals",
    icon: "🏷️",
    href: "/deals",
    tint: "from-red-50 to-rose-50 border-red-200",
    links: [
      { href: "/deals", label: "Business deals" },
      { href: "/shop", label: "Desi shop" },
      { href: "/travel", label: "Travel deals" },
    ],
  },
  {
    title: "Jobs",
    icon: "💼",
    href: "/jobs",
    tint: "from-sky-50 to-cyan-50 border-sky-200",
    links: [
      { href: "/jobs", label: "Desi mini jobs" },
      { href: "/gigs", label: "Gigs" },
      { href: "/professionals", label: "Professionals" },
    ],
  },
  {
    title: "Real Estate",
    icon: "🏢",
    href: "/real-estate",
    tint: "from-slate-50 to-zinc-50 border-slate-200",
    links: [
      { href: "/real-estate", label: "Homes & agents" },
      { href: "/rooms", label: "Rooms & roommates" },
    ],
  },
  {
    title: "Classifieds",
    icon: "📣",
    href: "/classifieds",
    tint: "from-yellow-50 to-amber-50 border-yellow-200",
    links: [
      { href: "/classifieds", label: "Free ads" },
      { href: "/marketplace", label: "Buy & sell" },
      { href: "/leads", label: "Leads" },
    ],
  },
  {
    title: "Travel",
    icon: "✈️",
    href: "/travel",
    tint: "from-blue-50 to-indigo-50 border-blue-200",
    links: [
      { href: "/travel", label: "Flights & hotels" },
      { href: "/visa-bulletin", label: "Visa Bulletin" },
      { href: "/usd-to-inr", label: "Dollar to rupee" },
    ],
  },
  {
    title: "Weddings",
    icon: "💐",
    href: "/wedding",
    tint: "from-pink-50 to-rose-50 border-pink-200",
    links: [
      { href: "/wedding", label: "Wedding services" },
      { href: "/astrology/muhurat-for-weddings-and-griha-pravesh", label: "Wedding muhurat" },
      { href: "/pooja", label: "Pandit & pooja" },
    ],
  },
  {
    title: "News",
    icon: "📰",
    href: "/news",
    tint: "from-indigo-50 to-sky-50 border-indigo-200",
    links: [
      { href: "/news", label: "Desi news" },
      { href: "/bollywood", label: "Bollywood" },
      { href: "/markets", label: "Markets" },
    ],
  },
  {
    title: "Astrology",
    icon: "🔮",
    href: "/astrology",
    tint: "from-amber-50 to-orange-50 border-amber-200",
    links: [
      { href: "/astrology/horoscope", label: "Horoscope" },
      { href: "/astrology/panchang", label: "Panchang" },
      { href: "/astrology/kundli-calculator", label: "Free Kundli" },
    ],
  },
];

export function ExploreGroups() {
  return (
    <section aria-labelledby="explore-godesi" className="space-y-3">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <h2 id="explore-godesi" className="text-xl font-bold">
          ✨ Explore GoDesi
        </h2>
        <Link
          href="/daily"
          className="rounded-full bg-gradient-to-r from-amber-400 via-rose-500 to-indigo-600 px-3.5 py-1 text-sm font-bold text-white shadow-sm hover:opacity-90"
        >
          ☀️ Today on GoDesi Daily →
        </Link>
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
        {GROUPS.map((group) => (
          <div
            key={group.title}
            className={`min-w-0 rounded-2xl border bg-gradient-to-br p-3 ${group.tint}`}
          >
            <Link
              href={group.href}
              className="block font-black text-slate-900 hover:text-indigo-700"
            >
              {group.icon} {group.title}
            </Link>
            <ul className="mt-1 space-y-0.5 text-sm">
              {group.links.map((link) => (
                <li key={link.href} className="truncate">
                  <Link
                    href={link.href}
                    className="text-slate-600 hover:text-indigo-700 hover:underline"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
