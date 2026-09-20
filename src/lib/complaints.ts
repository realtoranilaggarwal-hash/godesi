/**
 * Consumer-help guides at /complaints: where a desi shopper, tenant, worker
 * or traveller files a complaint, and what to gather first. Plain text so
 * staff can edit it; every link is an official body, never a lawyer or a
 * paid "consumer advocate".
 */

export type Authority = {
  name: string;
  /** Who it covers and when to pick it over the others. */
  when: string;
  url: string;
};

export type ComplaintGuide = {
  slug: string;
  emoji: string;
  title: string;
  /** Search-friendly one-liner used as the meta description. */
  intro: string;
  /** The example that makes the page findable ("mould on mithai"). */
  example: string;
  /** What to do in the first hour, before anyone is called. */
  firstSteps: string[];
  evidence: string[];
  us: Authority[];
  canada: Authority[];
  /** Filled-in complaint the reader can copy and adapt. */
  template: string;
  faqs: { q: string; a: string }[];
};

export const EVERGREEN_EVIDENCE = [
  "Photos or a short video — include the shelf, price tag, label, lot/batch number and best-before date, not only the item.",
  "The receipt, card statement or transfer confirmation (screenshot is fine).",
  "Date, time and exact address of the store, office or property.",
  "Names or descriptions of the people you spoke to and what each said.",
  "Copies of every message — WhatsApp, email, text, DM. Do not delete threads.",
  "Keep the item if it is safe to (bag and refrigerate spoiled food); do not throw the packaging away.",
];

export const POST_RULES = [
  "Write only what you saw, bought or were told yourself. Hearsay and 'everyone knows' do not go in.",
  "Facts, dates and photos — not insults. 'Mould on the barfi tray on 12 Aug, staff said it was fresh' is useful; 'these people are crooks' is not and will be rejected.",
  "Name the business, not the employee. Never post a private person's phone, home address or family details.",
  "Anonymous hides your name from readers only. The GoDesi news desk keeps your name on record and will hand it over if a court orders it.",
  "If you may be in danger, call emergency services first. If you have lost money, file with the official body first and post on GoDesi second.",
];

