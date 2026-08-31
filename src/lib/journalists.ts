/** Star levels earned by having stories approved on the community news desk. */
export const JOURNALIST_LEVELS = [
  { level: 1, stars: "⭐", title: "Contributor", stories: 1 },
  { level: 2, stars: "⭐⭐", title: "Reporter", stories: 5 },
  { level: 3, stars: "⭐⭐⭐", title: "Verified reporter", stories: 15 },
  { level: 4, stars: "⭐⭐⭐⭐", title: "Senior reporter", stories: 40 },
  { level: 5, stars: "⭐⭐⭐⭐⭐", title: "Editor", stories: 75 },
] as const;

export type JournalistLevel = (typeof JOURNALIST_LEVELS)[number];

/** The level that earns a Godesi press card. */
export const PRESS_CARD_LEVEL = 5;

export function levelFor(approved: number): JournalistLevel | null {
  let current: JournalistLevel | null = null;
  for (const level of JOURNALIST_LEVELS) {
    if (approved >= level.stories) current = level;
  }
  return current;
}

export function nextLevel(approved: number): JournalistLevel | null {
  return JOURNALIST_LEVELS.find((level) => approved < level.stories) ?? null;
}

/** Categories a member report can be filed under. */
export const REPORT_CATEGORIES = [
  "Local",
  "Business",
  "Event",
  "Alert",
  "Other",
] as const;

/** How the reporter came across the story. */
export const REPORT_SOURCES = [
  "Self",
  "WhatsApp",
  "Facebook",
  "News",
  "Other",
] as const;

/** Every one of these must be ticked before a report can be filed. */
export const REPORT_DECLARATIONS = [
  { name: "seen", label: "I personally verified or witnessed this" },
  { name: "unedited", label: "Media is not edited or manipulated" },
  { name: "location", label: "Location is accurate" },
  { name: "timing", label: "Date and time are correct" },
  {
    name: "genuine",
    label: "This is not fake or AI-generated misinformation",
  },
  {
    name: "consequences",
    label: "I understand false posting may suspend my account",
  },
] as const;

/** Shown above the declarations so people know what to look for. */
export const FAKE_MEDIA_CHECKS = [
  "Face distortion — warped ears, teeth, fingers or jewellery",
  "Lip sync mismatch between the voice and the mouth",
  "Lighting and shadows that fall in different directions",
  "Reverse image search: has this photo been online for years?",
  "Source credibility — who sent it, and can they be asked directly?",
] as const;

export const REVERSE_IMAGE_SEARCH_URL = "https://images.google.com/";

export type TrustBreakdown = {
  confirmed: number;
  doubted: number;
  fake: number;
  /** 0–100. Starts neutral and moves with reader verdicts and editor picks. */
  score: number;
};

/**
 * Readers vouch for or challenge each report. A doubt costs more than a
 * confirmation earns, and a fake verdict costs far more, so it stays much
 * easier to lose trust than to buy it with volume.
 */

export function trustScore({
  approved,
  featured,
  confirmed,
  doubted,
  fake,
}: {
  approved: number;
  featured: number;
  confirmed: number;
  doubted: number;
  fake: number;
}) {
  const raw =
    50 +
    Math.min(approved, 30) +
    featured * 2 +
    confirmed * 2 -
    doubted * 4 -
    fake * 12;
  return Math.max(0, Math.min(100, Math.round(raw)));
}

export type JournalistStats = {
  approved: number;
  pending: number;
  featured: number;
  upvotes: number;
  level: JournalistLevel | null;
  next: JournalistLevel | null;
  joined: Date | null;
  beat: string | null;
  trust: TrustBreakdown;
  checks: VerificationChecks;
  pressCard: PressCard | null;
};

export type VerificationChecks = {
  email: boolean;
  phone: boolean;
  kyc: boolean;
  /** No report of theirs has been taken down as fake. */
  cleanRecord: boolean;
};

export type PressCard = {
  id: string;
  name: string;
  avatarUrl: string | null;
  username: string | null;
  beat: string | null;
  level: string;
  issuedAt: Date;
  expiresAt: Date;
  expired: boolean;
};

export type PressCardEligibility = {
  eligible: boolean;
  /** Everything still standing between the member and a card. */
  missing: string[];
};

export function pressCardEligibility(
  stats: Pick<JournalistStats, "level" | "checks" | "trust">,
): PressCardEligibility {
  const missing: string[] = [];
  if ((stats.level?.level ?? 0) < PRESS_CARD_LEVEL) {
    const target = JOURNALIST_LEVELS.find(
      (item) => item.level === PRESS_CARD_LEVEL,
    );
    missing.push(`Reach ${target?.stars} ${target?.title}`);
  }
  if (!stats.checks.email) missing.push("Verify your email");
  if (!stats.checks.phone) missing.push("Verify your mobile number");
  if (!stats.checks.cleanRecord) missing.push("Clear your fake-report history");
  if (stats.trust.score < 70) missing.push("Trust score of 70 or more");

  return { eligible: missing.length === 0, missing };
}

export type LeaderRow = {
  id: string;
  name: string;
  username: string | null;
  avatarUrl: string | null;
  beat: string | null;
  approved: number;
  level: JournalistLevel | null;
  pressCard: boolean;
};

export const JOURNALIST_RULES = [
  "Report what you saw or can verify — no rumours, and no copying another site's article word for word.",
  "Credit your source and link to it. Photos must be yours or free to use.",
  "No paid promotion disguised as news, no hate speech, and nothing that puts anyone at risk.",
  "The Godesi team reviews every submission and may edit, unpublish or delete any story, and remove journalist status for repeat problems.",
] as const;
