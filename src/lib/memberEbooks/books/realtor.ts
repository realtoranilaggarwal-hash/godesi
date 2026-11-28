import type { Ebook } from "../types";

export const whyRealtorGuide: Ebook = {
  slug: "why-you-must-hire-a-realtor",
  title: "Why You Must Hire a Realtor®",
  subtitle: "What a licensed New Jersey Realtor does for sellers, buyers and landlords — and what going alone really costs",
  audience: "Sellers, buyers & landlords",
  color: "#4f46e5",
  pitch: "91% of sellers used an agent in NAR's 2025 profile, and agent-assisted homes sold for a higher median price than FSBOs. Here's why — and how to pick the right Realtor.",
  bullets: ["The real numbers: FSBO vs. agent-assisted sales", "Pricing, MLS exposure, negotiation and paperwork", "How Realtors protect you from fraud, squatters and lawsuits", "How to choose and interview a Realtor"],
  related: ["rent-vs-buy-analysis"],
  chapters: [
    {
      title: "1. The numbers",
      body: [
        "In the National Association of REALTORS® 2025 Profile of Home Buyers and Sellers, 91% of sellers sold with an agent and only 5% sold \"by owner\" (FSBO) — an all-time low. The median FSBO sale was $360,000 versus $425,000 for agent-assisted sales.",
        "That gap is not all caused by the agent: FSBO homes are more often lower-priced or rural. But sellers told NAR why they chose an agent: to market the home to more buyers, to price it right, and to sell on their timeline. 88% of buyers also bought through an agent.",
      ],
    },
    {
      title: "2. Pricing it right",
      body: [
        "Overpriced homes sit, and buyers start to wonder what is wrong. Underpriced homes leave money on the table. A Realtor prices with MLS data on recent sales, days on market and active competition — not just an online estimate.",
      ],
    },
    {
      title: "3. Exposure: MLS, photos and buyers' agents",
      body: [
        "Most buyers work with an agent, and those agents search the MLS. A home listed with a brokerage reaches every agent in the MLS and the big home-search sites at once. Professional photos, a floor plan, staging advice and a showing schedule make buyers stop scrolling.",
        "Many buyers' agents are cautious about FSBOs: unclear commission, no one to handle paperwork, and no errors-and-omissions insurance on the other side. That alone shrinks your buyer pool.",
      ],
    },
    {
      title: "4. Negotiation, inspections and paperwork",
      body: [
        "The price is only part of the deal. Inspections, appraisal gaps, attorney review in New Jersey, mortgage deadlines, repair credits and closing dates all need managing. A Realtor negotiates every step, keeps the deal on schedule, and coordinates with the attorney, lender and title company.",
        "Licensed agents must follow state license law, fair-housing rules and the NAR Code of Ethics, and carry errors-and-omissions insurance. You have someone accountable.",
      ],
      checklist: ["Pricing from MLS comparable sales", "Full MLS + portal exposure", "Screened, pre-approved buyers only", "Negotiation of price, repairs and dates", "Attorney review, inspection and appraisal managed", "Licensed, insured and accountable"],
    },
    {
      title: "5. Protection from fraud and risk",
      body: [
        "Licensed agents verify who they are dealing with. That protects you from seller-impersonation and deed fraud, fake buyers, wire-fraud emails, and from strangers getting keys to your home. For landlords, a Realtor screens tenants and uses proper leases, which helps keep squatters and bad tenants out.",
      ],
    },
    {
      title: "6. How to choose a Realtor",
      body: [
        "Interview at least two agents. Ask how many homes they sold in your area last year, their marketing plan, how they price, and who will actually show up at showings and inspections. Read reviews. Compare service, not just the commission — a discount agent who underprices your home by 3% costs more than they save.",
        "Commissions are always negotiable and set in a written agreement. Make sure you understand what you sign, and remember New Jersey contracts usually go through a three-day attorney review.",
        "Anil Aggarwal has sold 200+ homes as a Top Elite Platinum Agent and is Broker Manager & Realtor® with Vylla Home (NJ Lic #1753579). Brokerage services are provided only through Vylla Home under a signed agreement.",
      ],
      checklist: ["Interview 2–3 agents", "Ask for local sales numbers and reviews", "Get a written marketing and pricing plan", "Understand the commission in writing", "Use a NJ attorney for attorney review"],
    },
  ],
  sources: [
    { label: "NAR: FSBOs reach all-time low, more sellers rely on agents", url: "https://www.nar.realtor/news/real-estate-news/fsbos-reach-all-time-low-more-sellers-rely-on-agents" },
    { label: "NAR 2025 Profile of Home Buyers and Sellers (highlights)", url: "https://www.nar.realtor/sites/default/files/2025-11/2025-profile-of-home-buyers-and-sellers-highlights-11-04-2025.pdf" },
    { label: "Anil's article: Why FSBO Homes Struggle & Why Realtors Don't Bring Buyers", url: "https://www.anilsellsnj.com/blog/why-fsbo-homes-struggle-why-realtors-dont-bring-buyers" },
    { label: "Anil's article: Why Use a Realtor to Sell Your Home", url: "https://www.anilsellsnj.com/blog/why-use-realtor-to-sell-your-home-2" },
    { label: "Anil's article: Why FSBO Sellers on Zillow Should Consider a Realtor", url: "https://www.anilsellsnj.com/blog/why-fsbo-sellers-on-zillow-should-consider-working-with-a-realtor" },
    { label: "Anil's article: Why Selling a Home by Owner Is Risky", url: "https://www.anilsellsnj.com/blog/why-selling-a-home-by-owner-is-risky" },
  ],
  products: [
    { label: "Books on selling your home", url: "https://www.amazon.com/s?tag=anilaggarwal-20&k=how+to+sell+your+home+book", note: "Read up before you list" },
    { label: "Home staging supplies", url: "https://www.amazon.com/s?tag=anilaggarwal-20&k=home+staging+decor", note: "Small touches that photograph well" },
    { label: "TurboTax — report your home sale", url: "https://www.kqzyfj.com/click-100712969-17206111", note: "Home-sale gains and exclusions at tax time" },
  ],
};
