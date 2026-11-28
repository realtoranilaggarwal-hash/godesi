import type { Ebook } from "./types";
import { deedFraudGuide } from "./books/deedfraud";
import { investorPlaybook } from "./books/investor";
import { landlordHandbook } from "./books/landlord";
import { protectYourRental } from "./books/protect";
import { whyRealtorGuide } from "./books/realtor";
import { rentersGuide } from "./books/renters";
import { retireEarlyGuide } from "./books/retire";
import { section8Guide } from "./books/section8";
import { squatterGuide } from "./books/squatters";

export type { Ebook } from "./types";

/**
 * Ebooks GoDesi hosts for a member: shown on the owner's profile, $9.99 each,
 * and every signed-in GoDesi member may pick one from each shelf free.
 */
export type MemberEbook = Ebook & { owner: string; ownerName: string };

export const MEMBER_EBOOK_PRICE_MINOR = 999;
export const MEMBER_EBOOK_PROVIDER = "member-ebook-gift";

const familyGuide: Ebook = {
  slug: "family-emergency-preparedness-guide",
  title: "Family Emergency Preparedness Guide",
  subtitle: "Get your NJ home and family ready for a 72-hour power outage or storm",
  audience: "NJ families & homeowners",
  color: "#ea580c",
  pitch:
    "Could your family and your house get through 3 days without electricity? A calm, practical plan with checklists you can print and put on the fridge.",
  bullets: [
    "A family emergency plan everyone knows",
    "Water, food, fridge and freezer safety",
    "Generators, sump pumps and stopping frozen pipes",
    "Kids, seniors, parents visiting from India, and pets",
    "Printable 72-hour kit list, home checklist and family contact card",
  ],
  chapters: [],
  related: [],
  file: "member-ebooks/family-emergency-preparedness-guide.pdf",
};

const ANIL = { owner: "anil-aggarwal-vylla", ownerName: "Anil Aggarwal" };

export const MEMBER_EBOOKS: MemberEbook[] = [
  familyGuide,
  landlordHandbook,
  section8Guide,
  rentersGuide,
  investorPlaybook,
  retireEarlyGuide,
  protectYourRental,
  squatterGuide,
  deedFraudGuide,
  whyRealtorGuide,
].map((book) => ({ ...book, ...ANIL }));

export function memberEbookBySlug(slug: string) {
  return MEMBER_EBOOKS.find((b) => b.slug === slug) ?? null;
}

export function memberEbooksFor(username: string | null | undefined) {
  return username ? MEMBER_EBOOKS.filter((b) => b.owner === username) : [];
}

export const memberEbookCover = (book: Ebook) => book.cover ?? `/images/member-ebooks/${book.slug}.png`;

/** Purchases and free picks live in CourseEnrollment under this key. */
export const memberEbookKey = (slug: string) => `ebook:${slug}`;

/** One free pick per member per shelf: stored as the enrollment's unique `reference`. */
export const freePickReference = (owner: string, userId: string) => `${MEMBER_EBOOK_PROVIDER}:${owner}:${userId}`;
