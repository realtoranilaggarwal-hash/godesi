/**
 * GoDesi.com News (Immigration & visas): the State Department's November 30,
 * 2026 passport revocations for $10,000+ in unpaid child support, with what to
 * do and not do. Re-runnable: updates the story in place.
 *
 *   DATABASE_URL=... npx tsx scripts/post-passport-child-support-2026.ts
 */
import { PrismaClient } from "@prisma/client";
import { newsPath } from "../src/lib/newsLinks";

const db = new PrismaClient();
const AUTHOR_ID = "cms24edsq0000t9gk48f24h5h";
const GUID = "godesi-news-passport-child-support-10k-2026-11-30";

const SUMMARY = `From Monday, November 30, 2026, the U.S. Department of State will start revoking the passports of Americans who owe $10,000 or more in past-due child support. People in this group who apply for a new passport can also be refused.

This is the seventh round of a crackdown that began in May 2026. It started with parents who owed $100,000 or more and has stepped down since then. The next rounds could go lower: the law already lets the State Department refuse or revoke a passport once child-support debt is more than $2,500.

Why this matters to our community
Many Desi families are U.S. citizens who travel to India, Pakistan, Bangladesh, Nepal or Sri Lanka for weddings, funerals, property and family visits. A revoked passport cannot be used, even if you pay the debt afterwards. If you are abroad when it is revoked, you may only get a limited passport to fly straight back to the U.S.

Who is affected
- U.S. citizens (including naturalized citizens) who owe $10,000 or more in child-support arrears that a state has reported to the federal government (HHS).
- It is not about green cards, visas or OCI cards, and it is not about immigration status. It is about U.S. passports and child-support debt.

✅ What to do
- If you pay or receive child support, check your balance now with your state child-support agency (in New Jersey: njchildsupport.gov).
- If you owe, contact the state (or every state) where you owe and pay, or agree a payment plan, before you book travel.
- Keep receipts and written confirmations of every payment.
- Allow time: after you pay, the state tells HHS and HHS tells the State Department. This takes at least 2–3 weeks before a passport can be issued.
- Watch your email and mail: the State Department sends revocation notices to the email or address on your last passport application.
- If you think the amount is wrong, ask the state agency for a review. Disputes are handled by the state, not by the State Department.
- If you are overseas and get a notice, contact the state where you owe and the nearest U.S. embassy or consulate.

❌ What not to do
- Don't plan an international trip, especially a December wedding or holiday visit, until your balance is cleared and confirmed.
- Don't try to travel on a revoked passport: it is no longer valid, even after you pay.
- Don't ignore a notice or wait until the airport.
- Don't pay anyone who calls, texts or WhatsApps promising to "fix" or "unblock" your passport. Pay only your state child-support agency through its official website or office.
- Don't share your passport, Social Security or bank details with unknown callers. Scammers follow every news story like this.

A separate rule to know
Americans with "seriously delinquent" federal tax debt certified by the IRS can also be refused a passport or have it revoked. If you owe the IRS a large amount, set up a payment plan with the IRS before you travel.

Official help
- State Department passport help line: 1-877-487-2778 (TDD/TTY 1-888-874-7793)
- State Department page: travel.state.gov → Passports → Legal matters → Child support
- Your state child-support enforcement agency

This article is general information, not legal advice. For your own case, speak to your state child-support agency or a family-law attorney. Find attorneys and immigration professionals on GoDesi: https://godesi.com/professionals

Share this with friends and family who travel. It could save someone a missed flight home.

Sources: U.S. Department of State (travel.state.gov, May 26, 2026; state.gov release, May 7, 2026), Oregon Department of Justice (November 13, 2026), Puerto Rico ASUME (November 23, 2026).

#Passport #ChildSupport #TravelAlert #Immigration #DesiAmericans #GoDesiNews`;

async function main() {
  const data = {
    title:
      "Passport alert: U.S. starts revoking passports over $10,000+ in unpaid child support from November 30 — what to do and not do",
    summary: SUMMARY,
    source: "GoDesi.com News",
    topic: "immigration",
    category: "Immigration",
    country: "USA",
    happenedAt: new Date("2026-11-30T09:00:00-05:00"),
    publishedAt: new Date(),
    sourceType: "News",
    sourceUrl:
      "https://travel.state.gov/en/passports/contact-support/legal-matters/child-support.html",
    photoUrls: [] as string[],
    featured: true,
    status: "PUBLISHED" as const,
    submittedById: AUTHOR_ID,
  };
  const story = await db.newsItem.upsert({
    where: { guid: GUID },
    create: { guid: GUID, ...data, link: "", declaredAt: new Date() },
    update: data,
  });
  await db.newsItem.update({ where: { id: story.id }, data: { link: newsPath(story) } });
  console.log(`https://godesi.com${newsPath(story)}`);
}

main().finally(() => db.$disconnect());
