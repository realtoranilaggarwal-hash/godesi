/** The GoDesi Course of Marketing — lessons unlocked by a $9.99 purchase. */

export const COURSE_SLUG = "marketing";
export const COURSE_PRICE_MINOR = 999;
export const COURSE_TITLE = "GoDesi.com Course of Marketing";
export const COURSE_TAGLINE =
  "How everyday people make money online — UGC, affiliate income, selling digital products — and how to grow it from pocket money into an asset you own.";

export type Lesson = {
  title: string;
  minutes: number;
  paragraphs: string[];
  bullets?: string[];
};

export const LESSONS: Lesson[] = [
  {
    title: "How money is actually made online",
    minutes: 6,
    paragraphs: [
      "Every dollar made online comes from one of three things: selling a product, selling a service, or selling attention. UGC creators sell attention (brands pay for their videos). Affiliates sell attention too (they get a cut when someone buys through their link). Sellers of digital products — courses, templates, presets — sell a product that costs almost nothing to copy, which is why margins are so high.",
      "The mistake beginners make is trying all three at once. Pick ONE, get to your first $100, then stack the next one on top.",
    ],
    bullets: [
      "Product: courses, templates, ebooks, stock content — high margin, scales.",
      "Service: editing, design, management — fast first dollar, trades time for money.",
      "Attention: UGC, affiliate links, ad revenue — slow to start, compounds forever.",
    ],
  },
  {
    title: "UGC — getting paid to make videos for brands",
    minutes: 8,
    paragraphs: [
      "UGC (user-generated content) is when a brand pays you to make a short video that looks like a regular person's post — not a polished ad. Brands run these videos as ads because real-looking content outsells studio ads. You do NOT need followers to sell UGC — the brand posts it on THEIR account or runs it as an ad.",
      "Rates for beginners run $50–$150 per video; experienced creators charge $200–$500+ per video plus usage rights. A phone, decent light, and a hook in the first 2 seconds is the whole toolkit.",
    ],
    bullets: [
      "Build a 3-video portfolio: one product demo, one 'problem → solution' story, one testimonial-style clip.",
      "Pitch small DTC brands and local businesses first — they say yes fastest. Email 10 brands a day.",
      "Charge extra when the brand wants to run your video as a paid ad (usage rights).",
      "Deliver on time and re-films become monthly retainers.",
    ],
  },
  {
    title: "Affiliate marketing — earning a cut of other people's sales",
    minutes: 8,
    paragraphs: [
      "Affiliate marketing means you share a special link, and when someone buys through it, you earn a commission. Amazon pays ~1–3%, software and courses pay 20–50%, and community platforms often pay the best because they want local people spreading the word.",
      "Example close to home: GoDesi's own partner/referral program pays you when the businesses and event-goers you bring sign up or buy. A brick on the GoDesi Wall of Fame is the same idea in reverse — for $4 a business buys a permanent advertising spot, so the lesson is: small-ticket attention products sell fast online when the offer is clear.",
    ],
    bullets: [
      "Pick products you actually use — fake recommendations kill trust and trust is the whole business.",
      "Put your link where people already ask questions: comments, DMs, group chats, short videos.",
      "Track which link gets clicks; double down on whatever converts.",
      "Disclose affiliate links (#ad / 'I may earn a commission') — it's required and it builds trust anyway.",
    ],
  },
  {
    title: "Selling digital products — the $9.99 course you're in right now",
    minutes: 7,
    paragraphs: [
      "You're inside a live example: this course is a digital product. It was written once and sells over and over at $9.99 with no inventory, no shipping, no rent. That's the model — package what you know (or learn) into a guide, template pack, mini-course or checklist and sell it on repeat.",
      "$9.99 is a sweet spot: cheap enough to buy on impulse from a TikTok video, high enough that 100 sales a month is real money.",
    ],
    bullets: [
      "Solve ONE specific problem ('make your first UGC sale', 'write listings that sell').",
      "Deliver it as a page, PDF or video — fancy platforms are optional, a simple paid page works.",
      "Your first customers come from your own posts — every video ends with 'link in bio'.",
    ],
  },
  {
    title: "TikTok & short-form — free traffic on tap",
    minutes: 9,
    paragraphs: [
      "Short video is the cheapest customer source that ever existed: TikTok, Reels and Shorts push your clips to strangers for free. The algorithm rewards one thing — watch time — so the first 2 seconds decide everything. Start with a hook: a bold claim, a question, or 'nobody tells you this about…'.",
      "Post daily. One video in twenty carries the account. The job isn't making every video good — it's posting until one pops, then making more like it.",
    ],
    bullets: [
      "Hook (0–2s) → value (3–30s) → call to action ('link in bio', 'comment X for the link').",
      "Batch-record 5–7 videos in one sitting once a week.",
      "Reply to comments with new videos — replies rank and double as content.",
      "Go live when you can — lives convert followers into buyers faster than posts.",
    ],
  },
  {
    title: "Offers & pricing — why people actually click buy",
    minutes: 6,
    paragraphs: [
      "People don't buy products, they buy outcomes: 'make your first $100 online' beats '10 video lessons'. Price follows the outcome — a course that helps someone earn $500 is cheap at $9.99 or $49.",
      "Simple pricing rules: cheap entry products ($5–$25) to turn strangers into buyers, mid offers ($50–$200) for people who got results, and premium offers (your time, done-for-you) for the few who want speed.",
    ],
    bullets: [
      "Name the outcome in the title — 'Course of Marketing' sells what it does.",
      "One-time payment beats subscriptions for beginners — zero pressure, instant yes.",
      "Anchor: show the $200 version next to the $9.99 version and the cheap one flies.",
    ],
  },
  {
    title: "From renting attention to owning it — email lists & your own site",
    minutes: 7,
    paragraphs: [
      "Social followers are rented — the platform can take them away any day. An email list and your own website are owned. The professional move is using free reach (TikTok) to feed things you own: a newsletter, a community, a page like your GoDesi business profile that you control.",
      "Even a tiny list of 200 people who asked to hear from you outsells 10,000 passive followers — these are the people who buy every launch.",
    ],
    bullets: [
      "Offer something free (a checklist, a discount, a guide) in exchange for an email.",
      "Send one useful email a week — sell in every third one, help in the rest.",
      "Own one 'home base' page with your name on it and point every bio at it.",
    ],
  },
  {
    title: "From renting to owning — turning online income into real assets",
    minutes: 7,
    paragraphs: [
      "The ladder: rent attention (social posts) → own attention (list, community, your own page) → own products (courses, ads spots that keep paying) → own property. Each level buys the next.",
      "Practical version: UGC and affiliate income covers bills, digital-product profit builds savings, and steady online income strengthens a mortgage file — lenders like documented second income. Many GoDesi members started exactly this way: a side hustle on weekends that became the down payment.",
    ],
    bullets: [
      "Keep 20–30% of online income aside as 'asset money' — never spend it on lifestyle.",
      "Document income (Stripe/PayPal statements, simple bookkeeping) — it's proof when you buy a home.",
      "First buy what's smallest: equipment → inventory → a car that earns → down payment.",
    ],
  },
  {
    title: "Simple funnels — the path from stranger to customer",
    minutes: 6,
    paragraphs: [
      "A funnel is just the journey: See video → click link → read page → buy → get emails → buy again. Every business online is this, from a $9.99 course to a car dealership. Draw yours on one line and fix the weakest step.",
      "If nobody clicks, the hook is weak. If they click but don't buy, the offer or price is wrong. If they buy once and vanish, you have no follow-up — that's where the owned list comes back in.",
    ],
    bullets: [
      "Awareness (videos) → Interest (landing page) → Sale → Repeat (emails/community).",
      "Measure each step weekly; improve ONE step at a time.",
      "A confused customer never buys — one page, one offer, one button.",
    ],
  },
  {
    title: "Your first 30 days — the action plan",
    minutes: 5,
    paragraphs: [
      "Week 1: pick ONE lane (UGC, affiliate or digital product) and set up your 'home base' — a profile page and a link to sell through. Week 2: post daily short videos and pitch 10 potential buyers/brands. Week 3: make or list your first offer — a $9.99 product, an affiliate link, or a UGC service menu. Week 4: review the numbers and do more of what worked.",
      "The people who make money online aren't smarter — they shipped 30 posts while everyone else was still 'researching'. Start today, learn by doing.",
    ],
    bullets: [
      "Day 1–7: choose lane, build home base, study 10 accounts doing what you want to do.",
      "Day 8–14: daily posts + 10 outreach messages a day.",
      "Day 15–21: first offer live — even if it's imperfect.",
      "Day 22–30: double down on the best-performing post, offer and platform.",
    ],
  },
  {
    title: "The rules that keep you out of trouble",
    minutes: 4,
    paragraphs: [
      "Three rules protect everything you build: always disclose sponsored posts and affiliate links (FTC requires it, and audiences respect honesty), never promise income you can't guarantee ('results vary' is the honest line), and pay taxes on online income — keep a simple log of what comes in.",
      "Reputation is the product. Online income is a long game — a trusted name compounds like interest.",
    ],
    bullets: [
      "#ad or 'commission link' on every paid recommendation.",
      "Sell outcomes you can prove, not income you can't.",
      "Save receipts and export payment reports monthly.",
    ],
  },
];
