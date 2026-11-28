import type { Ebook } from "../types";

export const investorPlaybook: Ebook = {
  slug: "rental-property-investor-playbook",
  title: "The Rental Property Investor Playbook",
  subtitle: "Multi-family, house hacking, DSCR and BRRRR, LLCs and taxes",
  audience: "Investors",
  color: "#b45309",
  pitch: "How everyday New Jersey investors buy their first rental and keep adding doors — with real case-study numbers.",
  bullets: ["Analyze a deal in 10 minutes: cap rate, cash-on-cash, DSCR", "House hacking a 2–4 family home", "BRRRR + DSCR loans to recycle your cash", "LLC vs. personal ownership"],
  related: ["a-comprehensive-guide-to-investing-in-multi-family-homes", "buying-a-multifamily-home-benefits-cautions-must-know-steps", "i-did-house-hacking-by-chance-and-built-many-homes-doing-it-so-now-i-became-realtor-and-help-my-clients", "how-anil-agarwal-combined-brrrr-and-dscr-to-build-a-zero-down-cash-flowing-asset", "why-smart-buyers-are-using-dscr-loans-to-build-wealth-and-why-interest-rates-matter-more-than-price", "what-is-best-structure-if-buying-multiple-rental-investment-every-year-llc-or-jointly-owned-spouse", "how-to-build-multiple-assets-by-starting-with-just-one-property"],
  chapters: [
    {
      title: "1. Why rentals build wealth",
      body: [
        "A rental pays you four ways: monthly cash flow, mortgage principal paid down by your tenants, appreciation, and tax benefits such as depreciation. Even a property with modest cash flow can build six-figure equity over 5–10 years when all four are counted.",
        "The key is buying right: the profit is made when you buy, through price, financing and the plan for the property.",
      ],
    },
    {
      title: "2. Analyze any deal in 10 minutes",
      body: [
        "Start with realistic rent (compare 3–5 similar rentals). Subtract vacancy (5–8%), property taxes, insurance, repairs and capital reserves (8–10% of rent combined), management (8–10% if you hire it), and any utilities you pay. That gives Net Operating Income (NOI).",
        "Cap rate = NOI ÷ price. Cash-on-cash return = annual cash flow after the mortgage ÷ total cash invested. DSCR (debt service coverage ratio) = NOI ÷ annual mortgage payments — lenders usually want 1.0–1.25 or higher.",
      ],
      checklist: ["Market rent from 3–5 comparables", "Taxes from the town's tax records", "Insurance quote (landlord policy)", "Repairs + capex reserve 8–10%", "Vacancy 5–8%", "DSCR ≥ 1.2 for comfort"],
    },
    {
      title: "3. House hacking: the easiest first rental",
      body: [
        "Buy a 2–4 family home, live in one unit and rent the others. Because you live there, you can use owner-occupant loans: FHA with 3.5% down on up to 4 units, or conventional loans with as little as 5% down on 2–4 units. Lenders typically count about 75% of the projected rent from the other units toward your income.",
        "After a year you can move out, keep the property as a full rental, and repeat with the next owner-occupied purchase.",
      ],
    },
    {
      title: "4. Multi-family: benefits and cautions",
      body: [
        "Multi-family homes spread vacancy risk across units and usually produce better cash flow per dollar than single-family homes. Cautions: older NJ multi-families may have aging boilers, knob-and-tube wiring, lead paint and separate-meter issues; towns may require inspections and COs for each unit; and 3+ unit buildings must be registered with the DCA and inspected periodically.",
        "Always get a full inspection, check the legal unit count with the town, and review existing leases and deposits (estoppel letters) before closing.",
      ],
    },
    {
      title: "5. DSCR loans",
      body: [
        "A DSCR loan qualifies you based on the property's rent rather than your personal income or tax returns. Typical terms: 20–25% down, rates somewhat above conventional, and a DSCR of about 1.0–1.25. They can close in an LLC and there is no limit on the number of properties — popular with self-employed investors and those who already have many mortgages.",
      ],
    },
    {
      title: "6. BRRRR: Buy, Rehab, Rent, Refinance, Repeat",
      body: [
        "Buy a property below value (often needing work), rehab it to force appreciation, rent it to a qualified tenant, then refinance (often with a DSCR loan) at the new higher value to pull your cash back out. Repeat with the same money.",
        "Example: buy for $260,000 with $80,000 cash + rehab, appraise after rehab at $400,000, refinance at 75% loan-to-value ($300,000), and recover most of your cash while keeping a rented asset. The risks are rehab overruns, lower-than-expected appraisals and rising rates — keep reserves.",
      ],
    },
    {
      title: "7. LLC, joint ownership and taxes",
      body: [
        "An LLC can help separate liability and organize multiple properties, but conventional mortgages usually require personal ownership; DSCR and commercial loans can close in an LLC. Many investors start in their own names with a strong umbrella insurance policy, then move to LLCs as they scale. Spouses owning jointly may benefit from tenancy by the entirety protections in NJ.",
        "Rental income is reported on Schedule E. Depreciation (27.5 years for residential buildings), mortgage interest, taxes, insurance, repairs and management fees are deductible. When you sell, 1031 exchanges can defer capital gains. Talk to a CPA and a real estate attorney before choosing a structure.",
      ],
    },
    {
      title: "8. Systems that let you scale",
      body: [
        "Investors who grow past a few doors run their rentals like a business: written screening criteria, standard leases, automatic rent invoices, a repair-request system, and clean books. VDO Rental gives you all of that in one dashboard, plus a tenant portal and a maintainer portal, so adding the next property doesn't add chaos.",
      ],
    },
  ],
};
