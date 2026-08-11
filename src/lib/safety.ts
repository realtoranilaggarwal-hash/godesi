/** Shared trust & safety copy — used by /safety, the hiring panels and the FAQ. */
export const HIRING_STEPS = [
  {
    title: "Verify profile",
    points: [
      "Check their profile, images and reviews",
      "Look for complete information and recent activity",
    ],
  },
  {
    title: "Speak directly",
    points: [
      "Use WhatsApp or phone to discuss details",
      "Ask clear questions about services and pricing",
    ],
  },
  {
    title: "Ask for samples",
    points: ["Request past work, references or a portfolio"],
  },
  {
    title: "Confirm pricing",
    points: ["Get written confirmation of price, deliverables and timeline"],
  },
  {
    title: "Use a written agreement",
    points: [
      "Always have a clear agreement or contract",
      "Avoid verbal-only commitments",
    ],
  },
  {
    title: "Avoid full advance payment",
    points: ["Pay in milestones where possible", "Keep proof of payments"],
  },
  {
    title: "Check reviews",
    points: ["Look at ratings and feedback from other users"],
  },
  {
    title: "Trust your judgment",
    points: ["If something feels off, take time before committing"],
  },
] as const;

export const PLATFORM_DISCLAIMER =
  "Godesi is a listing platform and is not a party to any transaction between users. We do not verify listings or guarantee any service. We do review complaints and may warn, suspend or remove accounts that break our rules.";

/** Buy & sell guidance — marketplace listings and the safety guide. */
export const TRADING_TIPS = [
  {
    title: "Verify the seller",
    icon: "🔍",
    points: [
      "Check their profile, reviews and how long they have been active",
      "Ask for a photo of the item with today's date",
    ],
  },
  {
    title: "Payment safety",
    icon: "💳",
    points: [
      "Pay on collection where possible, and keep a receipt",
      "Never send a deposit, gift card or crypto to hold an item",
    ],
  },
  {
    title: "Meet in public",
    icon: "📍",
    points: [
      "Meet in a busy, well-lit place and take someone with you",
      "For big items, arrange daytime pickup and tell a friend",
    ],
  },
  {
    title: "Test the item",
    icon: "🔧",
    points: [
      "Switch it on, check for damage and confirm accessories",
      "For phones and laptops, check the item is not locked or reported lost",
    ],
  },
  {
    title: "Check documents",
    icon: "📄",
    points: [
      "Vehicles: title, registration and service history",
      "Property: ownership papers and ID before any payment",
    ],
  },
  {
    title: "Red flags",
    icon: "🚩",
    points: [
      "Price far below market, pressure to decide immediately",
      "Refusal to meet, talk by phone or show the item",
      "Requests to move payment off-platform or to a third party",
    ],
  },
] as const;

export const TRADING_DISCLAIMER =
  "Godesi does not handle transactions. Payments, delivery and any agreement are strictly between buyer and seller — we never hold money or act as escrow.";

export const REPORT_ISSUE_TYPES = [
  "Fake or misleading listing",
  "Fraud or payment issue",
  "Poor or undelivered service",
  "Spam or duplicate listing",
  "Offensive or unsafe content",
  "Discriminatory housing listing",
  "Fake review",
  "Impersonation or stolen photos",
  "Something else",
] as const;

export type ReportIssueType = (typeof REPORT_ISSUE_TYPES)[number];
