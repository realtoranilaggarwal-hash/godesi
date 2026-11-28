import type { Ebook } from "../types";

export const landlordHandbook: Ebook = {
  slug: "nj-landlord-handbook",
  title: "The New Jersey Landlord Handbook",
  subtitle: "Screening, leases, deposits, rent, repairs and eviction — the right way",
  audience: "Landlords",
  color: "#0f766e",
  pitch: "Everything a small New Jersey landlord needs to rent a home legally and profitably, from the first showing to the final deposit return.",
  bullets: ["Legal tenant screening under NJ's Fair Chance in Housing Act", "Security deposit rules that cost landlords double damages", "What to put in your lease (and what you can't)", "The NJ eviction process step by step"],
  related: [
    "what-homeowners-should-look-for-in-a-tenant-before-deciding-to-rent",
    "security-deposits-in-new-jersey-what-landlords-tenants-need-to-know",
    "heres-a-step-by-step-guide-for-eviction-laws-in-new-jersey-and-why-hiring-a-professional-real-estate-agent-like-anil-aggarwal-can-save-homeowners-from-future-problems",
    "legal-ways-for-landlords-to-report-bad-tenants",
    "what-to-do-if-your-tenant-has-dog-without-permission",
    "case-study-what-landlords-can-learn-from-a-difficult-tenant-experience",
  ],
  chapters: [
    {
      title: "1. Before you list: get the property and paperwork ready",
      body: [
        "Renting a home in New Jersey is a business, and the state treats it like one. Before your first showing, make sure the unit is safe, legal and documented. Many towns require a Certificate of Occupancy (CO) or a rental registration and inspection before each new tenant moves in. Call your municipal clerk or code office and ask exactly what is required for a rental in your town — the fees are small compared to the fines.",
        "New Jersey also requires a Certificate of Smoke Alarm, Carbon Monoxide Alarm and Portable Fire Extinguisher Compliance (CSACMAPFEC) when a dwelling changes occupants. Lead-safe inspections are now required for most pre-1978 rentals under the state lead law. Buildings with three or more units must be registered with the NJ Department of Community Affairs (DCA); one- and two-family homes that are not owner-occupied register with the municipal clerk.",
        "Take date-stamped photos and a short video of every room before move-in. This single habit wins more deposit disputes than any lease clause.",
      ],
      checklist: ["Town rental registration / CO inspection scheduled", "Smoke, CO alarm and extinguisher certificate", "Lead-safe certification if built before 1978", "Landlord registration (DCA or municipal clerk)", "Landlord insurance policy (not a homeowner policy)", "Move-in photos and video saved"],
    },
    {
      title: "2. Advertising and showings without fair-housing mistakes",
      body: [
        "Describe the property, not the person you want. Phrases like \"perfect for a young couple\", \"no kids\", \"professionals only\" or \"no Section 8\" are illegal in New Jersey. The NJ Law Against Discrimination protects many classes, including source of lawful income — you must consider applicants who pay part of their rent with a housing voucher on the same terms as everyone else.",
        "Use the same written criteria for every applicant: minimum income (commonly 2.5–3× monthly rent, counting voucher payments toward the rent), verifiable rental history and a credit check. Put the criteria in writing and give it to every applicant. Consistency is your best legal protection.",
        "List vacant units on VDO Rental so showing requests and applications land in one inbox, with each applicant's income-to-rent ratio calculated for you.",
      ],
    },
    {
      title: "3. Screening tenants legally",
      body: [
        "Screen for the things that predict a good tenancy: stable income, on-time rent history, and how they left previous homes. Call the previous two landlords, not just the current one — a current landlord who wants a problem tenant gone may give a glowing reference.",
        "New Jersey's Fair Chance in Housing Act (2022) limits criminal-history questions. You may not ask about criminal records in the application or before making a conditional offer, and even then only certain recent convictions may be considered, with an individualized assessment. Application fees and screening must be reasonable and applied equally.",
        "Verify income with pay stubs, an offer letter, tax returns or a voucher award letter. For self-employed applicants, ask for two years of tax returns or recent bank statements.",
      ],
      checklist: ["Written screening criteria handed to every applicant", "Credit report and eviction search with written consent", "Income verified (≥ 2.5–3× rent including voucher)", "Two prior landlord references called", "No criminal-history questions before a conditional offer"],
    },
    {
      title: "4. The lease: what to include",
      body: [
        "A good lease spells out rent, due date, grace period and late fee; the security deposit amount; who pays which utilities; maintenance responsibilities (snow removal, lawn, filters, smoke-detector batteries); pet rules; occupancy limits; entry notice; renewal and notice-to-quit terms; and parking. Attach the NJ DCA Truth in Renting statement and any required lead and flood-zone disclosures.",
        "New Jersey requires a grace period of at least five business days for senior citizens receiving Social Security or similar benefits before a late fee can be charged. Late fees must be reasonable, and many judges look closely at fees above 5% of rent. Rent increases must be reasonable and, in towns with rent control ordinances, follow the local rules.",
        "VDO Rental includes a New Jersey-aware lease template you can customize, send to the tenant, and have them e-sign. Always have a NJ attorney review your final lease.",
      ],
    },
    {
      title: "5. Security deposits: the rules that bite",
      body: [
        "The NJ Rent Security Deposit Act limits the deposit to 1.5 months' rent. Annual increases are capped at 10% of the current deposit. The deposit must be held in a New Jersey bank account in the tenant's name or a trust account, and within 30 days you must notify the tenant in writing of the bank name and address, account type, and interest rate. Interest must be paid or credited annually.",
        "Within 30 days after the tenant moves out, you must return the deposit plus interest, minus itemized deductions for unpaid rent or damage beyond normal wear and tear, by certified or registered mail. Miss these steps and a court can award the tenant double the amount wrongfully withheld, plus attorney's fees.",
      ],
      checklist: ["Deposit ≤ 1.5 months' rent", "Held in NJ bank account; notice sent within 30 days", "Interest paid or credited yearly", "Itemized return within 30 days of move-out by certified mail"],
    },
    {
      title: "6. Collecting rent and keeping records",
      body: [
        "Rent is easiest to collect when it is automatic and documented. Send a clear invoice every month, give tenants one or two ways to pay (Zelle, ACH or check), and record every payment the day it arrives. Give receipts for cash — New Jersey requires a receipt when rent is paid in cash.",
        "VDO Rental creates each month's rent invoice automatically, applies your late fee after the grace period, emails reminders, and lets tenants report payments for you to confirm. At tax time, export a CSV of income and expenses for your accountant.",
      ],
    },
    {
      title: "7. Repairs, habitability and entry",
      body: [
        "Every New Jersey lease includes an implied warranty of habitability: heat, hot water, safe electrical and plumbing, a weather-tight structure and freedom from pests. From October 1 to May 1, heat must be supplied to keep units at state minimum temperatures (68°F from 6 a.m. to 11 p.m.). If you ignore serious repairs, tenants may legally repair and deduct or withhold rent in some cases.",
        "Give reasonable notice (24 hours is the common standard, and many town codes require it) before entering, except in emergencies. Log every repair request, who was assigned, and when it was fixed. That record protects you if a habitability claim ever reaches court.",
      ],
    },
    {
      title: "8. Problem tenants: pets, late rent and lease violations",
      body: [
        "Start with a calm written notice that cites the lease clause and gives a reasonable deadline to fix the problem. For an unauthorized pet, offer a path to compliance: a signed pet addendum, proof of renter's insurance with liability coverage, and a reasonable pet fee — remembering that the total deposit still cannot exceed 1.5 months' rent, and that assistance animals for a disability are not \"pets\".",
        "Document everything: dates, photos, copies of notices and texts. Never change the locks, remove belongings, or shut off utilities to force a tenant out — self-help eviction is illegal in New Jersey and can expose you to criminal and civil penalties.",
        "You may report unpaid balances to credit bureaus through a properly registered reporting service, and leave honest, factual references — but avoid defamatory statements.",
      ],
    },
    {
      title: "9. Eviction in New Jersey, step by step",
      body: [
        "The NJ Anti-Eviction Act allows removal only for specific \"good causes\" such as non-payment of rent, disorderly conduct, willful damage, repeated late payment, or substantial lease violations. Owner-occupied buildings with two or fewer units are an exception for some causes.",
        "Most causes (other than non-payment) require a written Notice to Cease, then a Notice to Quit, served properly before you can file in the Landlord/Tenant section of the Special Civil Part of Superior Court. For non-payment, you can file a complaint directly. Courts schedule a hearing, often with mandatory settlement conferences. If you win and the tenant does not leave, the court issues a Warrant of Removal served by a court officer — the tenant gets a few business days after service before lock-out.",
        "Evictions take time and money. Careful screening, clear leases and consistent records prevent most of them. When you do need one, hire a NJ landlord-tenant attorney.",
      ],
      checklist: ["Good cause identified under the Anti-Eviction Act", "Notice to Cease / Notice to Quit served (if required)", "Complaint filed in Special Civil Part", "Attend hearing with lease, ledger, notices and photos", "Warrant of Removal executed only by a court officer"],
    },
    {
      title: "10. Move-out and deposit return",
      body: [
        "Schedule a move-out walk-through, compare against your move-in photos, and separate normal wear and tear (faded paint, light carpet wear, small nail holes) from damage (holes in walls, broken fixtures, pet stains). Keep repair invoices and photos. Send the itemized deposit letter and refund within 30 days by certified mail.",
        "Then repeat: re-key the locks, refresh the unit, update the listing, and start the next tenancy with the same documented process.",
      ],
    },
  ],
};
