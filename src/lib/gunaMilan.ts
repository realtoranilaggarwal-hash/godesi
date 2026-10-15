/**
 * Ashtakoota guna milan (36 points) from each side's sidereal Moon sign (0-11)
 * and nakshatra (0-26). Traditions differ on some sub-scores; this follows the
 * common North Indian tables, with Vashya and Yoni simplified to their main grades.
 */

const VARNA = [3, 2, 1, 4, 3, 2, 1, 4, 3, 2, 1, 4];

/** 0 quadruped, 1 human, 2 water, 3 wild, 4 insect. */
const VASHYA = [0, 0, 1, 2, 3, 1, 1, 4, 1, 0, 1, 2];
const VASHYA_SCORE = [
  [2, 1, 1, 0.5, 1],
  [1, 2, 0.5, 0, 1],
  [1, 0.5, 2, 1, 1],
  [0.5, 0, 1, 2, 0],
  [1, 1, 1, 0, 2],
];

const YONI = [
  "horse",
  "elephant",
  "sheep",
  "serpent",
  "serpent",
  "dog",
  "cat",
  "sheep",
  "cat",
  "rat",
  "rat",
  "cow",
  "buffalo",
  "tiger",
  "buffalo",
  "tiger",
  "deer",
  "deer",
  "dog",
  "monkey",
  "mongoose",
  "monkey",
  "lion",
  "horse",
  "lion",
  "cow",
  "elephant",
];
const YONI_ENEMIES = [
  ["horse", "buffalo"],
  ["elephant", "lion"],
  ["sheep", "monkey"],
  ["serpent", "mongoose"],
  ["dog", "deer"],
  ["cat", "rat"],
  ["cow", "tiger"],
];

type Planet =
  "sun" | "moon" | "mars" | "mercury" | "jupiter" | "venus" | "saturn";
const LORD: Planet[] = [
  "mars",
  "venus",
  "mercury",
  "moon",
  "sun",
  "mercury",
  "venus",
  "mars",
  "jupiter",
  "saturn",
  "saturn",
  "jupiter",
];
const FRIENDS: Record<Planet, { friends: Planet[]; enemies: Planet[] }> = {
  sun: { friends: ["moon", "mars", "jupiter"], enemies: ["venus", "saturn"] },
  moon: { friends: ["sun", "mercury"], enemies: [] },
  mars: { friends: ["sun", "moon", "jupiter"], enemies: ["mercury"] },
  mercury: { friends: ["sun", "venus"], enemies: ["moon"] },
  jupiter: { friends: ["sun", "moon", "mars"], enemies: ["mercury", "venus"] },
  venus: { friends: ["mercury", "saturn"], enemies: ["sun", "moon"] },
  saturn: { friends: ["mercury", "venus"], enemies: ["sun", "moon", "mars"] },
};

/** 0 Deva, 1 Manushya, 2 Rakshasa. */
const GANA = [
  0, 1, 2, 1, 0, 1, 0, 0, 2, 2, 1, 1, 0, 2, 0, 2, 0, 2, 2, 1, 1, 0, 2, 2, 1, 1,
  0,
];
const NADI_CYCLE = [0, 1, 2, 2, 1, 0];

export type MoonPlacement = { moonSign: number; nakshatra: number };

export type GunaResult = {
  total: number;
  kootas: { name: string; score: number; max: number; meaning: string }[];
};

function relation(a: Planet, b: Planet) {
  if (a === b || FRIENDS[a].friends.includes(b)) return 2;
  return FRIENDS[a].enemies.includes(b) ? 0 : 1;
}

function taraGood(from: number, to: number) {
  const count = ((to - from + 27) % 27) + 1;
  return ![3, 5, 7].includes(count % 9);
}

export function gunaMilan(
  groom: MoonPlacement,
  bride: MoonPlacement,
): GunaResult {
  const varna = VARNA[groom.moonSign] >= VARNA[bride.moonSign] ? 1 : 0;
  const vashya = VASHYA_SCORE[VASHYA[groom.moonSign]][VASHYA[bride.moonSign]];
  const tara =
    (taraGood(bride.nakshatra, groom.nakshatra) ? 1.5 : 0) +
    (taraGood(groom.nakshatra, bride.nakshatra) ? 1.5 : 0);

  const yoniPair = [YONI[groom.nakshatra], YONI[bride.nakshatra]];
  const yoni =
    yoniPair[0] === yoniPair[1]
      ? 4
      : YONI_ENEMIES.some(
            ([a, b]) =>
              (yoniPair[0] === a && yoniPair[1] === b) ||
              (yoniPair[0] === b && yoniPair[1] === a),
          )
        ? 0
        : 2;

  const lords = [LORD[groom.moonSign], LORD[bride.moonSign]];
  const pair = [relation(lords[0], lords[1]), relation(lords[1], lords[0])]
    .sort()
    .join("");
  const maitri =
    { "22": 5, "12": 4, "11": 3, "02": 1, "01": 0.5, "00": 0 }[pair] ?? 0;

  const ganas = [GANA[groom.nakshatra], GANA[bride.nakshatra]];
  const gana =
    ganas[0] === ganas[1]
      ? 6
      : ganas.includes(0) && ganas.includes(1)
        ? 5
        : ganas.includes(0)
          ? 1
          : 0;

  const distance = ((bride.moonSign - groom.moonSign + 12) % 12) + 1;
  const bhakoot = [2, 12, 5, 9, 6, 8].includes(distance) ? 0 : 7;

  const nadi =
    NADI_CYCLE[groom.nakshatra % 6] === NADI_CYCLE[bride.nakshatra % 6] ? 0 : 8;

  const kootas = [
    { name: "Varna", score: varna, max: 1, meaning: "outlook and work" },
    { name: "Vashya", score: vashya, max: 2, meaning: "mutual attraction" },
    { name: "Tara", score: tara, max: 3, meaning: "health and fortune" },
    { name: "Yoni", score: yoni, max: 4, meaning: "physical compatibility" },
    {
      name: "Graha Maitri",
      score: maitri,
      max: 5,
      meaning: "friendship of minds",
    },
    { name: "Gana", score: gana, max: 6, meaning: "temperament" },
    { name: "Bhakoot", score: bhakoot, max: 7, meaning: "family and finances" },
    { name: "Nadi", score: nadi, max: 8, meaning: "health and children" },
  ];
  return { total: kootas.reduce((sum, koota) => sum + koota.score, 0), kootas };
}

export function gunaVerdict(total: number) {
  if (total >= 28) return "Excellent match";
  if (total >= 24) return "Very good match";
  if (total >= 18) return "Acceptable match";
  return "Below 18 — most families consult a pandit";
}
