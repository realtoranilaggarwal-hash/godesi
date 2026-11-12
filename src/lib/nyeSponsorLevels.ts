/**
 * The NYE 2027 party's sponsor levels. scripts/update-nye-2027-edison.ts writes
 * these perks to the event's tiers and /proposal prints them, so both always match.
 */
export const NYE_2027_EVENT_SLUG = "new-year-eves-party-2027-edison";

export type NyeSponsorLevel = {
  name: "Silver sponsor" | "Gold sponsor" | "Platinum sponsor";
  price: number;
  perks: string[];
};

export const NYE_2027_SPONSOR_LEVELS: NyeSponsorLevel[] = [
  {
    name: "Silver sponsor",
    price: 1000,
    perks: [
      "Your logo on the flyer, the standee and the event pages on GoDesi.com and NewYearEvesParty.com",
      "Linked to your GoDesi business page",
      "Thank-you announcement on stage during the party",
      "Thank-you post on GoDesi News",
      "2 tickets included",
      "320×100 banner on GoDesi.com for 1 year",
      "25 Wall of Fame bricks on GoDesi.com ($250 value)",
    ],
  },
  {
    name: "Gold sponsor",
    price: 2500,
    perks: [
      "Everything in Silver",
      "Your banner inside the Big Ball Room",
      "Your logo or 30-second clip on the LED screen",
      "4 tickets included",
      "300×250 side banner on GoDesi.com for 1 year (instead of 320×100)",
      "75 Wall of Fame bricks on GoDesi.com ($750 value)",
    ],
  },
  {
    name: "Platinum sponsor",
    price: 5000,
    perks: [
      "Everything in Gold",
      "\"Countdown to 2027 presented by <your business>\" at midnight",
      "Your standee at the entrance and your logo on the photo backdrop",
      "Reserved table for 10 with champagne and a \"Table sponsored by\" marker",
      "Vendor table to show your business at the party",
      "10 tickets included",
      "300×600 large side banner on GoDesi.com for 1 year (instead of 300×250)",
      "200 Wall of Fame bricks on GoDesi.com ($2,000 value)",
    ],
  },
];

export function nyeSponsorLevel(name: NyeSponsorLevel["name"]) {
  const level = NYE_2027_SPONSOR_LEVELS.find((entry) => entry.name === name);
  if (!level) throw new Error(`No NYE sponsor level ${name}`);
  return level;
}
