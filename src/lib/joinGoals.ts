/**
 * "What would you like to do on GoDesi?" — asked at signup and editable on
 * /dashboard/goals. Each goal points the member at its next step.
 */
export type JoinGoal = {
  id: string;
  icon: string;
  label: string;
  /** Where the member goes to act on it. */
  href: string;
  next: string;
};

export const JOIN_GOALS: JoinGoal[] = [
  {
    id: "business-profile",
    icon: "🏪",
    label: "Add my business profile",
    href: "/dashboard/profile",
    next: "Create your free business card",
  },
  {
    id: "rishta-profile",
    icon: "💍",
    label: "Post a matrimonial (Rishta) profile",
    href: "/rishta/new",
    next: "Post a Rishta profile",
  },
  {
    id: "find-service",
    icon: "🔎",
    label: "I'm looking for a service",
    href: "/leads/new",
    next: "Tell local pros what you need",
  },
  {
    id: "marketing-leads",
    icon: "📣",
    label: "Marketing or leads for my business",
    href: "/advertise",
    next: "See banners, featured spots and leads",
  },
  {
    id: "website-discount",
    icon: "🌐",
    label: "A discounted website",
    href: "/website",
    next: "See the discounted website offer",
  },
  {
    id: "events",
    icon: "🎟️",
    label: "Take part in GoDesi events",
    href: "/events",
    next: "Find GoDesi events near you",
  },
  {
    id: "ambassador",
    icon: "🤝",
    label: "Become a local GoDesi ambassador",
    href: "/ambassador",
    next: "Apply and sign the ambassador pledge",
  },
];

const BY_ID = new Map(JOIN_GOALS.map((goal) => [goal.id, goal]));

export function joinGoal(id: string) {
  return BY_ID.get(id) ?? null;
}

export function parseJoinGoals(values: unknown[]) {
  return Array.from(new Set(values.map(String))).filter((id) => BY_ID.has(id));
}

/** What GoDesi gives an approved local ambassador. */
export const AMBASSADOR_PERKS = [
  {
    icon: "🏅",
    title: "Badge and certificate",
    text: "A “GoDesi Local Ambassador” badge on your profile and a numbered certificate you can print and frame.",
  },
  {
    icon: "🎟️",
    title: "Events",
    text: "Free entry and a mention on stage at GoDesi events in your city, and first say in planning local meetups.",
  },
  {
    icon: "🎙️",
    title: "Media spotlight",
    text: "A feature on GoDesi Media and a chance at “Ambassador of the month” on the home page.",
  },
  {
    icon: "🤝",
    title: "Local network",
    text: "Introductions to local businesses, clubs and organisers, and help from the GoDesi team when you run something.",
  },
];

/** Ways an ambassador can help; ticked on the application. */
export const AMBASSADOR_HELP = [
  { id: "businesses", label: "Help local businesses claim their GoDesi card" },
  { id: "members", label: "Invite friends, family and groups to join" },
  { id: "events", label: "Help run or promote GoDesi events" },
  { id: "news", label: "Share local news and community updates" },
  { id: "social", label: "Post about GoDesi on WhatsApp, Facebook, Instagram" },
];

export const AMBASSADOR_HELP_IDS = AMBASSADOR_HELP.map((item) => item.id);

/** The ethics pledge; every line must be ticked before signing. */
export const AMBASSADOR_PLEDGE = [
  "I will be honest about what GoDesi is and does, and never promise anything GoDesi does not offer.",
  "I will never take money, gifts or favours in GoDesi's name. All payments go through godesi.com.",
  "I will protect members' privacy and never share anyone's phone, email or details without their permission.",
  "I will never ask for or accept money, gifts or any reward for referring anyone to mortgage, real-estate or insurance services.",
  "I will treat every person and community with respect, whatever their religion, caste, language, gender or background.",
  "I will not spam people or groups, and I will stop contacting anyone who asks me to.",
  "I will follow local laws and the GoDesi terms, and report problems to the GoDesi team.",
  "I understand GoDesi may remove my ambassador badge and certificate if I break this pledge.",
];

/** Public name of the extended program on /ambassador. */
export const AMBASSADOR_PROGRAM_NAME =
  "GoDesi Community Ambassador & Event Promotion Program";

/**
 * Hard compliance limits, shown on /ambassador and /ambassador/terms.
 * These terms and every campaign benefit must be reviewed by compliance
 * personnel before the program launches.
 */
export const AMBASSADOR_COMPLIANCE = [
  "This program covers event and community marketing only. It is completely separate from any mortgage, real-estate, insurance or other financial-services business, and no part of it is a referral arrangement for those services.",
  "No reward, gift, points, invite or other benefit is given for referring mortgage, real-estate settlement (title, escrow, closing, appraisal, home inspection, lending) or insurance business — to anyone, ever.",
  "No benefit is conditioned on buying insurance, applying for a loan, using any real-estate or settlement service, or referring insurance customers.",
  "Ambassadors must not mention, recommend or refer mortgage, real-estate settlement or insurance services while acting as a GoDesi ambassador.",
  "Ambassadors are never paid commission, cash or points. Event-promotion benefits are non-cash recognition (complimentary event invites, featured recognition, badges). They have no cash value and cannot be exchanged for money.",
];

export const AMBASSADOR_COMPLIANCE_REVIEW_NOTE =
  "Program terms and benefits are subject to review by compliance personnel before launch and may change.";

/** Earned through tracked event promotion; set per campaign by the GoDesi team. */
export const AMBASSADOR_EVENT_BENEFITS = [
  {
    icon: "🎟️",
    title: "Complimentary invites",
    text: "Reach the verified-ticket target on a campaign and earn complimentary invites to that event.",
  },
  {
    icon: "🌟",
    title: "Featured recognition",
    text: "Top promoters are thanked on stage, on the event page and in GoDesi's “Ambassador of the month”.",
  },
  {
    icon: "🏪",
    title: "Business spotlight",
    text: "Approved ambassadors can submit their business and logo to be featured on this page.",
  },
];
