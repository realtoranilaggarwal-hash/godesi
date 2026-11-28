import type { Ebook } from "../types";

export const section8Guide: Ebook = {
  slug: "section-8-guide-nj",
  title: "Section 8 Guide for New Jersey Landlords & Investors",
  subtitle: "How the Housing Choice Voucher program works — and how to profit from it",
  audience: "Landlords & investors",
  color: "#1d4ed8",
  pitch: "Guaranteed government rent, long-term tenants and lower vacancy — if you understand inspections, payment standards and the rules.",
  bullets: ["How voucher rent is split between the housing authority and tenant", "Passing the HQS / NSPIRE inspection the first time", "Why refusing vouchers is illegal in NJ", "Running the numbers on a Section 8 rental"],
  related: ["why-section-8-is-beneficial-for-investors-landlords", "navigating-section-8-insights-legal-cases-and-resources-for-new-jersey-landlords", "how-to-buy-a-home-in-new-jersey-using-section-8"],
  chapters: [
    {
      title: "1. What Section 8 is",
      body: [
        "The Housing Choice Voucher Program (\"Section 8\") is a federal HUD program run in New Jersey by the NJ Department of Community Affairs and dozens of local Public Housing Authorities (PHAs). A qualifying household receives a voucher and rents a home from a private landlord. The PHA pays its share of the rent directly to the landlord each month (the Housing Assistance Payment, or HAP), and the tenant pays the rest — usually about 30% of their adjusted income.",
        "For landlords, the attraction is simple: a large part of the rent arrives by direct deposit from a government agency every month, regardless of the tenant's job situation.",
      ],
    },
    {
      title: "2. New Jersey law: you cannot refuse vouchers",
      body: [
        "The NJ Law Against Discrimination prohibits discrimination based on \"source of lawful income used for rental or mortgage payments\". That means you cannot advertise \"no Section 8\", refuse to accept a voucher, or apply tougher standards to voucher holders. When applying an income test, you must count only the tenant's portion of the rent, not the full contract rent.",
        "You can still screen voucher holders with the same criteria you apply to everyone else — rental history, reasonable credit standards applied to the tenant's share, and references.",
      ],
    },
    {
      title: "3. How rent is set",
      body: [
        "Each PHA sets payment standards based on HUD Fair Market Rents (or Small Area FMRs by ZIP code) and bedroom count. Your requested rent must be \"reasonable\" compared to similar unassisted units nearby, and the tenant's share at move-in generally cannot exceed 40% of their adjusted monthly income. Ask the PHA for the current payment standard for your ZIP code and bedroom size before setting rent.",
        "Utilities matter: if the tenant pays utilities, the PHA subtracts a utility allowance from the payment standard. Including some utilities can sometimes let you charge a higher contract rent.",
      ],
    },
    {
      title: "4. The process, from application to first HAP payment",
      body: [
        "1) Screen the applicant as usual and approve them. 2) The tenant gives you a Request for Tenancy Approval (RFTA) packet; you complete it with rent, deposit, utilities and unit details. 3) The PHA does a rent-reasonableness review and schedules an inspection. 4) After the unit passes, you sign the HAP contract with the PHA and the lease with the tenant. 5) HAP payments begin, often with the first payment covering a partial month.",
        "Do not let the tenant move in before the inspection passes and the HAP contract is signed — the PHA will not pay for that period.",
      ],
      checklist: ["Applicant screened and approved", "RFTA completed and returned", "Rent reasonableness approved", "Inspection passed", "HAP contract + lease signed before move-in"],
    },
    {
      title: "5. Passing inspection the first time",
      body: [
        "HUD is moving PHAs from Housing Quality Standards (HQS) to the NSPIRE standard. Common failures: missing or non-working smoke and CO detectors; missing GFCI outlets near water; peeling paint in pre-1978 homes; broken windows or windows that won't stay open; missing handrails on stairs with 4+ steps; water heaters without discharge pipes; non-working stove burners; pest infestations; and blocked egress.",
        "Walk the unit with a checklist a week before the inspection, test every outlet, light, burner and window, and fix small items. A re-inspection can delay rent by weeks.",
      ],
      checklist: ["Smoke + CO detectors on every level and near bedrooms", "GFCI outlets in kitchen, baths, laundry, exterior", "No peeling paint (lead-safe for pre-1978)", "Handrails on stairs", "Water heater relief valve with discharge pipe", "All windows open, lock and have screens", "Appliances and burners work", "Heat and hot water working"],
    },
    {
      title: "6. Pros and cons for investors",
      body: [
        "Pros: reliable rent for the PHA portion; tenants tend to stay longer because moving with a voucher is work; annual inspections keep the property maintained; a large pool of applicants lowers vacancy.",
        "Cons: paperwork and inspection timing; rent increases require PHA approval and must stay reasonable; HAP can be abated if a failed annual inspection isn't fixed on time; and the tenant still pays their portion, so screening still matters.",
      ],
    },
    {
      title: "7. Running the numbers",
      body: [
        "Example: a 3-bedroom in central New Jersey with a payment standard of $2,900 and a $200 utility allowance. If the tenant pays utilities, maximum gross rent is about $2,900, so contract rent may be approved around $2,700. If the tenant's share is $650, the PHA pays $2,050 directly to you. Compare that to the same home's market rent, vacancy rate and turnover cost.",
        "Use VDO Rental to track the tenant's portion and the PHA portion as separate payments on each monthly invoice, so you always know who owes what.",
      ],
    },
    {
      title: "8. Section 8 homeownership",
      body: [
        "Some New Jersey PHAs offer a Homeownership Voucher option that lets eligible families use their voucher toward a mortgage payment. For landlords who want to sell, a long-term voucher tenant may become a buyer. Contact the local PHA for eligibility rules, and work with a Realtor and lender who know the program.",
      ],
    },
  ],
};
