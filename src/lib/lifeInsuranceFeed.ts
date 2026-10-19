import type { Prisma } from "@prisma/client";

/**
 * Every life insurance agent card on Godesi — agents who file their profile
 * under Financial Services → Life Insurance (plus cards that add it as an
 * extra category).
 */
export const LIFE_INSURANCE_AGENT_WHERE: Prisma.BusinessWhereInput = {
  status: "APPROVED",
  OR: [
    { subcategorySlug: "financial-services-life-insurance" },
    { extraCategorySlugs: { has: "financial-services-life-insurance" } },
    { category: "Life Insurance" },
  ],
};
