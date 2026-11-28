import type { Ebook } from "../types";

export const rentersGuide: Ebook = {
  slug: "renters-guide-rent-vs-buy",
  title: "The Renter's Guide: Rent Smart, Then Own",
  subtitle: "Your rights as a NJ tenant, and a step-by-step plan to go from renting to owning",
  audience: "Renters",
  color: "#7c3aed",
  pitch: "Know your rights while you rent, and see exactly when buying beats renting — with real New Jersey numbers.",
  bullets: ["Your security-deposit and repair rights in NJ", "A 15-year rent vs. buy comparison", "How much home you can afford", "Down-payment help and first-time buyer programs"],
  related: ["rent-vs-buy-analysis", "buying-vs-renting-a-15-year-comparative-analysis", "why-you-may-want-to-buy-a-house-vs-renting", "planning-to-build-wealth-then-think-of-home-and-replace-rent-with-equity", "security-deposits-in-new-jersey-what-landlords-tenants-need-to-know", "dealing-with-secondhand-smoke-from-neighbors-in-new-jersey-know-your-rights-and-actions"],
  chapters: [
    {
      title: "1. Finding a rental and applying",
      body: [
        "Decide your budget first: most landlords want gross income of about 2.5–3× the monthly rent. Gather pay stubs, an ID, two landlord references and your credit report before you tour, so you can apply the same day for a good home.",
        "In New Jersey, a landlord cannot refuse you because you use a housing voucher or other lawful income, cannot ask about criminal history before a conditional offer, and cannot advertise preferences about family status, religion, national origin or other protected classes.",
      ],
      checklist: ["Budget: rent ≤ ⅓ of gross monthly income", "Pay stubs / offer letter ready", "Photo ID and references", "Credit report checked for errors"],
    },
    {
      title: "2. Your lease and security deposit",
      body: [
        "Read the whole lease. Look for rent, due date, grace period and late fee; who pays utilities; who handles snow and lawn; pet rules; and how much notice is required to leave or renew. You should receive the NJ Truth in Renting statement.",
        "Your deposit can be at most 1.5 months' rent. Within 30 days the landlord must tell you, in writing, which bank holds it and the interest rate. When you move out, the landlord has 30 days to return it with interest, minus itemized damage beyond normal wear and tear. Take photos and video at move-in and move-out.",
      ],
    },
    {
      title: "3. Repairs and habitability",
      body: [
        "Your home must be habitable: heat (68°F daytime from October 1 to May 1), hot water, safe wiring and plumbing, no serious leaks or pests. Report problems in writing (text, email or your tenant portal) and keep copies. If serious problems are ignored, contact your town's code enforcement office; a lawyer or Legal Services of New Jersey can advise on rent withholding — never just stop paying without advice.",
        "Your landlord can't lock you out, remove your belongings or shut off utilities. Only a court officer with a Warrant of Removal can make you leave.",
      ],
    },
    {
      title: "4. Rent vs. buy: the real math",
      body: [
        "Rent buys you a place to live this month. A mortgage payment buys the same thing plus a growing share of an asset. Over 15 years, a renter paying $2,500/month with 3% yearly increases pays roughly $558,000 in rent and owns nothing. A buyer of a $450,000 home with 5% down pays principal, interest, taxes and insurance — and typically builds substantial equity through principal paydown plus appreciation (historically about 4–5% a year in many NJ markets, though never guaranteed).",
        "Buying is not always better: if you may move within 2–3 years, have unstable income, or have no emergency savings, renting may be wiser. The break-even point for buying is usually 3–5 years after closing costs.",
      ],
    },
    {
      title: "5. How much home can you afford?",
      body: [
        "Lenders look at your debt-to-income ratio (DTI). A common target is total monthly debts (including the new mortgage, taxes and insurance) at or below 43–45% of gross income. Credit scores of 620+ open most conventional loans; FHA loans can work at 580+ with 3.5% down.",
        "Get pre-approved — not just pre-qualified — before you shop. It tells you the real budget and makes sellers take your offer seriously.",
      ],
      checklist: ["Check credit score and fix errors", "Pay down high-interest cards", "Save for down payment + closing costs (≈ 2–5%)", "Keep 3 months of expenses as reserves", "Get a written pre-approval"],
    },
    {
      title: "6. Down-payment help in New Jersey",
      body: [
        "The NJ Housing and Mortgage Finance Agency (NJHMFA) offers first-time buyer mortgages and down-payment assistance for eligible buyers. FHA (3.5% down), conventional 3%-down programs, VA (0% down for veterans) and USDA (0% down in eligible areas) are also options. Some employers and towns offer grants.",
        "A Realtor and a loan officer who work with first-time buyers can match you to the right program.",
      ],
    },
    {
      title: "7. Your 12-month plan from renter to owner",
      body: [
        "Months 1–3: check credit, set a budget, start automatic savings. Months 4–6: pay down debt, avoid new credit, talk to a lender. Months 7–9: get pre-approved, learn neighborhoods, review programs. Months 10–12: tour homes with a Realtor, make an offer, inspect, close — and give your landlord notice as your lease requires.",
        "Bonus: consider a 2–4 family home. Living in one unit and renting the others (\"house hacking\") can let tenants pay a large part of your mortgage.",
      ],
    },
  ],
};
