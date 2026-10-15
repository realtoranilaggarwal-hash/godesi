/**
 * Astrology guides at /astrology: plain-language explainers written for GoDesi,
 * each pointing readers to the astrologers and pandits in the directory. Every
 * word here is our own — never lifted from another astrology site.
 */

export type AstrologySection = {
  heading: string;
  paragraphs?: string[];
  points?: string[];
};

export type AstrologyGuide = {
  slug: string;
  emoji: string;
  title: string;
  /** Search-friendly one-liner used as the meta description and card text. */
  description: string;
  intro: string[];
  sections: AstrologySection[];
  faqs: { q: string; a: string }[];
};

/** Directory subcategories that hold astrologers, wherever they were filed. */
export const ASTROLOGER_SUBCATEGORIES = [
  "religious-services-astrologers",
  "events-wedding-astrologers-and-horoscope-matching",
  "professionals-astrologers",
];

export const ASTROLOGY_DISCLAIMER =
  "Astrology is a traditional practice and a matter of personal belief. These guides explain how it is used in desi families; they are not medical, legal, financial or mental-health advice.";

export const ASTROLOGY_GUIDES: AstrologyGuide[] = [
  {
    slug: "vedic-vs-western-astrology",
    emoji: "🌌",
    title: "Vedic vs Western astrology: why your sign changes",
    description:
      "Why your Vedic (Jyotish) sign is often one sign behind your Western sun sign, and how moon signs, nakshatras and dashas make Indian astrology different.",
    intro: [
      "Many desis are surprised to find they are a Leo in a magazine horoscope but a Cancer in the kundli their family pandit made. Neither is a mistake — the two systems measure the sky from different starting points.",
    ],
    sections: [
      {
        heading: "Two zodiacs, one sky",
        paragraphs: [
          "Western astrology uses the tropical zodiac, which starts Aries at the spring equinox every year. Vedic astrology (Jyotish) uses the sidereal zodiac, which is tied to the fixed stars.",
          "Because of the slow wobble of the Earth's axis, the two zodiacs have drifted apart by roughly 24 degrees — the ayanamsa. That is why most people's Vedic sun sign falls one sign earlier than their Western one.",
        ],
      },
      {
        heading: "What Vedic astrology looks at first",
        points: [
          "Moon sign (rashi) rather than sun sign — it is the sign people ask about when they say “what is your rashi?”",
          "Nakshatra — the moon's lunar mansion at birth, one of 27, used for naming and for marriage matching.",
          "Lagna (ascendant) — the sign rising in the east at the moment of birth, which is why the exact birth time matters.",
          "Dasha periods — the Vimshottari dasha divides life into planetary periods over a 120-year cycle, used for timing.",
          "Nine grahas — Sun, Moon, Mars, Mercury, Jupiter, Venus, Saturn, Rahu and Ketu. Uranus, Neptune and Pluto are not part of the classical system.",
        ],
      },
      {
        heading: "Which one should you use?",
        paragraphs: [
          "Use the system your family or community already follows, especially for weddings and naming, so everyone is reading the same chart. If you consult a Western astrologer and a Jyotishi, tell each which system the other used so nobody is confused by the different signs.",
        ],
      },
    ],
    faqs: [
      {
        q: "Why is my Vedic sign different from my Western sign?",
        a: "The Vedic (sidereal) zodiac is tied to the stars, while the Western (tropical) zodiac is tied to the seasons. They are about 24 degrees apart today, so your sign often shifts back by one.",
      },
      {
        q: "Is a moon sign more important than a sun sign in Indian astrology?",
        a: "In Vedic practice the moon sign (rashi) and nakshatra are used for most everyday questions, matching and naming, while Western horoscopes are built around the sun sign.",
      },
    ],
  },
  {
    slug: "kundli-matching-for-marriage",
    emoji: "💍",
    title: "Kundli matching for marriage: the 36 gunas explained",
    description:
      "How Ashtakoota guna milan works, what the 36 points mean, why 18 is the usual threshold, and what Manglik dosha and Nadi dosha are.",
    intro: [
      "When a rishta comes in, many families ask for the boy's and girl's birth details before anything else. The match they run is usually Ashtakoota guna milan — eight checks that add up to 36 points.",
    ],
    sections: [
      {
        heading: "The eight kootas and their points",
        points: [
          "Varna — 1 point: temperament and outlook.",
          "Vashya — 2 points: mutual attraction and influence.",
          "Tara — 3 points: birth-star compatibility and wellbeing.",
          "Yoni — 4 points: physical and instinctive compatibility.",
          "Graha Maitri — 5 points: friendship between the moon-sign lords, often read as mental harmony.",
          "Gana — 6 points: nature (deva, manushya or rakshasa).",
          "Bhakoot — 7 points: the relative position of the two moon signs.",
          "Nadi — 8 points: the heaviest koota, traditionally linked to health and children.",
        ],
      },
      {
        heading: "What the score means",
        paragraphs: [
          "Traditionally 18 of 36 is treated as the minimum for an acceptable match, and higher scores as more favourable. Astrologers also look at doshas the score doesn't capture — most commonly Manglik (Mangal) dosha, where Mars sits in certain houses, and Nadi dosha, where both charts share the same nadi.",
          "Many astrologers say a dosha can be cancelled by other factors in the charts, so a low score or a dosha is a reason to look at both full charts, not an automatic no.",
        ],
      },
      {
        heading: "Before you ask for a match",
        points: [
          "Collect both people's date, exact time and place of birth — the time decides the nakshatra on borderline days.",
          "Agree within the family which astrologer or software everyone will trust, so you don't shop for a better score.",
          "Remember compatibility of values, goals and families matters more day to day than any number.",
        ],
      },
    ],
    faqs: [
      {
        q: "How many gunas are needed for marriage?",
        a: "Traditionally at least 18 out of 36 gunas is considered acceptable in Ashtakoota matching; families and astrologers then review doshas and the full charts.",
      },
      {
        q: "What is Manglik dosha?",
        a: "It is said to be present when Mars occupies certain houses of the birth chart. Many astrologers check whether both partners are Manglik or whether other placements cancel it before advising.",
      },
      {
        q: "Can kundli matching be done without a birth time?",
        a: "A rough match is possible from the moon sign, but the nakshatra can change during a day, so astrologers prefer an exact time.",
      },
    ],
  },
  {
    slug: "how-to-choose-an-astrologer",
    emoji: "🔎",
    title: "How to choose an astrologer and avoid astrology scams",
    description:
      "Questions to ask before you pay an astrologer or pandit, the red flags of “love back” and black-magic scams, and where to report fraud in the US and Canada.",
    intro: [
      "Most astrologers in our community are honest people continuing a family tradition. A small number prey on people at their lowest — after a breakup, a job loss or an illness. A few checks protect you and your parents.",
    ],
    sections: [
      {
        heading: "Ask before you book",
        points: [
          "What tradition do you follow (Vedic/Jyotish, KP, Lal Kitab, Western, numerology)?",
          "What exactly is included in the fee — a written report, a call, follow-up questions?",
          "What is the total cost, in writing, before the reading starts?",
          "Will you need my birth details only, or anything else? (You should never need to share bank or ID details.)",
        ],
      },
      {
        heading: "Red flags",
        points: [
          "Fear first: you are told of a curse, black magic or “nazar” that only they can remove.",
          "Guarantees: “get your love back in 24 hours”, guaranteed visa, job or court result.",
          "The price keeps rising — every remedy needs another, more expensive puja.",
          "Pressure to pay by gift card, wire, crypto or Zelle to a stranger, or to keep it secret from family.",
          "Gemstones or yantras you can only buy from them, at a price you can't compare.",
        ],
      },
      {
        heading: "If you've been cheated",
        paragraphs: [
          "Stop paying, keep every message and receipt, and tell someone you trust. In the US, report it to the FTC at reportfraud.ftc.gov; in Canada, to the Canadian Anti-Fraud Centre. You can also warn the community with a consumer alert on GoDesi — anonymously if you prefer.",
        ],
      },
    ],
    faqs: [
      {
        q: "Is it a scam if an astrologer says I have black magic on me?",
        a: "A claim of black magic or a curse followed by a demand for money for its removal is a classic scam pattern. Don't pay under pressure, and talk to family first.",
      },
      {
        q: "Where can I report an astrology scam?",
        a: "In the US, at reportfraud.ftc.gov (and your state attorney general); in Canada, to the Canadian Anti-Fraud Centre. Keep screenshots and payment records.",
      },
    ],
  },
  {
    slug: "birth-details-for-a-kundli",
    emoji: "🕰️",
    title: "Birth details for a kundli: time, place and time zones",
    description:
      "What an astrologer needs to cast your janam kundli, how to find your exact birth time, and why daylight saving and time zones trip people up abroad.",
    intro: [
      "A kundli (birth chart) is a map of the sky at the moment you were born, seen from where you were born. Three details build it: date, exact time and place.",
    ],
    sections: [
      {
        heading: "Finding your exact birth time",
        points: [
          "Hospital birth records or a long-form birth certificate often carry the time; US short-form certificates may not.",
          "Ask the elders — many families noted the time for the naming ceremony.",
          "An old handwritten kundli from India will usually show the time and the lagna it used.",
        ],
      },
      {
        heading: "Time zones and daylight saving",
        paragraphs: [
          "Give the local clock time where you were born, plus the city — good software converts it. Children born in the US or Canada during daylight saving time are a common source of one-hour errors, so mention it if you're unsure.",
        ],
      },
      {
        heading: "Don't know the time at all?",
        paragraphs: [
          "Some astrologers offer birth-time rectification: they work backwards from major life events such as marriage, moves and births of children. Ask how they do it and what it costs before you agree.",
        ],
      },
    ],
    faqs: [
      {
        q: "How accurate does my birth time need to be?",
        a: "The ascendant changes roughly every two hours and finer divisional charts change much faster, so the closer the better — within a few minutes is ideal.",
      },
      {
        q: "Should I give my birth time in IST if I was born in India?",
        a: "Give the local time and the city of birth; the astrologer or software handles the time-zone conversion.",
      },
    ],
  },
  {
    slug: "muhurat-for-weddings-and-griha-pravesh",
    emoji: "🪔",
    title:
      "Muhurat abroad: picking a date for weddings, griha pravesh and openings",
    description:
      "How a shubh muhurat is chosen from the panchang, why it must be worked out for your US or Canadian city, and how to fit it around venue bookings.",
    intro: [
      "For a wedding, a griha pravesh (house warming), a mundan or a new shop, many families want an auspicious time — a shubh muhurat. Abroad, the catch is that the muhurat printed in an Indian calendar is for India, not for New Jersey or Toronto.",
    ],
    sections: [
      {
        heading: "What a muhurat is built from",
        paragraphs: [
          "Pandits read the panchang, the Hindu almanac, whose five limbs are tithi (lunar day), vara (weekday), nakshatra, yoga and karana. They then avoid inauspicious windows such as Rahu Kaal and match the event to suitable nakshatras.",
        ],
      },
      {
        heading: "Make it local",
        points: [
          "Tithis and nakshatras begin at the same moment worldwide but fall on different local clock times, so the date can shift by a day.",
          "Ask for the muhurat in your city's local time, with daylight saving applied.",
          "Book the pandit at the same time as the venue — popular wedding muhurats fill both fast.",
        ],
      },
      {
        heading: "When the perfect date isn't possible",
        paragraphs: [
          "Venues, visas and work leave often decide the weekend. Many pandits will pick the best window on the date you can actually do, for example for the pheras or the first entry into the home, rather than moving the whole event.",
        ],
      },
    ],
    faqs: [
      {
        q: "Can I use an Indian panchang muhurat for a wedding in the US?",
        a: "Not directly — the timings must be recalculated for the US city, which can shift the time and sometimes the date.",
      },
      {
        q: "What is griha pravesh muhurat?",
        a: "It is the auspicious time chosen for the first formal entry into a new home, usually with a puja; families typically ask a pandit to set it for their local time.",
      },
    ],
  },
  {
    slug: "rahu-kaal-explained",
    emoji: "⏳",
    title: "Rahu Kaal explained: how to work it out where you live",
    description:
      "What Rahu Kaal is, the weekday order, and how to calculate it from your own city's sunrise and sunset instead of using India's timings.",
    intro: [
      "Rahu Kaal is a daily window of roughly an hour and a half that many families avoid for starting something new — signing papers, a first drive, a journey or an opening. It is different every day and every place.",
    ],
    sections: [
      {
        heading: "The weekday order",
        paragraphs: [
          "Split the time from sunrise to sunset into eight equal parts. Rahu Kaal is one of those parts, depending on the weekday:",
        ],
        points: [
          "Monday — 2nd part",
          "Tuesday — 7th part",
          "Wednesday — 5th part",
          "Thursday — 6th part",
          "Friday — 4th part",
          "Saturday — 3rd part",
          "Sunday — 8th part",
        ],
      },
      {
        heading: "A worked example",
        paragraphs: [
          "With a 6:00 am sunrise and 6:00 pm sunset, each part is 90 minutes, so Monday's Rahu Kaal is 7:30–9:00 am and Sunday's is 4:30–6:00 pm. In a US winter with a 7:10 am sunrise and 4:40 pm sunset, each part is only about 71 minutes and every window moves.",
        ],
      },
      {
        heading: "Using it sensibly",
        paragraphs: [
          "Families who follow it usually avoid only beginnings during Rahu Kaal; work already under way carries on. If a flight or appointment falls inside it, many simply note it and go.",
        ],
      },
    ],
    faqs: [
      {
        q: "Is Rahu Kaal the same time every day?",
        a: "No. It depends on the weekday and on your local sunrise and sunset, so it changes daily and from city to city.",
      },
      {
        q: "Can I use Indian Rahu Kaal timings in America?",
        a: "No — work it out from your own city's sunrise and sunset, or use a panchang set to your location.",
      },
    ],
  },
  {
    slug: "navagraha-the-nine-planets",
    emoji: "🪐",
    title: "Navagraha: the nine planets of Vedic astrology",
    description:
      "A plain guide to the nine grahas — Surya, Chandra, Mangal, Budh, Guru, Shukra, Shani, Rahu and Ketu — what each is traditionally linked to, and navagraha puja.",
    intro: [
      "Many temples in North America have a navagraha shrine with nine small idols facing different directions. These are the nine grahas that every kundli is read through.",
    ],
    sections: [
      {
        heading: "The nine and what they are traditionally linked to",
        points: [
          "Surya (Sun) — soul, father, authority.",
          "Chandra (Moon) — mind, mother, emotions.",
          "Mangal (Mars) — energy, courage, property, siblings.",
          "Budh (Mercury) — speech, intellect, business.",
          "Guru / Brihaspati (Jupiter) — wisdom, teachers, children, growth.",
          "Shukra (Venus) — love, marriage, comfort, the arts.",
          "Shani (Saturn) — discipline, hard work, delay and lessons.",
          "Rahu — the moon's north node: ambition, foreign lands, obsession.",
          "Ketu — the moon's south node: detachment and spirituality.",
        ],
      },
      {
        heading: "Rahu and Ketu are not planets",
        paragraphs: [
          "They are the two points where the moon's path crosses the sun's path — the points where eclipses happen. Jyotish treats them as shadow grahas with as much weight as the visible planets.",
        ],
      },
      {
        heading: "Navagraha puja",
        paragraphs: [
          "Families often do a navagraha puja or homam before a wedding, a griha pravesh or a hard period. Most temples and many pandits on GoDesi offer it; ask what is included and the dakshina in advance.",
        ],
      },
    ],
    faqs: [
      {
        q: "Why does Vedic astrology have nine planets?",
        a: "The navagraha are the Sun, Moon, five visible planets and the two lunar nodes, Rahu and Ketu. The outer planets discovered by telescope are not part of the classical system.",
      },
    ],
  },
  {
    slug: "sade-sati-saturn",
    emoji: "🌗",
    title: "Sade Sati: Saturn's seven and a half years, without the fear",
    description:
      "What Shani's Sade Sati is, how it is worked out from your moon sign, why it lasts about seven and a half years, and how families traditionally respond.",
    intro: [
      "Few phrases worry desi parents more than “Sade Sati chal rahi hai.” It sounds ominous, but it is a predictable transit that everyone goes through roughly every 30 years.",
    ],
    sections: [
      {
        heading: "How it is worked out",
        paragraphs: [
          "Saturn takes about two and a half years to cross each sign. Sade Sati is the period when Saturn moves through the sign before your moon sign, your moon sign itself, and the sign after it — three signs, about seven and a half years.",
        ],
      },
      {
        heading: "How it is traditionally read",
        paragraphs: [
          "Saturn is the graha of discipline and consequences, so Sade Sati is described as a time of hard work, responsibility and slow results rather than disaster. Many astrologers say its effect depends heavily on Saturn's placement in your own chart.",
        ],
      },
      {
        heading: "Common practices",
        points: [
          "Visiting a Shani or Hanuman temple on Saturdays.",
          "Charity and service, especially to elders and workers.",
          "Lighting a sesame-oil lamp, a common family tradition.",
          "Be wary of anyone selling an expensive “Sade Sati removal” package.",
        ],
      },
    ],
    faqs: [
      {
        q: "How long does Sade Sati last?",
        a: "About seven and a half years — Saturn spends roughly two and a half years in each of the three signs around your moon sign.",
      },
      {
        q: "Is Sade Sati always bad?",
        a: "Astrologers describe it as a demanding period of effort and lessons; how it plays out is said to depend on the rest of the chart.",
      },
    ],
  },
  {
    slug: "nakshatras-and-baby-names",
    emoji: "👶",
    title: "Nakshatras and baby names: picking a name by birth star",
    description:
      "What the 27 nakshatras are, how a baby's birth star and pada give the first syllable of a traditional name, and how families combine it with modern names.",
    intro: [
      "When a baby is born, many grandparents ask one question before the naming ceremony: which nakshatra? The birth star traditionally suggests the first sound of the name.",
    ],
    sections: [
      {
        heading: "27 lunar mansions",
        paragraphs: [
          "The zodiac is divided into 27 nakshatras of 13°20′ each, from Ashwini to Revati. The nakshatra the moon occupies at birth is your janma nakshatra, and each is split into four padas (quarters).",
        ],
      },
      {
        heading: "From pada to syllable",
        paragraphs: [
          "Each pada is linked to a syllable — for example the four padas of Ashwini are Chu, Che, Cho and La. A pandit tells the family the baby's nakshatra and pada, and names starting with that sound are considered auspicious.",
        ],
      },
      {
        heading: "Mixing tradition with life abroad",
        points: [
          "Many families keep the nakshatra name as a pet name or a middle name.",
          "Check how the name sounds and is spelled in English before the birth certificate is filed.",
          "The naming ceremony (namkaran) is usually held on the 11th or 12th day, or whenever the family can gather.",
        ],
      },
    ],
    faqs: [
      {
        q: "How do I find my baby's nakshatra?",
        a: "Give a pandit or astrologer the exact time and place of birth; the moon's position at that moment gives the nakshatra and pada.",
      },
    ],
  },
  {
    slug: "vastu-for-us-homes",
    emoji: "🏠",
    title: "Vastu for US and Canadian homes: what's practical",
    description:
      "Vastu Shastra basics for buying or renting abroad — entrance, puja room, kitchen and bedroom directions — and simple adjustments that don't need a contractor.",
    intro: [
      "Homes in North America are built for the lot and the street, not for Vastu. Families buying a house often ask whether a south-facing door or a northeast garage is a deal-breaker. Usually, it isn't.",
    ],
    sections: [
      {
        heading: "The directions families look at",
        points: [
          "Northeast (Ishan) — preferred for the puja space; kept clean and light.",
          "Southeast (Agni) — preferred for the kitchen and stove.",
          "Southwest — preferred for the main bedroom.",
          "Main entrance — east or north-facing doors are traditionally favoured.",
        ],
      },
      {
        heading: "Adjustments without remodelling",
        points: [
          "Set up the mandir in the northeast corner of any room if a whole room isn't possible.",
          "Face east while cooking or praying where the layout allows.",
          "Keep the entrance bright, uncluttered and well maintained.",
          "Renters: use furniture placement, not structural changes.",
        ],
      },
      {
        heading: "Buying a home",
        paragraphs: [
          "Decide your must-haves with your realtor before house-hunting, and have a Vastu consultant look at the floor plan before you make an offer, not after closing. Be cautious of anyone who says a home needs thousands of dollars of “corrections.”",
        ],
      },
    ],
    faqs: [
      {
        q: "Is a south-facing house bad in Vastu?",
        a: "Traditionally east and north entrances are favoured, but many Vastu consultants say a south-facing home can be fine depending on the exact door position and layout.",
      },
      {
        q: "Where should the puja room be in a US home?",
        a: "The northeast is traditionally preferred; if that isn't practical, a clean shelf or corner in the northeast of the living room is a common solution.",
      },
    ],
  },
];

export function astrologyGuide(slug: string) {
  return ASTROLOGY_GUIDES.find((guide) => guide.slug === slug) ?? null;
}
