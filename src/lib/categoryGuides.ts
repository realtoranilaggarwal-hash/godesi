/**
 * Short buyer guides shown on category pages. Keyed by top-level category slug;
 * subcategories inherit their parent's guide.
 */
export type CategoryGuide = {
  intro: string;
  checklist: string[];
  askVendors: string[];
};

export const CATEGORY_GUIDES: Record<string, CategoryGuide> = {
  "home-services": {
    intro:
      "Home jobs go wrong on scope and timing, not price. Get the work written down before anyone starts.",
    checklist: [
      "Ask for a written quote covering labour, material and clean-up",
      "Check licence/insurance for electrical, plumbing and gas work",
      "Agree a start and finish date, and hold a part of the payment until you inspect",
    ],
    askVendors: [
      "What is not included in this quote?",
      "Who pays if a part fails within a month?",
      "Will the same person do the job, or a subcontractor?",
    ],
  },
  education: {
    intro:
      "For tutors and classes, a trial session tells you more than any brochure. Match the teacher to the child, not the brand.",
    checklist: [
      "Ask for one paid trial class before committing to a term",
      "Confirm batch size, syllabus and how progress is reported",
      "Check make-up policy for missed classes",
    ],
    askVendors: [
      "How many students per batch?",
      "Which board/curriculum do you follow?",
      "Can I speak to a current parent?",
    ],
  },
  "business-services": {
    intro:
      "Accountants, lawyers and agencies bill very differently. Fix the deliverable and the fee basis up front.",
    checklist: [
      "Get an engagement letter listing deliverables and turnaround",
      "Clarify hourly vs fixed vs retainer, and what triggers extra fees",
      "Confirm who is your day-to-day contact",
    ],
    askVendors: [
      "Have you handled cases/filings like mine before?",
      "What do you need from me, and by when?",
      "What does this cost if it drags on?",
    ],
  },
  "real-estate": {
    intro:
      "Agents earn their fee on pricing and paperwork. Check recent local deals, not just listings.",
    checklist: [
      "Ask for three comparable sales/rentals closed in the last six months",
      "Confirm commission, who pays it and when",
      "Never pay a deposit before seeing title/lease documents",
    ],
    askVendors: [
      "What price would you list at, and why?",
      "How many of your deals were in this neighbourhood?",
      "Which documents will you verify for me?",
    ],
  },
  "rooms-roommates": {
    intro:
      "Rooms move fast, so scams do too. Visit (or video-call) before any money changes hands.",
    checklist: [
      "See the actual room on a live video call at minimum",
      "Get rent, deposit, notice period and bills in writing",
      "Never pay a deposit by gift card or crypto",
    ],
    askVendors: [
      "Who else lives here, and what are the house rules?",
      "What is included in rent — utilities, internet, parking?",
      "When is the deposit returned?",
    ],
  },
  "beauty-lifestyle": {
    intro:
      "Look at recent work, not the portfolio's greatest hits — especially for bridal makeup and hair.",
    checklist: [
      "Ask for photos from the last month, unfiltered",
      "Book a trial for bridal or colour work",
      "Confirm which products/brands are used if you have allergies",
    ],
    askVendors: [
      "Can I see work on skin/hair like mine?",
      "How long will the appointment take?",
      "What is the cancellation policy?",
    ],
  },
  "events-wedding": {
    intro:
      "Wedding vendors book out a year ahead. Lock the date, the deliverables and the person attending.",
    checklist: [
      "Confirm the named photographer/artist who will attend, not just the studio",
      "Get a written package: hours, deliverables, delivery date, overtime rate",
      "Pay in stages and keep receipts",
    ],
    askVendors: [
      "Is my date confirmed and blocked?",
      "How many events do you take that weekend?",
      "What happens if you fall ill — who is the backup?",
    ],
  },
  "food-catering": {
    intro:
      "Taste first. For catering, quantity per head and serving staff matter as much as the menu.",
    checklist: [
      "Ask for a tasting before a large order",
      "Confirm per-plate quantity, staff count and equipment",
      "Check hygiene/food licence and allergen handling",
    ],
    askVendors: [
      "What is the price per plate at my guest count?",
      "Can you do Jain/vegan/no-onion-garlic options?",
      "What time do you arrive and clear up?",
    ],
  },
  travel: {
    intro:
      "For flights, visas and tours, ask what happens when plans change — that is where costs hide.",
    checklist: [
      "Get the full fare breakdown including taxes and baggage",
      "Confirm cancellation and date-change charges in writing",
      "Pay the airline/hotel directly where you can",
    ],
    askVendors: [
      "What is the change fee if I move by a week?",
      "Is this refundable, and how long do refunds take?",
      "Who do I call if something goes wrong mid-trip?",
    ],
  },
  "religious-services": {
    intro:
      "Pandits, katha groups and samagri suppliers vary by tradition. Confirm the vidhi and language first.",
    checklist: [
      "Confirm the ritual, language and duration",
      "Ask what samagri you must arrange versus what they bring",
      "Agree dakshina/fee before the date",
    ],
    askVendors: [
      "Which sampradaya/tradition do you follow?",
      "How long will the ceremony take?",
      "What should we arrange at home beforehand?",
    ],
  },
  jobs: {
    intro:
      "Genuine employers and consultants never charge candidates for placement. Verify before sharing documents.",
    checklist: [
      "Never pay a fee to get a job",
      "Verify the company exists independently before an interview",
      "Get the offer, salary and role in writing",
    ],
    askVendors: [
      "Who is the employer, and is this a direct or contract role?",
      "What is the salary range?",
      "What does the interview process look like?",
    ],
  },
  professionals: {
    intro:
      "Real estate agents, attorneys, CPAs and advisors are licensed — check the licence, then check the fit.",
    checklist: [
      "Verify the licence/registration number with the state body",
      "Ask how they are paid: fee, commission or percentage of assets",
      "Confirm they handle your specific matter regularly",
    ],
    askVendors: [
      "What is your licence number?",
      "How are you compensated?",
      "How many clients like me do you serve?",
    ],
  },
  "buy-sell": {
    intro:
      "Meet in public, inspect in person, and pay only once you have the item.",
    checklist: [
      "Inspect and test before paying",
      "Meet in a public place in daylight",
      "For vehicles and electronics, check ownership papers/IMEI",
    ],
    askVendors: [
      "Why are you selling, and how old is it?",
      "Is there a bill or warranty left?",
      "Can I test it before paying?",
    ],
  },
};

export function guideFor(slug: string) {
  return CATEGORY_GUIDES[slug] ?? null;
}
