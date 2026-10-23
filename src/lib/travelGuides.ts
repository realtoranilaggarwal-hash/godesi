/**
 * Static travel guides rendered under /travel/guides. External links point at
 * Travelpayouts partner brand sites — the "Drive" script in the site <head>
 * rewrites them into affiliate links with our marker when a visitor clicks.
 */
export type TravelGuideLink = { label: string; href: string };

export type TravelGuideSection = {
  heading: string;
  paragraphs: string[];
  links?: TravelGuideLink[];
};

export type TravelGuide = {
  slug: string;
  title: string;
  emoji: string;
  /** One-line summary for cards and meta description. */
  description: string;
  minutes: number;
  sections: TravelGuideSection[];
};

export const TRAVEL_GUIDES: TravelGuide[] = [
  {
    slug: "cheap-flights-to-india",
    title: "How to find cheap flights to India",
    emoji: "✈️",
    description:
      "When to book, which days to fly, and the tricks that regularly cut hundreds off USA→India fares.",
    minutes: 4,
    sections: [
      {
        heading: "Book in the sweet spot",
        paragraphs: [
          "For USA→India flights, prices are usually lowest roughly 2–5 months before departure. Book too early and fares have not dropped yet; wait for the last month and prices climb steeply, especially for December and summer travel.",
          "Peak seasons — mid-December to early January, and June to August — sell out the cheapest seats first. If you are flying for a wedding or festival season, book 4–6 months ahead.",
        ],
      },
      {
        heading: "Fly on cheap days",
        paragraphs: [
          "Tuesday, Wednesday and Thursday departures are consistently cheaper than Friday and Sunday ones. Shifting your trip by even a day or two can save $100–300 per ticket.",
          "Compare nearby airports too: flying out of EWR vs JFK, or landing at AMD vs BOM, sometimes changes the fare by more than the cost of a domestic hop.",
        ],
      },
      {
        heading: "Use a comparison search, then double-check",
        paragraphs: [
          "Always run the same dates through a comparison search — fares differ between airlines and booking sites for the exact same seat. Our GoDesi Travel search checks hundreds of airlines and agencies in one go.",
          "Watch the connection details: a saving of $80 is rarely worth a 9-hour layover, but a 2–4 hour stop in the Gulf or Europe often comes with a big discount.",
        ],
        links: [
          { label: "Search flights on GoDesi Travel", href: "/travel" },
        ],
      },
      {
        heading: "If your flight goes wrong",
        paragraphs: [
          "Delayed or cancelled flights on many routes can entitle you to compensation of up to several hundred dollars. Keep your boarding pass and booking confirmation — claims can often be filed months later.",
        ],
        links: [
          { label: "Check your flight with AirHelp", href: "https://www.airhelp.com/" },
          { label: "Claim via Compensair", href: "https://compensair.com/" },
        ],
      },
    ],
  },
  {
    slug: "esim-guide-india-travel",
    title: "Staying connected in India: eSIM guide",
    emoji: "📱",
    description:
      "Skip the airport SIM queue — how travel eSIMs work, what they cost, and which to pick for an India trip.",
    minutes: 4,
    sections: [
      {
        heading: "Why an eSIM beats the airport counter",
        paragraphs: [
          "Buying a local SIM in India means queuing at an airport kiosk, handing over passport copies and photos, and waiting for activation. A travel eSIM installs on your phone in minutes — before you even board — and starts working the moment you land.",
          "Most iPhones sold in the USA are eSIM-only, and most recent Android flagships support eSIM too. Check Settings → Mobile/Cellular for an 'Add eSIM' option before you buy.",
        ],
      },
      {
        heading: "What it costs",
        paragraphs: [
          "India travel eSIMs are cheap: expect a few dollars for 1 GB up to $15–25 for 10–20 GB lasting 30 days. That is far less than international roaming, which can be $10 per day or worse.",
          "Buy enough data for maps, WhatsApp and ride apps — video calls and streaming eat data fast, so add a little extra if you plan to call home over data.",
        ],
        links: [
          { label: "Browse India eSIMs on Airalo", href: "https://www.airalo.com/" },
          { label: "Compare Saily plans", href: "https://saily.com/" },
          { label: "Yesim India plans", href: "https://yesim.app/" },
        ],
      },
      {
        heading: "Prefer a physical SIM?",
        paragraphs: [
          "If your phone has no eSIM support, a universal travel SIM card that works across countries is the next best thing — order it before you fly and swap it in when you land.",
        ],
        links: [
          { label: "Get a Drimsim card", href: "https://drimsim.com/" },
          { label: "GigSky plans (works in-flight too)", href: "https://www.gigsky.com/" },
        ],
      },
    ],
  },
  {
    slug: "airport-transfers-india",
    title: "Airport pickups in India: taxis and transfers",
    emoji: "🚖",
    description:
      "Landing at DEL, BOM or AMD at 2am? How pre-booked airport transfers work and when they beat the taxi line.",
    minutes: 3,
    sections: [
      {
        heading: "Why pre-book for India arrivals",
        paragraphs: [
          "Most USA→India flights land late at night or very early morning. Pre-paid and app taxis are available at big airports, but lines are long, card machines are unreliable, and family pickups mean negotiating in the arrivals scrum.",
          "A pre-booked transfer means a driver waiting with your name, a fixed price agreed up front, and no haggling after a 15-hour flight — worth it especially with kids, parents or heavy luggage.",
        ],
      },
      {
        heading: "What to expect to pay",
        paragraphs: [
          "Airport transfers in Indian metros typically run $10–40 depending on distance and car size — a tempo or van for the whole family costs more but still beats two taxis.",
          "Compare quotes: some services let drivers bid on your route, which can drop the price noticeably for longer city-to-city rides.",
        ],
        links: [
          { label: "Book a Kiwitaxi pickup", href: "https://kiwitaxi.com/" },
          { label: "Get driver bids on GetTransfer", href: "https://gettransfer.com/" },
          { label: "Welcome Pickups meet-and-greet", href: "https://www.welcomepickups.com/" },
          { label: "Shuttles on intui.travel", href: "https://en.intui.travel/" },
        ],
      },
      {
        heading: "Driving yourself instead",
        paragraphs: [
          "Self-drive car rentals and bikes are cheap in tourist states like Goa and Rajasthan. Carry your licence plus an International Driving Permit where required, and book ahead in season.",
        ],
        links: [
          { label: "Compare rentals on EconomyBookings", href: "https://www.economybookings.com/" },
          { label: "Rent from locals on Localrent", href: "https://localrent.com/" },
          { label: "Scooters on BikesBooking", href: "https://www.bikesbooking.com/" },
        ],
      },
    ],
  },
  {
    slug: "flight-delay-compensation",
    title: "Flight delayed or cancelled? Get compensated",
    emoji: "💸",
    description:
      "Many travellers leave hundreds of dollars unclaimed — when airlines owe you money for delays, and how to claim it.",
    minutes: 3,
    sections: [
      {
        heading: "When the airline owes you money",
        paragraphs: [
          "On flights covered by European and UK rules (departing Europe/UK, or arriving there on a European carrier), delays over 3 hours, cancellations and denied boarding can pay €250–600 per passenger — on top of a refund or rebooking.",
          "US rules are weaker, but cancellations still entitle you to a refund if you choose not to travel, and airlines owe meals and hotels for delays they caused. International treaties (the Montreal Convention) can cover expenses from delays worldwide.",
        ],
      },
      {
        heading: "How to actually claim",
        paragraphs: [
          "Airlines rarely volunteer compensation — you have to ask. You can file directly with the airline for free, or use a claims service that takes a cut (typically 25–35%) only if they win. For old flights, claims can often be filed 1–3 years later depending on the route.",
          "Keep evidence: booking confirmation, boarding passes, photos of the departure board, and receipts for food/hotels you paid for because of the delay.",
        ],
        links: [
          { label: "Check a flight on AirHelp", href: "https://www.airhelp.com/" },
          { label: "Start a Compensair claim", href: "https://compensair.com/" },
        ],
      },
      {
        heading: "While you wait",
        paragraphs: [
          "Long layover or a delay with luggage? Bag-storage networks let you drop suitcases in a local shop for a few dollars and explore instead of sitting in the terminal.",
        ],
        links: [
          { label: "Find luggage storage nearby", href: "https://radicalstorage.com/" },
        ],
      },
    ],
  },
];

export function getTravelGuide(slug: string) {
  return TRAVEL_GUIDES.find((guide) => guide.slug === slug);
}
