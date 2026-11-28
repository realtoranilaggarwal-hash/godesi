import type { Ebook } from "../types";

export const squatterGuide: Ebook = {
  slug: "protect-your-property-from-squatters",
  title: "Protect Your Property from Squatters",
  subtitle: "A New Jersey owner's guide to keeping vacant homes, rentals and Airbnbs safe — and what to do if someone moves in",
  audience: "Owners, landlords & hosts",
  color: "#c2410c",
  pitch: "In New Jersey, removing someone who moved in without permission can take months in court. Prevention is far cheaper than removal.",
  bullets: ["Why vacant and between-tenant homes are targets", "A 15-minute weekly vacant-home routine", "Screening, written leases and short-term-rental rules that keep squatters out", "Step by step: police, ejectment or eviction, and the writ of possession"],
  related: ["title-how-to-safeguard-your-new-jersey-home-when-renting-or-listing-on-airbnb", "essential-safety-precautions-for-new-jersey-homeowners-before-renting-out-properties", "case-study-what-landlords-can-learn-from-a-difficult-tenant-experience", "legal-ways-for-landlords-to-report-bad-tenants"],
  chapters: [
    {
      title: "1. What a squatter is — and why it matters in New Jersey",
      body: [
        "A squatter is a person who occupies a home without the owner's permission and without a lease. It is different from a tenant who stops paying rent: a tenant once had permission, a squatter never did. That difference decides which court process you use.",
        "Many states have passed laws since 2024 that make squatting a crime and let police remove squatters quickly. New Jersey bill S725 (\"housebreaking\", \"unlawful occupancy\" and \"unlawful reentry\") was introduced in January 2024 but did not pass that session. In New Jersey, removing an occupant is still mostly a civil court matter, so prevention is your best protection.",
        "New Jersey's Anti-Eviction Act is one of the strongest tenant-protection laws in the country. If the person can show any sign of being a tenant — a text saying they can stay, rent paid by Zelle, a lease from a fake \"owner\" — the court may treat the case as a landlord-tenant matter, and that takes longer.",
      ],
    },
    {
      title: "2. Why some homes become targets",
      body: [
        "Squatters look for homes that look empty: overgrown lawns, piled-up mail, no lights at night, estate or probate homes, homes between tenants, and homes listed for rent on Facebook or Craigslist where scammers copy the photos.",
        "A common scheme: a scammer copies your rental listing, \"rents\" your home to a victim for a cash deposit, and gives them a fake lease and keys. The victim truly believes they are a tenant. That is exactly the situation that is hardest to unwind quickly.",
      ],
      checklist: ["Lawn mowed and snow cleared", "Mail and packages picked up or forwarded", "Lights on timers; a car in the driveway sometimes", "Neighbors have your phone number", "Search Facebook/Craigslist for copies of your listing photos"],
    },
    {
      title: "3. Prevention: secure the home",
      body: [
        "Change or re-key every lock after each tenant, contractor or open house. Smart locks show who entered and when, and you can turn off a code in seconds.",
        "A video doorbell and a few outdoor cameras with phone alerts let you see activity the day it happens. Post \"No Trespassing\" signs on vacant property and register the vacancy with your town if it requires that.",
        "Visit at least weekly, or hire a property manager or a trusted neighbor. Take dated photos of every room each visit; they become evidence that the home was empty and in your control.",
      ],
      checklist: ["Re-key after every turnover", "Smart lock with activity log", "Video doorbell + outdoor cameras", "No Trespassing signs on vacant property", "Weekly visit with dated photos", "Utilities in your name; tell the utility company not to transfer service without your written approval"],
    },
    {
      title: "4. Prevention: rentals and Airbnb",
      body: [
        "Screen every adult: credit, eviction history, income and identity. Meet in person, check the photo ID against the person, and never accept cash deposits from someone you have not verified. RentRedi, VDO Rental's tenant tools and similar services make screening simple.",
        "Use a written, signed lease for every tenant — even family. For short-term rentals, keep stays under 30 days, use the platform's messaging and payment only, and never extend a stay off the platform for cash.",
        "Show your homes yourself or through a licensed agent. Never mail or leave keys in a lockbox for a stranger to \"self-tour\" a home that is not listed in the MLS with a licensed brokerage.",
      ],
      checklist: ["Credit + eviction + ID check for every adult", "Written lease, signed by both sides", "Deposits only by traceable payment after verification", "Short-term stays under 30 days, on-platform only", "Showings in person by you or a licensed agent"],
    },
    {
      title: "5. If someone has moved in",
      body: [
        "Stay calm and do not use \"self-help\". In New Jersey you may not change the locks, remove belongings, or shut off utilities to force someone out (N.J.S.A. 2A:39-1). Doing so can expose you to penalties and give the occupant a stronger case.",
        "Call the local police non-emergency line right away and ask them to come out. If the person cannot show a lease or any permission and the entry is recent, police may treat it as trespassing. Bring your deed, ID, utility bills and dated photos.",
        "If police will not act, talk to a New Jersey real estate attorney the same week. If the person never had permission, the New Jersey courts offer an \"Order for Possession / Writ of Possession\" process in the Special Civil Part for removing someone who is not a tenant. If they ever were a tenant, you must file a landlord-tenant eviction. After you win, the county sheriff or a court officer carries out the removal.",
      ],
      checklist: ["Do NOT change locks or shut off utilities", "Call police; ask for a report number", "Gather deed, ID, utility bills, dated photos", "Call a NJ real estate attorney", "File the correct case (writ of possession or eviction)", "After removal: re-key, secure, inspect"],
    },
    {
      title: "6. How a Realtor and a property manager help",
      body: [
        "A licensed Realtor lists your home in the MLS with verified showings, so scammers cannot easily copy and \"rent\" it. A property manager visits, screens, and spots problems early. If you own a vacant or inherited home, selling or renting it quickly with professional help is often the best protection of all.",
        "Anil Aggarwal, Broker Manager & Realtor® with Vylla Home, helps New Jersey owners rent, manage and sell. Brokerage services are provided only through Vylla Home under a signed agreement.",
      ],
    },
  ],
  sources: [
    { label: "NJ Courts: How to apply for a Writ of Possession (non-tenant occupant)", url: "https://www.njcourts.gov/sites/default/files/forms/11947_apply_writ_possess.pdf" },
    { label: "NJ Legislature: Bill S725 (2024) – unlawful occupancy of dwellings", url: "https://pub.njleg.state.nj.us/Bills/2024/S1000/725_I1.HTM" },
    { label: "N.J.S.A. 2A:39-1 – unlawful entry and self-help", url: "https://law.justia.com/codes/new-jersey/title-2a/section-2a-39-1/" },
    { label: "Anil's article: How to Safeguard Your NJ Home When Renting or Listing on Airbnb", url: "https://www.anilsellsnj.com/blog/title-how-to-safeguard-your-new-jersey-home-when-renting-or-listing-on-airbnb" },
    { label: "Anil's article: Why Selling Your Equity-Rich Property Beats the Hassles of Renting", url: "https://www.anilsellsnj.com/blog/why-selling-your-equity-rich-property-is-a-smart-move-avoid-the-hassles-of-renting" },
  ],
  products: [
    { label: "Smart locks with activity log", url: "https://www.amazon.com/s?tag=anilaggarwal-20&k=smart+lock+keypad+app", note: "Change codes after every tenant or contractor" },
    { label: "Video doorbells & outdoor security cameras", url: "https://www.amazon.com/s?tag=anilaggarwal-20&k=outdoor+security+camera+wifi", note: "Phone alerts when someone is at the property" },
    { label: "No Trespassing signs", url: "https://www.amazon.com/s?tag=anilaggarwal-20&k=no+trespassing+sign+metal", note: "Post on vacant homes and lots" },
    { label: "Light timers", url: "https://www.amazon.com/s?tag=anilaggarwal-20&k=indoor+light+timer", note: "Make a vacant home look lived-in" },
    { label: "RentRedi — rent collection & tenant screening", url: "https://imp.i325350.net/raBOd5", note: "Screen every adult before handing over keys" },
  ],
};
