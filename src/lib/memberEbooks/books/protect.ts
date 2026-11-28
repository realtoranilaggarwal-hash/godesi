import type { Ebook } from "../types";

export const protectYourRental: Ebook = {
  slug: "protect-your-rental",
  title: "Protect Your Rental",
  subtitle: "Insurance, home warranties, safety, and short-term rental (Airbnb) rules in New Jersey",
  audience: "Landlords & hosts",
  color: "#be123c",
  pitch: "One uninsured claim can erase years of rent. Here's how to protect the property, your tenants and yourself.",
  bullets: ["Landlord vs. homeowner insurance (and why it matters)", "Umbrella liability and renter's insurance", "Home warranty and repair plans", "Safety checklist before every new tenant or guest"],
  related: ["essential-safety-precautions-for-new-jersey-homeowners-before-renting-out-properties", "title-how-to-safeguard-your-new-jersey-home-when-renting-or-listing-on-airbnb", "dont-rent-your-property-till-you-get-this-home-repair-insurance", "case-study-what-landlords-can-learn-from-a-difficult-tenant-experience"],
  chapters: [
    {
      title: "1. The right insurance policy",
      body: [
        "A standard homeowner policy (HO-3) generally does not cover a home you rent out. You need a landlord or dwelling-fire policy (DP-3) that covers the structure, liability and loss of rent while the home is being repaired after a covered loss. Tell your insurer exactly how the property is used — long-term rental, mid-term, or short-term (Airbnb) — or a claim may be denied.",
        "Add an umbrella policy ($1–2 million) once you own more than one property; it is inexpensive compared to the lawsuits it protects against. Require tenants to carry renter's insurance with at least $100,000 of liability and list you as an interested party.",
      ],
      checklist: ["Landlord (DP-3) policy with loss-of-rent coverage", "Liability ≥ $500k + umbrella", "Flood insurance if in or near a flood zone", "Tenant renter's insurance required in lease", "Policy reflects short-term use if applicable"],
    },
    {
      title: "2. Home warranties and repair plans",
      body: [
        "A home warranty or repair plan can cover furnaces, water heaters, appliances and plumbing for a yearly fee and a per-visit service charge. For older systems, it can turn a surprise $6,000 boiler replacement into a $100 service fee. Read what is excluded (pre-existing conditions, code upgrades, caps per item) before buying.",
        "Keep a repair reserve anyway — warranties are a cushion, not a substitute for maintenance.",
      ],
    },
    {
      title: "3. Safety before every new occupant",
      body: [
        "Test smoke and carbon-monoxide alarms on every level, replace batteries, and get the state smoke/CO/fire-extinguisher certificate required at each change of occupancy. Check stair railings, outlets near water (GFCI), dryer vents, water-heater relief valves, window locks and egress from bedrooms. Service the heating system yearly.",
        "Re-key locks between tenants, and document the condition with photos and video.",
      ],
      checklist: ["Smoke + CO alarms tested", "Fire extinguisher mounted near kitchen", "GFCI outlets working", "Dryer vent cleaned", "Heating serviced", "Locks re-keyed", "Photos/video saved"],
    },
    {
      title: "4. Short-term rentals (Airbnb, VRBO)",
      body: [
        "Many New Jersey towns regulate or ban short-term rentals, require permits and inspections, or collect occupancy taxes; New Jersey also applies state sales and occupancy taxes to many short-term rentals. Check your town ordinance and HOA rules before listing.",
        "Protect the home with a short-term rental insurance policy, a noise/occupancy monitor that respects privacy (never cameras inside), a lockbox or smart lock that changes codes per guest, clear house rules, and a security deposit or damage protection. Keep valuables and personal documents out of the rental.",
      ],
    },
    {
      title: "5. Protecting yourself legally",
      body: [
        "Use a written lease reviewed by a NJ attorney, follow security-deposit rules exactly, give proper notice before entry, respond to repair requests promptly and in writing, and never use self-help eviction. Keep separate bank accounts for each rental (or at least for your rental business) and keep every receipt.",
        "Good records — lease, ledger, photos, repair log — are your best defense in any dispute. VDO Rental keeps them in one place for every property.",
      ],
    },
  ],
};
