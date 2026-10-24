import { LESSONS as MARKETING_LESSONS } from "../course";
import { LIFE_INSURANCE_LESSONS } from "./lifeInsurance";
import { REALTOR_LESSONS } from "./realtor";
import { FLIPPING_LESSONS } from "./flipping";
import { RENTALS_LESSONS } from "./rentals";
import { MULTIFAMILY_LESSONS } from "./multifamily";
import { NOTARY_LESSONS } from "./notary";
import { AIRBNB_LESSONS } from "./airbnb";
import { OFFMARKET_LESSONS } from "./offmarket";
import { PRESENCE_LESSONS } from "./presence";
import {
  Course,
  LAUNCH_LIST_PRICE_MINOR,
  LAUNCH_PRICE_MINOR,
} from "./types";

export * from "./types";

/** The GoDesi course catalog — each sells separately, author Anil Aggarwal, Realtor. */
export const COURSES: Course[] = [
  {
    slug: "marketing",
    title: "GoDesi.com Course of Marketing",
    shortTitle: "Marketing & Online Income",
    tagline:
      "How everyday people make money online — UGC, affiliate income, selling digital products — and how to grow it from pocket money into an asset you own.",
    pitch:
      "Learn how people really make money online — for the price of a coffee.",
    emoji: "🎓",
    cover: "/images/courses/marketing.jpg",
    priceMinor: LAUNCH_PRICE_MINOR,
    listPriceMinor: LAUNCH_LIST_PRICE_MINOR,
    highlights: [
      {
        icon: "🎬",
        title: "UGC income",
        body: "Get paid $50–$500 a video making simple clips for brands — no followers needed.",
      },
      {
        icon: "🔗",
        title: "Affiliate money",
        body: "Earn a cut every time someone buys through your link — with the GoDesi partner program as a live example.",
      },
      {
        icon: "📱",
        title: "Free traffic",
        body: "The TikTok/short-video playbook: hooks, daily posting, and turning viewers into buyers.",
      },
      {
        icon: "🏠",
        title: "Scale up",
        body: "From renting attention to owning it — list, website, products — and from renting a home to owning one.",
      },
    ],
    lessons: MARKETING_LESSONS,
  },
  {
    slug: "life-insurance",
    title: "Part-Time Income with a Life Insurance License",
    shortTitle: "Life Insurance Income",
    tagline:
      "Turn a few weekends into a license that pays for years — protecting families in your community while building a book of renewal income.",
    pitch:
      "One license, evening hours, commissions that renew every year.",
    emoji: "🛡️",
    cover: "/images/courses/life-insurance.jpg",
    priceMinor: LAUNCH_PRICE_MINOR,
    listPriceMinor: LAUNCH_LIST_PRICE_MINOR,
    highlights: [
      {
        icon: "📜",
        title: "Cheap license",
        body: "A few hundred dollars and 3–6 weeks — the fastest professional license to income.",
      },
      {
        icon: "🔄",
        title: "Renewals",
        body: "Policies keep paying small commissions every year they stay in force.",
      },
      {
        icon: "🏘️",
        title: "Warm market",
        body: "Your first 10 clients come from people who already know you.",
      },
      {
        icon: "🕕",
        title: "True part-time",
        body: "Evening and weekend appointments — keep the job while you build.",
      },
    ],
    lessons: LIFE_INSURANCE_LESSONS,
  },
  {
    slug: "realtor-income",
    title: "Part-Time Income with a Real Estate License",
    shortTitle: "Real Estate Income",
    tagline:
      "The highest-paying weekend skill in America — rentals, buyers and referrals on evenings and weekends, taught by a working NJ realtor.",
    pitch:
      "One closing can pay more than a month of weekends — here's the part-timer's path.",
    emoji: "🏠",
    cover: "/images/courses/realtor-income.jpg",
    priceMinor: LAUNCH_PRICE_MINOR,
    listPriceMinor: LAUNCH_LIST_PRICE_MINOR,
    highlights: [
      {
        icon: "💰",
        title: "Big checks",
        body: "One average NJ closing ≈ $6K–$12K — a month of weekend income in a day.",
      },
      {
        icon: "🔑",
        title: "Rentals first",
        body: "Lease deals close in days — the fastest first paycheck in real estate.",
      },
      {
        icon: "📞",
        title: "Sphere system",
        body: "80% of first-year deals come from people who already know you.",
      },
      {
        icon: "🗓️",
        title: "Weekly rhythm",
        body: "A realistic evening/weekend schedule that actually closes deals.",
      },
    ],
    lessons: REALTOR_LESSONS,
  },
  {
    slug: "flipping",
    title: "Flipping Your First Property",
    shortTitle: "Flipping Houses",
    tagline:
      "Buy below market, renovate smart, sell fast — the numbers, the lenders, the contractors, and the mistakes that burn first-timers.",
    pitch:
      "Profit is made when you buy — learn the math before you offer.",
    emoji: "🔨",
    cover: "/images/courses/flipping.jpg",
    priceMinor: LAUNCH_PRICE_MINOR,
    listPriceMinor: LAUNCH_LIST_PRICE_MINOR,
    highlights: [
      {
        icon: "🧮",
        title: "The 70% rule",
        body: "The formula that keeps flips profitable before you ever buy.",
      },
      {
        icon: "🔍",
        title: "Finding deals",
        body: "Driving for dollars, lists, letters — where discounts actually hide.",
      },
      {
        icon: "🏗️",
        title: "Renovation control",
        body: "Scopes, bids, contractors and the contingency that saves you.",
      },
      {
        icon: "⚡",
        title: "Fast exits",
        body: "Stage, price, sell — speed is profit in a flip.",
      },
    ],
    lessons: FLIPPING_LESSONS,
  },
  {
    slug: "rentals",
    title: "Rental Properties for Monthly Income",
    shortTitle: "Rental Income",
    tagline:
      "The quiet wealth builder — cash flow, loan paydown and appreciation, starting with one small rental or a house hack.",
    pitch:
      "One rental is a few hundred a month — five rentals is an income.",
    emoji: "🏘️",
    cover: "/images/courses/rentals.jpg",
    priceMinor: LAUNCH_PRICE_MINOR,
    listPriceMinor: LAUNCH_LIST_PRICE_MINOR,
    highlights: [
      {
        icon: "💵",
        title: "Three incomes",
        body: "Cash flow + loan paydown + appreciation from one property.",
      },
      {
        icon: "🛏️",
        title: "House hacking",
        body: "Live in one unit, rent the rest — FHA with ~3.5% down.",
      },
      {
        icon: "🧾",
        title: "Screening",
        body: "The tenant rules that keep rent coming and drama out.",
      },
      {
        icon: "📈",
        title: "Scaling",
        body: "From door one to door five on a normal salary.",
      },
    ],
    lessons: RENTALS_LESSONS,
  },
  {
    slug: "multifamily",
    title: "Multifamily Investing — Small Apartment Buildings",
    shortTitle: "Multifamily",
    tagline:
      "Duplexes, triplexes and small apartment buildings — several rent checks under one roof, and the income math that makes buildings grow in value.",
    pitch:
      "One roof, many rent checks — where value follows income.",
    emoji: "🏢",
    cover: "/images/courses/multifamily.jpg",
    priceMinor: LAUNCH_PRICE_MINOR,
    listPriceMinor: LAUNCH_LIST_PRICE_MINOR,
    highlights: [
      {
        icon: "🚪",
        title: "Never zero",
        body: "One empty unit out of four still means 75% income.",
      },
      {
        icon: "📊",
        title: "NOI & cap rates",
        body: "The three numbers that price every building — in plain words.",
      },
      {
        icon: "⬆️",
        title: "Forced appreciation",
        body: "Raise income, raise value — the lever single homes don't have.",
      },
      {
        icon: "🏦",
        title: "FHA 2–4 units",
        body: "Buy a fourplex with ~3.5% down by living in one unit.",
      },
    ],
    lessons: MULTIFAMILY_LESSONS,
  },
  {
    slug: "notary-signing",
    title: "Notary & Loan Signing Agent Income",
    shortTitle: "Notary Signing Agent",
    tagline:
      "The cheapest license with a real paycheck — $75–$150 per one-hour loan signing, evenings and weekends.",
    pitch:
      "About an hour per signing, $75–$150 each — the lowest-cost license that pays.",
    emoji: "🖋️",
    cover: "/images/courses/notary-signing.jpg",
    priceMinor: LAUNCH_PRICE_MINOR,
    listPriceMinor: LAUNCH_LIST_PRICE_MINOR,
    highlights: [
      {
        icon: "💲",
        title: "Per-signing pay",
        body: "$75–$150 per ~1-hour signing; busy weekends mean real money.",
      },
      {
        icon: "📱",
        title: "Jobs via apps",
        body: "Snapdocs and title companies dispatch work to your phone.",
      },
      {
        icon: "🧾",
        title: "Small startup",
        body: "Commission + certification + supplies ≈ $300–$600 total.",
      },
      {
        icon: "🤝",
        title: "Stacks well",
        body: "Pairs perfectly with a realtor or insurance side business.",
      },
    ],
    lessons: NOTARY_LESSONS,
  },
  {
    slug: "short-term-rentals",
    title: "Short-Term Rental & Airbnb Income",
    shortTitle: "Airbnb Income",
    tagline:
      "Nightly income from property you own — or property you don't: co-hosting and the rules that keep an STR legal and five-star.",
    pitch:
      "Nightly rates beat monthly rents — if the town and the numbers allow it.",
    emoji: "🌴",
    cover: "/images/courses/short-term-rentals.jpg",
    priceMinor: LAUNCH_PRICE_MINOR,
    listPriceMinor: LAUNCH_LIST_PRICE_MINOR,
    highlights: [
      {
        icon: "🌙",
        title: "Nightly math",
        body: "Rate × occupancy — run real comps before you buy or sign.",
      },
      {
        icon: "🧑‍💼",
        title: "Co-hosting",
        body: "Manage others' listings for 15–25% — no property needed.",
      },
      {
        icon: "⭐",
        title: "5-star setup",
        body: "Self check-in, pro photos, fast replies — the review machine.",
      },
      {
        icon: "⚖️",
        title: "Stay legal",
        body: "Permits, registrations and taxes — the towns' real rules.",
      },
    ],
    lessons: AIRBNB_LESSONS,
  },
  {
    slug: "off-market-deals",
    title: "Off-Market Deals & Wholesaling Basics",
    shortTitle: "Off-Market & Wholesale",
    tagline:
      "Find the houses that never hit Zillow — motivated sellers, letters that work, and assigning contracts to investors for a fee.",
    pitch:
      "The best deals are never listed — learn to find them first.",
    emoji: "📬",
    cover: "/images/courses/off-market-deals.jpg",
    priceMinor: LAUNCH_PRICE_MINOR,
    listPriceMinor: LAUNCH_LIST_PRICE_MINOR,
    highlights: [
      {
        icon: "🏚️",
        title: "Driving for dollars",
        body: "Distressed houses → owner letters → deals the MLS never sees.",
      },
      {
        icon: "📄",
        title: "Wholesale fees",
        body: "Contract a discounted house, assign the contract for $5K–$20K.",
      },
      {
        icon: "🗣️",
        title: "Seller talks",
        body: "The conversation that turns 'not now' into 'let's talk'.",
      },
      {
        icon: "📋",
        title: "Buyers list",
        body: "Build the investor list before you need it — exits on demand.",
      },
    ],
    lessons: OFFMARKET_LESSONS,
  },
  {
    slug: "online-presence",
    title: "Your Online Presence That Sells",
    shortTitle: "Presence That Sells",
    tagline:
      "Free listings, digital business cards, reviews and a 30-minute weekly routine — turn a quiet profile into a lead machine.",
    pitch:
      "People search you before they call you — own what they find.",
    emoji: "📇",
    cover: "/images/courses/online-presence.jpg",
    priceMinor: LAUNCH_PRICE_MINOR,
    listPriceMinor: LAUNCH_LIST_PRICE_MINOR,
    highlights: [
      {
        icon: "📍",
        title: "Free listings",
        body: "Google + GoDesi profiles — the 30-minute base that brings calls.",
      },
      {
        icon: "🔳",
        title: "Digital card",
        body: "A QR code that saves your contact in 2 seconds — at events, signs, everywhere.",
      },
      {
        icon: "⭐",
        title: "Review flywheel",
        body: "Ask at the happy moment — reviews that sell for you year-round.",
      },
      {
        icon: "🎯",
        title: "Lead capture",
        body: "Offers, deals and booking links that turn views into names.",
      },
    ],
    lessons: PRESENCE_LESSONS,
  },
];

export function courseBySlug(slug: string): Course | undefined {
  return COURSES.find((c) => c.slug === slug);
}
