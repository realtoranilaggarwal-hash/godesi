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

/** Live video-pooja packages — a pandit performs the ritual on a video call in
 * the devotee's name & gotra. Inspired by temple-booking services like
 * DevPunya, but our pandits come to you over video instead of at a mandir. */
export const POOJA_PACKAGES: PoojaPackage[] = [
  {
    slug: "ganesh",
    emoji: "🐘",
    name: "Ganesh Puja",
    deity: "Lord Ganesha",
    purpose: "New beginnings — remove obstacles before a launch, exam or move",
    includes: [
      "45-min live video pooja with a Vedic pandit",
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
      "90-min live video pooja with a Vedic pandit",
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
      "75-min live video abhishek & jaap",
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
      "60-min live video pooja",
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
      "2-hour live video griha pravesh ceremony",
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
      "Tell us the occasion — we match the right pandit",
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
