import type { Prisma } from "@prisma/client";

/**
 * How a lead can be reached. A row with neither a number nor an address is no
 * use to the call desk, so the list is filtered by what a girl can actually do
 * with it.
 */
export const REACH_FILTERS = [
  { key: "phone", label: "☎️ Has a phone" },
  { key: "email", label: "✉️ Has an email" },
  { key: "both", label: "☎️✉️ Has both" },
] as const;

export type ReachKey = (typeof REACH_FILTERS)[number]["key"];

export function reachKey(value: string | null | undefined): ReachKey | null {
  return REACH_FILTERS.find((entry) => entry.key === value)?.key ?? null;
}

const hasPhone: Prisma.ProspectWhereInput = { phone: { not: null } };
const hasEmail: Prisma.ProspectWhereInput = { email: { not: null } };

export function reachWhere(key: ReachKey | null): Prisma.ProspectWhereInput {
  if (key === "phone") return hasPhone;
  if (key === "email") return hasEmail;
  if (key === "both") return { AND: [hasPhone, hasEmail] };
  return {};
}