export const COMPLAINT_GUIDES: ComplaintGuide[] = [
  {
    slug: "spoiled-food-grocery",
    emoji: "🍬",
    title: "Mouldy, expired or spoiled food at a grocery store or sweet shop",
    intro:
      "Found fungus on mithai, expired atta or spoiled paneer at a desi grocery? Step-by-step: what to photograph, who inspects food stores in the US and Canada, and how to file so an inspector actually visits.",
    example:
      "A tray of sweets in the display case has white or green fuzz; the counter staff say it is 'just sugar'. Packaged snacks are months past the best-before date. Meat or paneer smells off on the day of purchase.",
    firstSteps: [
      "Do not eat it. If you already have and feel unwell, see a doctor first — a diagnosis is also evidence.",
      "Photograph the item where it sits: display case, shelf, price tag, and the label with the lot number and dates.",
      "Ask calmly for the manager and for a refund. Note the name and what was said. Most stores will refund on the spot; that does not stop you filing.",
      "Keep the item in a sealed bag in the fridge for a few days in case the inspector asks for it.",
      "Check whether it is a packaged brand or made in-store. Packaged = the manufacturer and the federal agency; made in-store = your local health department.",
    ],
    evidence: [
      "Product name, brand, lot/batch code, best-before or packed-on date.",
      "Store name and full address; the aisle or counter.",
      "Receipt showing the purchase date.",
      "If anyone got sick: symptoms, when they started, and the doctor's note.",
    ],
    us: [
      {
        name: "Your county or city health department",
        when: "Inspects grocery stores, sweet shops and anything prepared on site. Search '<your county> health department food complaint' — most have an online form and inspect within days.",
        url: "https://www.usa.gov/state-health",
      },
      {
        name: "FDA — Report a problem",
        when: "Packaged foods, sweets, spices, dairy and imported goods. Use the Consumer Complaint Coordinator for your state, listed on this page.",
        url: "https://www.fda.gov/safety/report-problem-fda",
      },
      {
        name: "USDA FSIS",
        when: "Meat, poultry and egg products (halal or otherwise). Their hotline is 1-888-MPHotline.",
        url: "https://www.fsis.usda.gov/",
      },
      {
        name: "FDA MedWatch",
        when: "If a person was actually harmed — allergic reaction, poisoning, hospital visit.",
        url: "https://www.fda.gov/safety/medwatch-fda-safety-information-and-adverse-event-reporting-program",
      },
    ],
    canada: [
      {
        name: "Your local public health unit",
        when: "Inspects stores and restaurants. Search '<your city> public health food complaint'; Ontario, BC and Alberta all have online forms.",
        url: "https://www.canada.ca/en/public-health.html",
      },
      {
        name: "Canadian Food Inspection Agency (CFIA)",
        when: "Packaged, imported or labelled foods, allergen mistakes and recalls. Use 'Report a food safety or labelling concern' on their site.",
        url: "https://inspection.canada.ca/en",
      },
    ],
    template: `Subject: Food safety complaint — [store name], [address]

On [date] at about [time] I bought [item, brand, lot number, best-before date] at [store name, full address]. [Describe exactly what was wrong: visible mould on the display tray / product X months past its best-before date / smell and appearance on opening.]

I spoke to [name or description] who said [what they said]. [I was / was not] given a refund.

I have photos of the item, the display and the label, plus the receipt, and I have kept the item refrigerated. Nobody in my household [has / has] fallen ill; [details if so].

I am asking that the store be inspected. I can be reached at [phone / email].

[Your name]`,
    faqs: [
      {
        q: "The store gave me a refund. Should I still complain?",
        a: "Yes if it was a safety issue (mould, spoilage, past date on the shelf). A refund fixes your purchase; an inspection fixes the shelf for the next customer.",
      },
      {
        q: "Will the store know it was me?",
        a: "Health departments do not normally share the complainant's name with the business. On GoDesi you can post anonymously — your name stays with the news desk only.",
      },
      {
        q: "Is it a big deal if it is just a little fungus on one piece?",
        a: "Mould on one piece in a shared tray usually means the tray, and the case temperature, are the problem. Report it; the inspector decides how serious.",
      },
    ],
  },
  {
    slug: "restaurant-hygiene",
    emoji: "🍛",
    title: "Dirty kitchen, food poisoning or bad hygiene at a restaurant",
    intro:
      "Got sick after a buffet, saw a filthy kitchen or found something in your food? How to report a restaurant to the health inspector in the US and Canada, and what to keep.",
    example:
      "Three people from the same table fell ill the next day. Cooked and raw meat shared the same counter. Cockroaches near the tandoor. A leftover box smelled sour on the same evening.",
    firstSteps: [
      "If anyone is seriously ill (dehydration, blood, fever over 102°F/39°C), get medical care first and tell the doctor what and where you ate.",
      "Write down everything eaten in the 72 hours before symptoms — the inspector will ask, and it is often not the last meal.",
      "Keep leftovers sealed in the fridge; a lab can test them.",
      "Photograph what you saw, without confronting staff or filming other customers.",
    ],
    evidence: [
      "Receipt or card charge with date and time.",
      "Names of everyone who ate and who got sick, with symptom start times.",
      "Photos of the dish, packaging or the conditions you saw.",
      "Doctor's note or test result if there is one.",
    ],
    us: [
      {
        name: "County or city health department",
        when: "The body that inspects restaurants and investigates food poisoning. Search '<your county> restaurant complaint'. Two or more people sick from one meal is treated as a possible outbreak.",
        url: "https://www.usa.gov/state-health",
      },
      {
        name: "FDA — Report a problem",
        when: "If the problem was a packaged ingredient or drink rather than the kitchen.",
        url: "https://www.fda.gov/safety/report-problem-fda",
      },
    ],
    canada: [
      {
        name: "Your local public health unit",
        when: "Inspects restaurants, food trucks and catered events. Toronto's DineSafe, Peel, York, Fraser Health and Alberta Health Services all take online complaints.",
        url: "https://www.canada.ca/en/public-health.html",
      },
    ],
    template: `Subject: Restaurant complaint — [restaurant name], [address]

On [date] at [time] I ate at [restaurant, address]. We ordered [dishes]. [Describe: what you saw in the kitchen or dining area / who became ill, with symptom start times and what they ate].

[Number] of the [number] people at our table became ill on [date]. [Doctor seen: yes/no, diagnosis if any.]

I have the receipt, photos and the leftovers sealed in the fridge. Please inspect the premises. Contact me at [phone / email].

[Your name]`,
    faqs: [
      {
        q: "How do I know it was that restaurant?",
        a: "You often cannot be sure — that is the inspector's job. Report what you know honestly, including everything else you ate. Say 'may have' on GoDesi, not 'gave us'.",
      },
      {
        q: "Can I post the restaurant's name on GoDesi?",
        a: "Yes, with what you personally saw or experienced, dates and photos. Not with a diagnosis you do not have or a claim that others were also sick unless you know them.",
      },
    ],
  },
  {
    slug: "remittance-money-transfer",
    emoji: "💸",
    title: "Money transfer, remittance or hundi problems",
    intro:
      "Sent money home and it never arrived, hidden fees, an agent who took cash and disappeared, or a bank that will not help? Who regulates remittance in the US and Canada and how to get a case number.",
    example:
      "A local agent took $2,000 in cash 'for a better rate' and now will not pick up the phone. A licensed transfer app froze the money for weeks. The receiver got far less than quoted.",
    firstSteps: [
      "Write to the company (not just the agent) in writing and keep the reply. Regulators ask whether you complained to them first.",
      "If you paid by card or bank transfer, call your bank the same day and ask about a dispute or recall.",
      "If cash was taken and the person has vanished, file a police report — you will need the number for everything else.",
      "Do not send more money to 'release' the first amount. That is the scam continuing.",
    ],
    evidence: [
      "Transfer reference number, amount, rate quoted, fees shown.",
      "Screenshots of the app, the agent's messages and any receipts.",
      "The agent's or shop's name, licence number if displayed, address.",
      "Bank or card statement lines.",
    ],
    us: [
      {
        name: "CFPB — Submit a complaint",
        when: "Any licensed money transfer company, bank or app. Companies must respond, usually within 15 days; the CFPB tracks it.",
        url: "https://www.consumerfinance.gov/complaint/",
      },
      {
        name: "FTC — ReportFraud",
        when: "An unlicensed agent, a fake app or an outright scam.",
        url: "https://reportfraud.ftc.gov/",
      },
      {
        name: "FBI IC3",
        when: "Online or phone-based fraud, especially over $1,000 or across borders.",
        url: "https://www.ic3.gov/",
      },
      {
        name: "Your state attorney general",
        when: "State money-transmitter licences and local shops; also for a pattern of complaints against one agent.",
        url: "https://www.usa.gov/state-attorney-general",
      },
    ],
    canada: [
      {
        name: "Canadian Anti-Fraud Centre",
        when: "Any scam or fraud, whether or not money was lost. Also call your local police non-emergency line.",
        url: "https://antifraudcentre-centreantifraude.ca/report-signalez-eng.htm",
      },
      {
        name: "Financial Consumer Agency of Canada",
        when: "Banks and federally regulated financial companies that will not resolve a complaint.",
        url: "https://www.canada.ca/en/financial-consumer-agency.html",
      },
    ],
    template: `Subject: Complaint — transfer [reference number] not delivered / misquoted

On [date] I sent [amount] from [city] to [country] through [company / agent name, address]. I was quoted [rate and fees]. [Describe: the money has not arrived / the receiver got X less / the agent has stopped responding since date.]

I contacted [company] on [date] by [method] and [their reply / no reply]. Police report number (if any): [number].

Attached: transfer receipt, screenshots of messages and the app, bank statement. I am asking for [refund of amount / release of funds / investigation of the agent].

[Your name, phone, email]`,
    faqs: [
      {
        q: "The agent is from my community and I do not want trouble for him.",
        a: "File anyway. Regulators contact the business, not your family. Posting anonymously on GoDesi also warns the next person without your name attached.",
      },
      {
        q: "Was hundi / hawala even legal?",
        a: "Informal transfers through an unlicensed person are illegal in both countries and you have little protection. Report it to the police and the anti-fraud body regardless; you are the victim, not the offender.",
      },
    ],
  },
  {
    slug: "travel-agent-visa-fraud",
    emoji: "✈️",
    title: "Travel agent, ticket or immigration consultant fraud",
    intro:
      "Paid for tickets that were never issued, a 'consultant' who promised a visa or green card, or a package that vanished? Where to report travel and immigration fraud in the US and Canada.",
    example:
      "An agent took full payment for four India tickets and sent fake PNRs. A 'notario' or 'immigration consultant' charged $5,000 for a work permit that was never filed. An OCI/passport service kept the documents.",
    firstSteps: [
      "Check the PNR directly on the airline's own website — not the agent's screenshot.",
      "If paid by credit card, dispute the charge with your card issuer immediately; there are time limits, often 60 days.",
      "Ask in writing for your documents and a refund; give a date. Keep the message.",
      "For immigration cases: check whether the person is actually a licensed lawyer or accredited representative. Non-lawyers cannot give immigration legal advice in the US; in Canada only RCIC consultants and lawyers can.",
    ],
    evidence: [
      "Every receipt, contract, itinerary and 'confirmation' you were given.",
      "Business name, address, licence numbers (IATA/ARC, seller-of-travel, RCIC, bar number).",
      "Messages and call logs.",
      "Card or bank statement lines.",
    ],
    us: [
      {
        name: "FTC — ReportFraud",
        when: "Travel and ticket scams, fake consultants.",
        url: "https://reportfraud.ftc.gov/",
      },
      {
        name: "USCIS — Report immigration scams",
        when: "Anyone unauthorised giving immigration advice or filing forms for money ('notario fraud').",
        url: "https://www.uscis.gov/",
      },
      {
        name: "Your state attorney general",
        when: "Seller-of-travel laws (California, Florida, Washington, Hawaii, Iowa) and consumer fraud generally.",
        url: "https://www.usa.gov/state-attorney-general",
      },
      {
        name: "Better Business Bureau",
        when: "Not a regulator, but a public complaint that agencies often respond to.",
        url: "https://www.bbb.org/file-a-complaint",
      },
    ],
    canada: [
      {
        name: "Canadian Anti-Fraud Centre",
        when: "Ticket, package and immigration scams.",
        url: "https://antifraudcentre-centreantifraude.ca/report-signalez-eng.htm",
      },
      {
        name: "IRCC — Report immigration fraud",
        when: "Unlicensed consultants and anyone promising a guaranteed visa.",
        url: "https://www.canada.ca/en/immigration-refugees-citizenship/services/protect-fraud.html",
      },
      {
        name: "Provincial travel regulator",
        when: "Ontario (TICO), BC (Consumer Protection BC) and Quebec (OPC) license travel agents and run compensation funds.",
        url: "https://www.ontario.ca/page/filing-consumer-complaint",
      },
    ],
    template: `Subject: Complaint — [agency / consultant name], payment of [amount] on [date]

On [date] I paid [amount] by [method] to [business name, address, person dealt with] for [tickets / package / immigration service]. I was promised [what, by when]. [Describe: tickets do not exist on the airline site / no application was filed / no response since date.]

I asked for a refund in writing on [date]; [outcome]. Card dispute filed: [yes/no]. Police report: [number if any].

Attached: receipt, contract, confirmations, messages. Requested: full refund of [amount] and return of my documents.

[Your name, phone, email]`,
    faqs: [
      {
        q: "The agent says the airline cancelled, not him.",
        a: "The airline will tell you whether a ticket was ever issued and whether a refund went back to the agent. Ask the airline in writing and attach the answer.",
      },
    ],
  },
  {
    slug: "landlord-rental",
    emoji: "🏠",
    title: "Landlord, basement rental and deposit disputes",
    intro:
      "Deposit not returned, no heat, illegal eviction, or a basement with no proper exit? How tenants file complaints in the US and Canada, including rooms rented by handshake.",
    example:
      "A landlord kept a $1,500 deposit for 'cleaning' with no receipts. Six students in a basement with one exit and no smoke alarm. Rent raised mid-lease by text. Locks changed while the tenant was at work.",
    firstSteps: [
      "Put every request to the landlord in writing (text is fine) and keep the thread.",
      "Photograph the unit on move-in and move-out, and any defect with the date visible.",
      "Do not stop paying rent as a protest unless a lawyer or tenant board tells you to — it hands the landlord an eviction case.",
      "If locked out or utilities cut deliberately, call the police non-emergency line the same day; it is illegal in almost every state and province.",
    ],
    evidence: [
      "Lease or, if none, every message that shows the terms and payments.",
      "Rent receipts, bank transfers, e-transfer records.",
      "Dated photos and videos of the condition and defects.",
      "Names of any other tenants who saw the same thing.",
    ],
    us: [
      {
        name: "Your city or county code enforcement / housing department",
        when: "Unsafe conditions, no heat, illegal basement units, overcrowding. Inspectors can order repairs.",
        url: "https://www.usa.gov/housing-complaints",
      },
      {
        name: "HUD — Fair housing complaint",
        when: "Refused, charged more or treated differently because of national origin, religion, family status or disability.",
        url: "https://www.hud.gov/program_offices/fair_housing_equal_opp/online-complaint",
      },
      {
        name: "Small claims court",
        when: "Deposit not returned — typically up to $5,000–$10,000 depending on state, no lawyer needed. Your state attorney general's site explains the deposit rules.",
        url: "https://www.usa.gov/state-attorney-general",
      },
    ],
    canada: [
      {
        name: "Provincial tenant board",
        when: "Deposits, repairs, rent increases and evictions. Ontario: Landlord and Tenant Board; BC: Residential Tenancy Branch; Alberta: RTDRS.",
        url: "https://tribunalsontario.ca/ltb/",
      },
      {
        name: "Municipal by-law / property standards",
        when: "Illegal basement apartments, fire safety, overcrowding, no heat.",
        url: "https://www.ontario.ca/page/filing-consumer-complaint",
      },
    ],
    template: `Subject: Tenant complaint — [address, unit]

I have rented [address, unit] from [landlord name, phone] since [date] at [rent] per month. [Describe the issue with dates: deposit of [amount] not returned since move-out on [date] / no heat since [date] / locks changed on [date].]

I raised this with the landlord on [dates] by [method]; [response]. 

Attached: lease or message thread, payment records, dated photos. I am asking for [return of deposit / repair order / inspection].

[Your name, phone, email]`,
    faqs: [
      {
        q: "I have no lease, only WhatsApp messages. Do I have rights?",
        a: "Yes. In both countries a verbal or message-based tenancy is still a tenancy. The messages and your payment records are the lease.",
      },
      {
        q: "My landlord is also my uncle's friend / from my village.",
        a: "The rules do not change. If you would rather not go public, use the board or inspector only; if you want to warn others, post anonymously on GoDesi with the facts.",
      },
    ],
  },
  {
    slug: "wages-employer",
    emoji: "🧑‍🍳",
    title: "Unpaid wages, cash jobs, tips and H-1B or work-permit abuse",
    intro:
      "Not paid for hours worked, tips taken, paid below minimum wage in cash, or an employer holding your passport or benching you unpaid on a visa? Where workers file in the US and Canada — status does not matter.",
    example:
      "A restaurant pays $9 cash for 60-hour weeks. A store owner keeps the tip jar. An IT consultancy benches an H-1B worker for two months without salary. A cleaning company never pays the last two weeks.",
    firstSteps: [
      "Keep your own record of every shift — start, end, breaks — in your phone. Photos of the schedule board count.",
      "Save pay stubs, cash envelopes with notes, texts about pay, and the job offer if there was one.",
      "Ask for the unpaid amount in writing once, with a date. You do not need to argue.",
      "Wage claims are open to everyone regardless of immigration status in both countries; agencies do not ask.",
    ],
    evidence: [
      "Your hours log, schedules, clock-in photos.",
      "Pay stubs, bank deposits, texts about pay and tips.",
      "Employer's legal name and address (check the receipt or the sign).",
      "Names of co-workers who saw the same, if they agree.",
    ],
    us: [
      {
        name: "US Department of Labor — Wage and Hour Division",
        when: "Minimum wage, overtime, tips, unpaid final pay. Also H-1B wage violations (benching, underpayment) via form WH-4.",
        url: "https://www.dol.gov/agencies/whd",
      },
      {
        name: "Your state labor department",
        when: "Often faster and covers state minimum wage, which is higher than federal in most states with large desi populations.",
        url: "https://www.usa.gov/labor-laws",
      },
      {
        name: "EEOC (via your state AG's site)",
        when: "Fired, harassed or paid less because of national origin, religion, caste or sex.",
        url: "https://www.usa.gov/state-attorney-general",
      },
    ],
    canada: [
      {
        name: "Provincial employment standards",
        when: "Most workers: Ontario Ministry of Labour (link), BC Employment Standards Branch, Alberta Employment Standards. Claims are free.",
        url: "https://www.ontario.ca/document/your-guide-employment-standards-act-0/filing-claim",
      },
      {
        name: "Federal Labour Program",
        when: "Banks, airlines, trucking and other federally regulated employers.",
        url: "https://www.canada.ca/en/services/jobs/workplace/federal-labour-standards.html",
      },
      {
        name: "IRCC — Report abuse of temporary workers",
        when: "Employer holding documents, threatening deportation, or not honouring an LMIA job offer. Open work permits for vulnerable workers exist.",
        url: "https://www.canada.ca/en/immigration-refugees-citizenship/services/protect-fraud.html",
      },
    ],
    template: `Subject: Wage claim — [employer legal name], [address]

I worked at [business, address] as a [role] from [start date] to [end date / present], [hours per week], paid [rate and method]. I am owed [amount] for [unpaid hours / overtime / tips / final pay] for the period [dates].

I asked [name] for payment on [date] by [method]; [response].

Attached: my hours log, pay records, schedules and messages. [Visa status details if relevant to the claim.]

[Your name, phone, email]`,
    faqs: [
      {
        q: "I was paid in cash with no papers. Can I still claim?",
        a: "Yes. Your own hours log, texts and bank deposits are accepted as evidence. Cash payment is the employer's problem, not yours.",
      },
      {
        q: "Will I be deported for complaining?",
        a: "Labour agencies in the US and Canada do not report claimants to immigration. Retaliation for a wage claim is itself illegal. If you are on an employer-tied visa, speak to an immigration lawyer or a workers' centre before filing.",
      },
    ],
  },
  {
    slug: "event-vendor-no-show",
    emoji: "🎪",
    title: "Wedding vendor, priest, DJ or event no-show and refund disputes",
    intro:
      "Caterer never turned up, decorator took a deposit and vanished, event cancelled without refund, tickets for a show that did not happen? How to get your money back in the US and Canada.",
    example:
      "A photographer took a $1,200 deposit and stopped replying a week before the wedding. A concert was 'postponed' twice and the promoter went silent. A banquet hall kept a $3,000 deposit after cancelling on its own.",
    firstSteps: [
      "Read the contract or message thread for the cancellation and deposit terms; photograph them.",
      "Send one clear written demand: what was agreed, what happened, the amount, and a date to pay by (7–14 days).",
      "If paid by credit card, open a dispute now — services not delivered is a standard reason and has a deadline.",
      "Ticketed shows: dispute with the ticketing platform first, then the card.",
    ],
    evidence: [
      "Contract, quote, invoice or the messages that formed the agreement.",
      "Proof of payment — card, Zelle, e-transfer, cheque image.",
      "Messages showing the no-show or cancellation and your attempts to reach them.",
      "Photos from the day, or the empty stage.",
    ],
    us: [
      {
        name: "Small claims court",
        when: "The usual route for deposits and no-shows; limits from $5,000 to $25,000 by state, no lawyer needed.",
        url: "https://www.usa.gov/consumer-complaints",
      },
      {
        name: "Your state attorney general",
        when: "A promoter or vendor with many victims, or ticket fraud.",
        url: "https://www.usa.gov/state-attorney-general",
      },
      {
        name: "FTC — ReportFraud",
        when: "Fake events and ticket scams.",
        url: "https://reportfraud.ftc.gov/",
      },
    ],
    canada: [
      {
        name: "Provincial consumer protection",
        when: "Ontario Consumer Protection Ontario, Consumer Protection BC, Service Alberta — deposits, cancellations and misleading advertising.",
        url: "https://www.ontario.ca/page/filing-consumer-complaint",
      },
      {
        name: "Small claims court",
        when: "Up to $35,000 in Ontario, $35,000 in BC, $100,000 in Alberta.",
        url: "https://www.ontario.ca/page/filing-consumer-complaint",
      },
      {
        name: "Canadian Anti-Fraud Centre",
        when: "Fake shows, ticket resale scams.",
        url: "https://antifraudcentre-centreantifraude.ca/report-signalez-eng.htm",
      },
    ],
    template: `Subject: Demand for refund — [service / event], [date of event]

On [date] I booked [vendor / promoter name, business, phone] for [service / event] on [event date] and paid [amount] by [method] (receipt attached). [Describe: did not appear / cancelled on date / event did not take place.]

Under our agreement [quote the term or 'no cancellation terms were given'], I am asking for a refund of [amount] by [date, 14 days]. If it is not received I will file with [small claims court / consumer protection] and my card issuer.

Attached: agreement, payment proof, message history.

[Your name, phone, email]`,
    faqs: [
      {
        q: "He is a well-known priest / DJ in the community. Will anyone believe me?",
        a: "Courts and consumer bodies go by the paper — the messages and the payment. On GoDesi, post the facts and dates; readers can mark the alert confirmed if they had the same experience.",
      },
    ],
  },
];

export function complaintGuide(slug: string) {
  return COMPLAINT_GUIDES.find((guide) => guide.slug === slug) ?? null;
}
