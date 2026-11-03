/**
 * Publishes original NRI life guides on the GoDesi blog (Return to India, OCI,
 * taxes, sending money, H-1B/green card, Little India neighbourhoods). Facts
 * point to the official source; shopping links carry the Amazon tag.
 * Re-runnable: an existing slug is left as it is.
 *
 *   DATABASE_URL=... npx tsx scripts/post-nri-guides.ts
 */
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();
const AUTHOR_ID = "cms24edsq0000t9gk48f24h5h";
const TAG = "godesi03-20";
const amazon = (q: string) =>
  `https://www.amazon.com/s?k=${encodeURIComponent(q).replace(/%20/g, "+")}&tag=${TAG}`;
const AMAZON_NOTE =
  "As an Amazon Associate GoDesi earns from qualifying purchases. It costs you nothing extra.";
const NOT_ADVICE =
  "This guide is general information, not legal or tax advice. Rules change; check the official pages linked above or ask a licensed professional for your situation.";

const GUIDES: {
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  tags: string[];
}[] = [
  {
    slug: "moving-back-to-india-from-the-usa-checklist",
    title: "Moving back to India from the USA: a practical checklist",
    excerpt:
      "Bank accounts, taxes, 401(k), Social Security, OCI, shipping and schools: what to sort out before you return to India for good.",
    body: `Moving back to India (many people call it R2I) is a bigger project than the flight. Families who plan it 6 to 12 months ahead save money and stress. Use this list in order.

1. Decide the date and work back from it
School terms, a job offer, a lease ending or a parent's health usually set the date. Pick a target month, then plan everything else around it.

2. Bank accounts
As an NRI you may hold NRE and NRO accounts in India. Once you return and become resident, Indian banks expect them to be changed to resident accounts, and NRE money can be moved into an RFC (Resident Foreign Currency) account. Tell your bank before you move, and keep one US bank account open for US deposits such as tax refunds or Social Security.

3. Taxes in both countries
Your last US year is often a split year. In India, returning NRIs may qualify as RNOR (Resident but Not Ordinarily Resident) for a period, which affects whether foreign income is taxed in India. A CPA who handles both US and Indian returns is worth it this year. If you keep US accounts you may still need to file US forms; see our guide on NRI taxes.

4. 401(k), IRA and Social Security
You don't have to cash out a 401(k) or IRA when you leave; early withdrawal usually means tax plus a penalty. Social Security can be paid to you in India; check the [Social Security payments abroad tool](https://www.ssa.gov/international/payments.html).

5. Documents
Get apostilled copies of birth and marriage certificates, school transcripts and degrees before you leave. They are much harder to get from India. US-born children need OCI cards; see our OCI guide.

6. Shipping or selling
Most families sell cars and big furniture, and ship only what they love. Note that most US appliances are 110V, and India is 230V. Small electronics may need a [step-down voltage converter](${amazon("step down voltage converter 220v to 110v")}) or [India plug adapters](${amazon("india plug adapter type d")}). Good [large checked luggage](${amazon("large checked luggage set")}) often beats shipping for the last load.

7. Health insurance
Buy an Indian health policy before you need it, because waiting periods apply. Keep US cover until the day you fly.

8. Your US home
Selling or renting it out? A local agent can help. Find desi realtors on GoDesi: [real estate agents](https://godesi.com/categories/real-estate).

More GoDesi tools: [USD to INR rate today](https://godesi.com/usd-to-inr) | [Travel agents](https://godesi.com/categories/travel)

${AMAZON_NOTE}

${NOT_ADVICE}`,
    tags: ["nri", "return-to-india", "guide"],
  },
  {
    slug: "oci-card-guide-for-us-citizens-of-indian-origin",
    title: "OCI card for US citizens of Indian origin: how it works",
    excerpt:
      "What an OCI card lets you do, who can get one, the documents you need and the common mistakes that delay applications.",
    body: `The Overseas Citizen of India (OCI) card is a lifelong visa for people of Indian origin who hold a foreign passport, and for their foreign spouses in many cases. Most US citizens of Indian origin, and their US-born children, use OCI to visit India without applying for a visa each time.

What OCI gives you
- Multiple-entry, lifelong visa to visit India for any length of stay.
- You can live, study and work in India, and own residential and commercial property.
- You can't vote, hold some government jobs, or buy agricultural or plantation land.

Who can apply
People who were Indian citizens, or whose parents or grandparents were, and their spouses in many cases. Children born in the US to Indian parents are the most common applicants. The exact rules are on the official [OCI services portal](https://ociservices.gov.in).

Steps
1. Fill the online form on [ociservices.gov.in](https://ociservices.gov.in) and upload a photo and signature in the required size.
2. If you held an Indian passport and became a US citizen, you need a renunciation (surrender) certificate first. This is the most common cause of delays.
3. Submit the printed form and documents through the service centre listed on your Indian consulate's website. Consulates in the US: [New York](https://www.indiainnewyork.gov.in), [Washington DC](https://www.indianembassyusa.gov.in), plus Chicago, Houston, San Francisco, Atlanta and Seattle.
4. Track the status online. Keep your old passport and OCI card together when you travel.

New passport?
When you get a new US passport, the OCI rules say whether you must re-issue the card or just upload the new passport details online. This depends on your age. Check the current rule on the portal before you book a trip.

Travel tip
Airlines check your OCI card at the counter. Carry the card and the passport it is linked to. A [passport and document organizer](${amazon("family passport holder document organizer")}) keeps the whole family's papers together.

Need help? Many desi travel and visa agents handle OCI paperwork: [Visa & passport services on GoDesi](https://godesi.com/categories/travel).

${AMAZON_NOTE}

${NOT_ADVICE}`,
    tags: ["nri", "oci", "india-travel", "guide"],
  },
  {
    slug: "nri-taxes-fbar-fatca-indian-bank-accounts",
    title: "NRI taxes in the USA: FBAR, FATCA and your Indian bank accounts",
    excerpt:
      "If you live in the US and have money in India, these are the US reporting rules most desi families need to know.",
    body: `If you are a US citizen, green card holder or US tax resident (most H-1B workers are), the US taxes your worldwide income. That includes interest, rent and gains in India. The US also wants to know about your Indian accounts, even when no tax is due.

1. FBAR (FinCEN Form 114)
If the total of all your foreign accounts (NRE, NRO, fixed deposits, demat and others) went over $10,000 at any time in the year, you file an FBAR online. It is due in April, with an automatic extension to October. Official page: [IRS FBAR information](https://www.irs.gov/businesses/small-businesses-self-employed/report-of-foreign-bank-and-financial-accounts-fbar).

2. FATCA (Form 8938)
Filed with your tax return when your foreign financial assets pass higher thresholds. For people living in the US it starts at $50,000 at year end (single) or $100,000 (married filing jointly). Compare the two forms here: [FBAR vs Form 8938](https://www.irs.gov/businesses/comparison-of-form-8938-and-fbar-requirements).

3. NRE and NRO interest
NRE interest is tax-free in India but taxable in the US. NRO interest is taxed in India (the bank deducts TDS) and is also reportable in the US. You can usually claim a foreign tax credit for the Indian tax, under the India–US tax treaty.

4. Indian mutual funds
For US tax purposes most Indian mutual funds are PFICs, which have complex reporting and can be taxed harshly. Many CPAs advise US residents not to buy new Indian mutual funds. Ask yours before you invest.

5. Gifts and inheritance from India
If you receive more than $100,000 in a year in gifts or inheritance from family abroad, you report it on Form 3520. There is usually no tax, but the penalties for not filing are steep.

6. Property in India
Rent from an Indian flat is taxable in India and reportable in the US. Selling it can trigger capital gains in both countries, with credit for tax paid in India.

Get help
A CPA who files both US and Indian returns is worth the fee. Find desi CPAs and tax preparers on GoDesi: [financial services](https://godesi.com/categories/financial-services).

${NOT_ADVICE}`,
    tags: ["nri", "tax", "fbar", "guide"],
  },
  {
    slug: "sending-money-to-india-from-the-usa",
    title: "Sending money to India from the USA: how to compare options",
    excerpt:
      "Exchange-rate markup, fees, speed and gift rules: how to send money to family in India without losing hundreds of dollars.",
    body: `Desi families send money home every month: for parents, a home loan, school fees or a wedding. The fee you see is only part of the cost. The bigger part is usually hidden in the exchange rate.

1. Compare the rate you get, not just the fee
Check today's mid-market rate first on [GoDesi's USD to INR page](https://godesi.com/usd-to-inr). Then see how many rupees each service will actually deliver for the same dollar amount. A "zero fee" transfer with a weak rate can cost more than one with a $3 fee.

2. Your options
- Online transfer apps: usually the best rate for amounts up to a few thousand dollars, and often same-day.
- Your bank's wire: simple, but banks usually add a large rate markup plus a wire fee.
- Your Indian bank's remittance service: some Indian banks run their own US-to-India service with good rates for NRE/NRO deposits.
- Cash pick-up services: useful only when the receiver has no bank account, and usually the most expensive.

3. Send to the right account
Money you send to your own NRE account stays repatriable, so you can move it back to the US later. Money for parents can go straight to their resident account.

4. Gift rules
- US side: there is no tax for the sender up to the IRS annual gift exclusion per person. Above it, the sender files Form 709, though tax is rarely due. See [IRS gift tax FAQs](https://www.irs.gov/businesses/small-businesses-self-employed/frequently-asked-questions-on-gift-taxes).
- India side: gifts from relatives (parents, children, siblings, spouse) are tax-free for the receiver. Gifts from non-relatives above ₹50,000 a year can be taxed.

5. Large amounts
For a property purchase or a wedding, ask two or three services for a quote on the exact amount. On big transfers, small rate differences add up to real money.

Find desi financial advisors and CPAs near you: [GoDesi financial services](https://godesi.com/categories/financial-services).

${NOT_ADVICE}`,
    tags: ["nri", "money-transfer", "india", "guide"],
  },
  {
    slug: "h1b-and-green-card-basics-for-desi-families",
    title: "H-1B and green card basics for desi families",
    excerpt:
      "How the H-1B lottery, H-4 EAD, PERM, I-140 and the visa bulletin fit together, in plain words, with links to the official sources.",
    body: `Most desi professionals in the US go through the same steps: student visa, H-1B, then an employer-sponsored green card. Here is how the pieces fit together.

1. H-1B
- New H-1B visas are capped each year: 65,000 regular, plus 20,000 for people with a US master's degree or higher. Employers register candidates in March and USCIS runs a lottery.
- Universities, related nonprofits and government research organisations are cap-exempt and can hire year-round.
- H-1B rules and fees changed in 2025 and 2026, including a large new payment on some new petitions. Always check the current rules on [USCIS H-1B](https://www.uscis.gov/working-in-the-united-states/h-1b-specialty-occupations).

2. Changing jobs
H-1B portability usually lets you start with a new employer once they file a petition for you, without a new lottery, if you were already counted under the cap.

3. Green card through your employer
- PERM labor certification: your employer proves to the Department of Labor that no qualified US worker is available.
- I-140: the immigrant petition. Once it's approved, your priority date is locked in.
- I-485 (adjustment of status): filed when your priority date is current.

4. The India backlog
Each country can use only about 7% of employment green cards a year. So people born in India wait much longer in EB-2 and EB-3 than most others. Track the monthly movement on [GoDesi's visa bulletin page](https://godesi.com/visa-bulletin).

5. Spouses and children
H-4 spouses can apply for an H-4 EAD work permit once the H-1B holder has an approved I-140, or in some other cases. Children who turn 21 may "age out" of H-4. Ask about CSPA protection early.

6. Get a real lawyer
Immigration law changes fast. Use a licensed immigration attorney, not a consultant. Find desi immigration attorneys on GoDesi: [professionals](https://godesi.com/professionals).

${NOT_ADVICE}`,
    tags: ["h1b", "green-card", "immigration", "guide"],
  },
  {
    slug: "little-india-neighborhoods-new-jersey-new-york",
    title: "Little India neighborhoods in New Jersey and New York",
    excerpt:
      "Oak Tree Road, India Square, Jackson Heights, Hicksville, Richmond Hill and more: where to shop, eat and celebrate desi in NJ and NY.",
    body: `The New York area has some of the biggest desi neighborhoods outside South Asia. Each one has its own flavor. Here is where to go and what to look for.

Oak Tree Road, Edison and Iselin (NJ)
About a mile and a half of sari and jewellery shops, sweet shops, groceries, chaat counters and restaurants. It gets busy before Diwali and Navratri, and during wedding season. Find businesses here: [Indian restaurants in Edison](https://godesi.com/guide/indian-restaurants-edison-nj).

India Square, Jersey City (NJ)
Newark Avenue near Journal Square: South Indian and Gujarati food, groceries, and the area's big Navratri and Diwali street celebrations. It's a short PATH ride from Manhattan.

Jackson Heights, Queens (NY)
74th Street and 37th Avenue: sari and gold shops, Bangladeshi, Nepali, Pakistani and Indian food, sweets and paan. Take the 7, E, F, M or R train to 74 St–Broadway.

Richmond Hill, Queens (NY)
Liberty Avenue and 101st Avenue: the heart of the Indo-Caribbean and Punjabi Sikh communities, with gurdwaras, roti shops and Phagwah celebrations in spring.

Hicksville, Long Island (NY)
Broadway and the streets around the LIRR station: groceries, restaurants, jewellers and temples serving Long Island's desi families.

Curry Hill, Manhattan (NY)
Lexington Avenue in the upper 20s: spice shops, South Indian vegetarian restaurants and quick lunch spots.

Also worth a visit
Parsippany (Route 46), Plainsboro and Princeton, and Floral Park and Bellerose along Hillside Avenue in Queens.

Plan your visit with GoDesi
- [Desi events this week](https://godesi.com/events)
- [Festivals calendar](https://godesi.com/festivals)
- [Temples and places of worship](https://godesi.com/religious)
- [Search any desi business](https://godesi.com/find)

Own a shop in one of these neighborhoods? [List it free on GoDesi](https://godesi.com/post?type=business).`,
    tags: ["new-jersey", "new-york", "little-india", "guide"],
  },
];

async function main() {
  const author = await db.user.findUnique({
    where: { id: AUTHOR_ID },
    select: { id: true },
  });
  for (const guide of GUIDES) {
    await db.blogPost.upsert({
      where: { slug: guide.slug },
      create: { ...guide, kind: "POST", authorId: author?.id ?? null },
      update: {},
    });
    console.log(`https://godesi.com/blog/${guide.slug}`);
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
