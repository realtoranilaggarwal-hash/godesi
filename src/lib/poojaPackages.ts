export type PoojaPackage = {
  slug: string;
  emoji: string;
  name: string;
  deity: string;
  /** One-line "what it's for" shown on the card. */
  purpose: string;
  /** Everything the devotee gets — shown as a checklist. */
  includes: string[];
  priceUsd: number;
  /** Rough duration of the video session. */
  minutes: number;
};

/** Live pooja packages — GoDesi is the trusted middleman: we match the devotee
 * with a vetted pandit from our India network (chosen for the devotee's home
 * city/region and their concern), the ritual is performed at a real temple in
 * India, and the devotee joins by video call. Inspired by temple-booking
 * services like DevPunya. */
export const POOJA_PACKAGES: PoojaPackage[] = [
  {
    slug: "india-temple",
    emoji: "🛕",
    name: "Temple Pooja in India",
    deity: "At a real temple near your hometown",
    purpose: "A pandit performs your puja at an Indian temple — you watch & join live on video",
    includes: [
      "Pandit matched from our trusted India network — often a temple near your family's hometown",
      "Puja performed at a real temple in India, live on video call",
      "Sankalp chanted in your name & gotra",
      "Chadhava / prasad couriered where available",
      "Assigned & coordinated by GoDesi — no dealing with strangers",
    ],
    priceUsd: 151,
    minutes: 60,
  },
  {
    slug: "ganesh",
    emoji: "🐘",
    name: "Ganesh Puja",
    deity: "Lord Ganesha",
    purpose: "New beginnings — remove obstacles before a launch, exam or move",
    includes: [
      "45-min pooja by a vetted GoDesi pandit, live on video",
      "Sankalp chanted in your name & gotra",
      "Ganesh mantra jaap + aarti",
      "Simple samagri list sent ahead — or pandit-only option",
    ],
    priceUsd: 51,
    minutes: 45,
  },
  {
    slug: "satyanarayan",
    emoji: "🪔",
    name: "Satyanarayan Puja",
    deity: "Lord Vishnu",
    purpose: "Gratitude & family blessings — birthdays, anniversaries, Purnima",
    includes: [
      "90-min pooja by a vetted GoDesi pandit, live on video",
      "Satyanarayan katha recited in English or Hindi",
      "Sankalp in your name & gotra for the whole family",
      "Prasad recipe guide so you can offer at home",
    ],
    priceUsd: 101,
    minutes: 90,
  },
  {
    slug: "rudrabhishek",
    emoji: "🕉️",
    name: "Rudra Abhishek + Maha Mrityunjaya Jaap",
    deity: "Lord Shiva",
    purpose: "Health, peace & protection — 108× Maha Mrityunjaya chant",
    includes: [
      "75-min abhishek & jaap by a vetted GoDesi pandit, live on video",
      "108 Maha Mrityunjaya mantra in your name & gotra",
      "Panchamrit abhishek guided step-by-step",
      "Best on Mondays, Pradosh & Shivaratri",
    ],
    priceUsd: 151,
    minutes: 75,
  },
  {
    slug: "lakshmi-dhan",
    emoji: "🪙",
    name: "Maha Lakshmi–Ganesh Puja",
    deity: "Maa Lakshmi + Lord Ganesha",
    purpose: "Wealth & prosperity — Diwali, new business, new financial year",
    includes: [
      "60-min pooja by a vetted GoDesi pandit, live on video",
      "Lakshmi-Ganesh samuhik puja in your name & gotra",
      "Kanakdhara / Lakshmi stotra recitation",
      "Kubera yantra placement guidance for your home",
    ],
    priceUsd: 121,
    minutes: 60,
  },
  {
    slug: "griha-pravesh",
    emoji: "🏠",
    name: "Griha Pravesh Puja",
    deity: "Vastu Purush + Navagraha",
    purpose: "House-warming — bless your new home before you move in",
    includes: [
      "2-hour griha pravesh ceremony by a vetted GoDesi pandit, live on video",
      "Vastu shanti + Navagraha puja, guided room-by-room",
      "Sankalp for the whole family in name & gotra",
      "Full samagri checklist shared a week ahead",
    ],
    priceUsd: 251,
    minutes: 120,
  },
  {
    slug: "custom",
    emoji: "🙏",
    name: "Custom Puja / Havan",
    deity: "Your ishta devta",
    purpose: "Naming ceremony, mundan, pitru puja, dosha nivaran & more",
    includes: [
      "Tell us the occasion — we match the right pandit from our India network",
      "Live video ceremony in your name & gotra",
      "Regional-language pandits where available",
      "Price confirmed before you pay — no surprises",
    ],
    priceUsd: 0,
    minutes: 60,
  },
];

export const poojaPackageBySlug = (slug: string) =>
  POOJA_PACKAGES.find((pkg) => pkg.slug === slug);
