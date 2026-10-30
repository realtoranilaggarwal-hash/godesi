import { db } from "@/lib/db";
import { uniqueViolation } from "@/lib/actions";

/** Rotating question bank — one is picked per UTC day, cycling forever. */
const QUESTIONS: { text: string; options: string[] }[] = [
  { text: "Chai or filter coffee?", options: ["☕ Chai", "🥤 Filter coffee", "Both!", "Neither"] },
  { text: "Best garba-night snack?", options: ["Fafda-jalebi", "Samosa", "Vada pav", "Maggi"] },
  { text: "Diwali or Holi?", options: ["🪔 Diwali", "🎨 Holi", "Love both", "Neither"] },
  { text: "Best desi dessert?", options: ["Gulab jamun", "Rasmalai", "Jalebi", "Kheer"] },
  { text: "Veg biryani counts as biryani?", options: ["Of course!", "Only meat biryani", "It's pulao, fine", "No opinion"] },
  { text: "Best Bollywood era?", options: ["70s–80s classics", "The 90s", "2000s", "Today"] },
  { text: "WhatsApp family groups?", options: ["Muted forever", "Read everything", "Only festival wishes", "Left them all 😅"] },
  { text: "Best street-food city?", options: ["Mumbai", "Delhi", "Ahmedabad", "Hyderabad"] },
  { text: "Pani puri puri: suji or atta?", options: ["Suji", "Atta", "Either works", "Only the pani matters"] },
  { text: "Sunday brunch?", options: ["Desi breakfast", "American diner", "Skip it, sleep", "Brunch buffet"] },
  { text: "Bargaining at desi stores?", options: ["Always", "Sometimes", "Never", "I'm the shopkeeper 😄"] },
  { text: "Festival shopping?", options: ["Online", "Oak Tree Road", "India trips", "Last-minute panic"] },
  { text: "Desi wedding — 3 days or 3 hours?", options: ["3 days, full masti", "3 hours is enough", "Destination only", "Just send food"] },
  { text: "Cricket or Bollywood gossip?", options: ["🏏 Cricket", "🎬 Bollywood", "Both daily", "Neither"] },
  { text: "Best chai-time biscuit?", options: ["Parle-G", "Marie", "Rusks", "Namkeen instead"] },
  { text: "Matchmaking — how did you/should you meet?", options: ["Family intro", "Met on our own", "App", "Rishta profile 😏"] },
  { text: "Leftover Diwali sweets — how long?", options: ["Gone by morning", "A week", "Still in the freezer", "Gave them away"] },
  { text: "Best festival food?", options: ["Modak", "Gujiya", "Bhajiya", "Sheer khurma"] },
  { text: "Do you keep fasts?", options: ["Yes, regularly", "Only festivals", "Sometimes", "Never"] },
  { text: "Favorite lassi?", options: ["Sweet", "Salted", "Mango", "Masala"] },
  { text: "Train snacks for India trips?", options: ["Theplas", "Homemade parathas", "Station samosas", "Chips only"] },
  { text: "Garba or Bhangra?", options: ["🥁 Garba", "💃 Bhangra", "Both!", "Just watching"] },
  { text: "Weekend plan tonight?", options: ["Family dinner", "Garba night", "Movie + takeout", "Rest 😴"] },
  { text: "Home puja?", options: ["Daily", "Festivals only", "Occasionally", "At the temple"] },
  { text: "Video calls with family in India?", options: ["WhatsApp", "FaceTime", "Google Meet", "We just text"] },
  { text: "Best compliment?", options: ["'You look fresh!'", "'Did you lose weight?'", "'Your chai is best'", "'Come for dinner!'"] },
  { text: "Mango season — your pick?", options: ["Alphonso", "Kesar", "Any mango works", "Pickles & aamras"] },
  { text: "Festival outfit shopping?", options: ["New every year", "Repeat favourites", "Tailor-made", "Borrowed 😄"] },
  { text: "Best monsoon food?", options: ["Pakoras + chai", "Maggie", "Bhutta (corn)", "Khichdi"] },
  { text: "NRI house party must-have?", options: ["Biryani potluck", "Antakshari", "Bollywood playlist", "Carrom board"] },
];

const DAY_MS = 24 * 60 * 60 * 1000;

function utcDayStart(now = new Date()) {
  return new Date(Math.floor(now.getTime() / DAY_MS) * DAY_MS);
}

/** Today's question, creating the row on the day's first read. */
export async function todaysPoll() {
  const day = utcDayStart();
  const existing = await db.pollQuestion.findUnique({ where: { day } });
  if (existing) return existing;
  const pick = QUESTIONS[Math.floor(day.getTime() / DAY_MS) % QUESTIONS.length];
  try {
    return await db.pollQuestion.create({
      data: { day, text: pick.text, options: pick.options },
    });
  } catch (error) {
    if (!uniqueViolation(error)) throw error;
    return db.pollQuestion.findUniqueOrThrow({ where: { day } });
  }
}

export type PollState = {
  id: string;
  text: string;
  options: string[];
  tallies: number[];
  total: number;
  /** Index the current member picked, or null. */
  myChoice: number | null;
};

export async function pollState(userId: string | null): Promise<PollState> {
  const question = await todaysPoll();
  const votes = await db.pollVote.groupBy({
    by: ["choice"],
    where: { questionId: question.id },
    _count: true,
  });
  const tallies = question.options.map(
    (_, index) => votes.find((row) => row.choice === index)?._count ?? 0,
  );
  const mine = userId
    ? await db.pollVote.findUnique({
        where: { questionId_userId: { questionId: question.id, userId } },
      })
    : null;
  return {
    id: question.id,
    text: question.text,
    options: question.options,
    tallies,
    total: votes.reduce((sum, row) => sum + row._count, 0),
    myChoice: mine?.choice ?? null,
  };
}
