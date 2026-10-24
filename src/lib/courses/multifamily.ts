import { Lesson } from "./types";

export const MULTIFAMILY_LESSONS: Lesson[] = [
  {
    title: "Why multi-units beat single homes",
    minutes: 6,
    paragraphs: [
      "A duplex, triplex or fourplex gives you several rent checks under one roof, one lawn, one mortgage. One empty unit out of four still means 75% income — an empty single-family rental means zero.",
      "The math scales too: small multifamily buildings are priced partly on the income they produce, so raising rents literally raises the building's value. That lever doesn't exist with single-family homes.",
    ],
    bullets: [
      "Multiple units = vacancy doesn't zero you out.",
      "Value follows income: raise rents → raise the building's worth.",
      "One roof, one system, one tax bill serving several checks.",
    ],
  },
  {
    title: "2–4 units — the FHA door opener",
    minutes: 6,
    paragraphs: [
      "The single best path in: an FHA owner-occupied loan on a 2–4 unit building with ~3.5% down, living in one unit. Lenders count ~75% of the other units' rent toward your income — many buyers qualify for a fourplex who couldn't qualify for a single house at the same price.",
      "Live one unit, rent three, and the building often pays for itself — while you build equity, landlording experience, and a track record for the next loan.",
    ],
    bullets: [
      "FHA: ~3.5% down on 2–4 units if you live in one.",
      "~75% of expected rents count toward your qualifying income.",
      "Must actually live there ~1 year — don't fake it.",
      "NJ duplexes/triplexes near transit are the classic buy.",
    ],
  },
  {
    title: "Underwriting — NOI, cap rate, DSCR in plain words",
    minutes: 8,
    paragraphs: [
      "Multifamily is priced on income. Net Operating Income (NOI) = annual rents − operating costs (taxes, insurance, repairs, utilities you pay, management). It excludes the mortgage. Cap rate = NOI ÷ price — a rough read of the return a building throws off.",
      "Example: rents $60K/yr, costs $24K → NOI $36K. At a 7% cap rate the building is worth ~$515K. DSCR loans for investors qualify the BUILDING, not you: rent ÷ mortgage payment ≥ ~1.2 usually passes. Learn these three numbers and you can talk to any lender or seller.",
    ],
    bullets: [
      "NOI = rents − operating costs (mortgage not included).",
      "Cap rate = NOI ÷ price — higher cap, cheaper building, rougher area often.",
      "DSCR = rent ÷ mortgage payment; ≥1.2 usually lends.",
      "Always ask for the seller's actual rent roll and expense history.",
    ],
  },
  {
    title: "Value-add — the legal way to force appreciation",
    minutes: 7,
    paragraphs: [
      "Multifamily's superpower: because value follows income, any rent increase or cost cut multiplies into equity. Under-market rents raised to market, separate utilities billed to tenants, coin laundry, storage fees, parking — each $100/month of new income adds roughly $14K+ of value at a 7% cap.",
      "First-timer's rule: buy a building with below-market rents and obvious, cheap improvements — tired kitchens, old paint, underpriced units — not a building needing a new everything.",
    ],
    bullets: [
      "+$100/mo income ≈ +$14K value at a 7% cap rate.",
      "Cheapest value-adds: raise under-market rents on turnover, bill utilities.",
      "Cosmetic upgrades justify higher rents — major systems don't.",
      "Verify real rents: leases + bank statements, not the listing sheet.",
    ],
  },
  {
    title: "Financing bigger buildings",
    minutes: 6,
    paragraphs: [
      "Five units and up is 'commercial': different loans, ~25% down, based on the building's DSCR and NOI rather than your salary. Community banks and credit unions lend on small multifamily more flexibly than big banks — relationships matter.",
      "Path many investors take: FHA fourplex (3.5% down) → conventional 2nd small multi → commercial loan once the track record exists. Seller financing sometimes bridges the gap — the owner acts as the bank, you pay them monthly.",
    ],
    bullets: [
      "5+ units = commercial loans: ~25% down, DSCR-based.",
      "Community banks beat big banks on small multis.",
      "Seller financing: negotiable, fast, worth asking — always with an attorney.",
      "Build your rent roll + expenses history — it IS your loan application.",
    ],
  },
  {
    title: "Managing 4–12 doors without losing your weekend",
    minutes: 6,
    paragraphs: [
      "Four to twelve units is the awkward middle: too much for pure DIY evenings, sometimes too small to justify a full-service manager at 8–10%. The workable middle: self-manage with systems — online rent collection, a written repair process, a vendor bench, and quarterly walk-throughs.",
      "Tenants stay when homes are cared for. Turnover is the biggest hidden cost in multifamily — every make-ready costs a month's rent plus paint. Fast repairs and fair treatment are a profit strategy, not just kindness.",
    ],
    bullets: [
      "Online rent collection from day one — never chase checks.",
      "Repair request → vendor dispatch → confirmation, same system every time.",
      "Quarterly walk-throughs catch $50 problems before they're $5,000.",
      "Keeping a good tenant a year longer beats finding a new one.",
    ],
  },
  {
    title: "Your first multi — the target",
    minutes: 5,
    paragraphs: [
      "The textbook first deal: a legal 2–4 unit building near transit or a strong town center, under-market rents, tired but sound, numbers working at today's rates. Live in it if you can. If not, buy small and let a manager run the first year while you learn the reports.",
      "Before offering, verify everything: actual leases, real utility bills, tax records, code compliance and CO status. Multifamily sellers sell spreadsheets — trust only verified paper.",
    ],
    bullets: [
      "Target: legal 2–4 units, transit-friendly, below-market rents.",
      "Verify: leases, deposits, utility bills, taxes, code status.",
      "Live-in FHA beats everything when you can do it.",
      "Walk from non-permitted units — they insure and lend badly.",
    ],
  },
];
