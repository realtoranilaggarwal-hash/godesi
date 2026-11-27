/** Anil's palm-reading offer and the free palm-reading guide at /astrology/palmistry. */
export const PALM_READING = {
  href: "/astrology/palmistry",
  price: "$10 per hand",
  whatsappDisplay: "(732) 983-7958",
  whatsapp: `https://wa.me/17329837958?text=${encodeURIComponent(
    "Hi Anil, I would like to book a palm reading ($10 per hand). I found you on GoDesi.com.",
  )}`,
  chart: "/astrology/palm-reading-chart.jpg",
  chartSmall: "/astrology/palm-reading-chart-600w.jpg",
  pdf: "/astrology/godesi-palm-reading-guide.pdf",
};

export const PALM_SECTIONS: { heading: string; points: string[] }[] = [
  {
    heading: "1. Hand shape",
    points: [
      "Earth hand — square palm, short fingers: practical, steady, hands-on.",
      "Air hand — square palm, long fingers: curious, talkative, a thinker.",
      "Fire hand — long palm, short fingers: energetic, bold, ambitious.",
      "Water hand — long palm, long fingers: sensitive, creative, intuitive.",
    ],
  },
  {
    heading: "2. Fingers and thumb",
    points: [
      "Index finger (Jupiter): leadership, ambition and confidence.",
      "Middle finger (Saturn): responsibility, discipline and patience.",
      "Ring finger (Apollo): creativity, recognition and a sense of beauty.",
      "Little finger (Mercury): communication, business and negotiation.",
      "Thumb: the top section shows will power, the lower section logic. A thumb that opens wide shows independence, generosity and self-confidence.",
      "Fingertips: rounded tips suggest an adaptable, balanced nature. Fingerprints are usually loops or whorls.",
    ],
  },
  {
    heading: "3. The six major lines",
    points: [
      "Life line — curves around the thumb. Long, clear and deep means good vitality and strong attachment to family. It does not tell you how long you live.",
      "Head line — runs across the middle of the palm. Long and sloping means an imaginative mind and a planner full of ideas.",
      "Heart line — the top line under the fingers. Long and curved means emotional depth, loyalty and high standards in love.",
      "Fate line — rises from the lower palm towards the middle finger. Breaks or changes along it often match career changes and self-made progress.",
      "Sun (Apollo) line — runs up to the ring finger. When present, recognition tends to come gradually, with a desire to be appreciated for your work.",
      "Mercury line — fine vertical lines under the little finger: good communication, business sense and a helping nature.",
    ],
  },
  {
    heading: "4. The mounts",
    points: [
      "Jupiter (under the index finger): ambition and leadership.",
      "Saturn (under the middle finger): responsibility and a serious nature.",
      "Apollo (under the ring finger): creativity, fame and talent.",
      "Mercury (under the little finger): communication, business and intelligence.",
      "Venus (base of the thumb): love, energy, passion and family warmth.",
      "Moon (outer lower palm): imagination, intuition, travel and curiosity.",
      "A full, firm mount means that quality is strong in you; a flat one means it is quieter.",
    ],
  },
  {
    heading: "5. Special marks",
    points: [
      "Triangle: intelligence and protection.",
      "Square: protection in difficult times.",
      "Star: sudden opportunities or events.",
      "Cross: obstacles that you overcome.",
      "Island: a temporary setback or stress.",
      "Branches rising up a line: ambition and growth; branches falling: energy spread thin or a period of struggle.",
    ],
  },
  {
    heading: "6. The traditional life pattern",
    points: [
      "Early life (0–25): learning, caution and family influence.",
      "Development (25–40): changes, self-discovery and building a foundation.",
      "Maturity (40–60): career growth, recognition and more control over life.",
      "Later life (60+): mentor and guide, experience, legacy and stability.",
      "Compare both hands: traditionally the non-dominant hand shows what you were born with, and the dominant hand shows what you have made of it.",
    ],
  },
];
