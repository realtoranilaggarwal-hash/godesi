/** One-off: posts GoDesi's own phone sales caller job. Safe to re-run. */
import { db } from "../src/lib/db";

const SLUG = "phone-sales-caller-work-from-home";
const POSTER_EMAIL = "godesibiz@gmail.com";

async function main() {
  if (await db.job.findUnique({ where: { slug: SLUG } })) {
    console.log("already posted");
    return;
  }
  const poster = await db.user.findUniqueOrThrow({ where: { email: POSTER_EMAIL } });
  await db.job.create({
    data: {
      slug: SLUG,
      posterId: poster.id,
      title: "Phone sales caller — work from home",
      description: `Call desi businesses that are already listed on GoDesi (many of them already pay for print ads) and help them claim their free business card and move up to a Featured plan.

You work from home on your own hours. We give you the GoDesi call handbook: ready-made call scripts, answers to the questions owners ask, follow-up WhatsApp and email messages, and a daily call list with each business's name, category, website and phone.

Pay: $200 a month plus 10% commission on every sale you close. The target is 10 sales a month.`,
      requirements: [
        "Make 10 sales a month",
        "Clear, friendly English on the phone (Hindi, Gujarati or Punjabi a plus)",
        "A phone and a laptop or tablet with internet",
        "Follow the call handbook and log every call",
      ].join("\n"),
      workType: "PART_TIME",
      remote: true,
      payType: "BASE_PLUS_COMMISSION",
      payMinor: 20000,
      commissionPct: 10,
    },
  });
  console.log("posted");
}

main().finally(() => db.$disconnect());
