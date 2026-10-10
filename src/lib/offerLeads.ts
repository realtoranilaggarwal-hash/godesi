import type { Prisma } from "@prisma/client";
import { offerInterest } from "@/lib/offerInterests";

/** Members with at least one offer pick, optionally narrowed to one topic. */
export function offerLeadsWhere(
  interest: string | null,
): Prisma.UserWhereInput {
  return {
    bannedAt: null,
    ...(interest && offerInterest(interest)
      ? { offerInterests: { has: interest } }
      : { NOT: { offerInterests: { isEmpty: true } } }),
  };
}

export const offerLeadSelect = {
  id: true,
  name: true,
  email: true,
  emailVerifiedAt: true,
  role: true,
  username: true,
  location: true,
  offerPhone: true,
  phone: true,
  offerInterests: true,
  offerInterestsAt: true,
  createdAt: true,
} satisfies Prisma.UserSelect;
