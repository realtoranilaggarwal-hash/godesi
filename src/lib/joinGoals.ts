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
    icon: "⭐",
    title: "Reward points",
    text: "Points for every member you invite and every business you help claim its card — spend them on banners, featured spots or Pro.",
  },
  {
    icon: "💵",
    title: "Commission on sales",
    text: "A share of paid plans, banners and featured listings you bring in, agreed with the GoDesi team before you start.",
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
  { id: "sales", label: "Sell banners, featured spots and plans" },
  { id: "social", label: "Post about GoDesi on WhatsApp, Facebook, Instagram" },
];

export const AMBASSADOR_HELP_IDS = AMBASSADOR_HELP.map((item) => item.id);

/** The ethics pledge; every line must be ticked before signing. */
export const AMBASSADOR_PLEDGE = [
  "I will be honest about what GoDesi is and does, and never promise anything GoDesi does not offer.",
  "I will never take money, gifts or favours in GoDesi's name. All payments go through godesi.com.",
  "I will protect members' privacy and never share anyone's phone, email or details without their permission.",
  "I will tell people when I earn points or commission for bringing them to GoDesi.",
  "I will treat every person and community with respect, whatever their religion, caste, language, gender or background.",
  "I will not spam people or groups, and I will stop contacting anyone who asks me to.",
  "I will follow local laws and the GoDesi terms, and report problems to the GoDesi team.",
  "I understand GoDesi may remove my ambassador badge and certificate if I break this pledge.",
];
