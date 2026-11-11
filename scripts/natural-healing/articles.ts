/**
 * The ten launch articles for /natural-healing. Educational tone, safety notes
 * and NIH/NCCIH sources; no cure or detox claims. Body format: "## " headings,
 * "- " bullets, **bold**, [words](https://…) links.
 */
export type SeedArticle = {
  slug: string;
  title: string;
  metaDescription: string;
  emoji: string;
  productCategories: string[];
  featured?: boolean;
  disclaimer: string;
  body: string;
  sources: string;
};

const S = {
  knowScience: "NCCIH — Know the Science | https://www.nccih.nih.gov/health/know-science",
  supplements: "NCCIH — Using Dietary Supplements Wisely | https://www.nccih.nih.gov/health/using-dietary-supplements-wisely",
  ayurveda: "NCCIH — Ayurvedic Medicine: In Depth | https://www.nccih.nih.gov/health/ayurvedic-medicine-in-depth",
  detox: "NCCIH — \"Detoxes\" and \"Cleanses\": What You Need To Know | https://www.nccih.nih.gov/health/detoxes-and-cleanses-what-you-need-to-know",
  indigestion: "NIDDK (NIH) — Indigestion (Dyspepsia) | https://www.niddk.nih.gov/health-information/digestive-diseases/indigestion-dyspepsia",
};

export const ARTICLES: SeedArticle[] = [
  {
    slug: "copper-water-tradition-tamra-jal",
    title: "The Copper Water Tradition (Tamra Jal): History, Habit and Safety",
    metaDescription:
      "Why Indian families store water in copper vessels overnight, what science actually knows about copper and drinking water, and how to use copper drinkware safely.",
    emoji: "🏺",
    featured: true,
    productCategories: ["copper-drinkware", "glass-storage"],
    disclaimer:
      "Too much copper can be harmful. Do not store acidic drinks (lemon water, juice, buttermilk) in copper, and talk to your doctor before using copper vessels if you have Wilson disease or a liver condition.",
    body: `In many Indian homes, the day begins with a glass of water that has rested overnight in a copper lota, jug or bottle. This habit is called **tamra jal** — "copper water" — and it has been passed down for generations as part of daily routine and Ayurvedic tradition.

## Where the tradition comes from

Copper vessels have been used in South Asia for thousands of years, for worship (the kalash), for cooking and for storing water. In Ayurveda, water kept in copper is traditionally described as balancing for the body. These are traditional beliefs; they have not been confirmed by modern clinical trials.

For many families the value is also practical and cultural: a copper jug on the bedside table is a reminder to drink water first thing in the morning, and it connects us with our grandparents' routines.

## What modern science says

- **Copper is an essential mineral.** The body needs small amounts for energy, connective tissue and the nervous system. Most people get enough from food such as nuts, seeds, whole grains, beans and shellfish.
- **Copper surfaces can reduce some germs.** Laboratory studies show copper surfaces can reduce certain bacteria over time. This is not the same as purifying water — copper is not a substitute for safe, treated drinking water.
- **There is no good evidence for "detox" claims.** Claims that copper water flushes toxins, melts fat or cures disease are not supported by research.

## Safety notes

- **More is not better.** Water that sits in copper picks up small amounts of the metal. Too much copper can cause nausea, vomiting, stomach pain and, over time, liver problems.
- **Only plain water.** Acidic liquids such as lemon water, juice, tea with lemon, buttermilk or vinegar draw much more copper out of the metal. Keep these in glass or steel.
- **Overnight is enough.** Storing water for about 6–8 hours is the traditional practice; there is no need to keep it for days.
- **Choose food-grade, lined-or-pure copper from a trusted seller,** and avoid vessels with unknown coatings or lacquer on the inside.
- **Clean it gently.** Lemon-and-salt or tamarind scrubbing removes the dark tarnish; rinse well and dry.
- **Ask your doctor first** if you have Wilson disease, a liver condition, are pregnant, or are giving water to an infant or young child.

## A simple, safe routine

- Fill a clean copper jug with plain filtered water at night.
- Drink a glass in the morning, then switch to your normal glass or steel bottle for the rest of the day.
- Keep drinking enough water overall — the habit of hydration is the part everyone can agree on.

## The bottom line

Tamra jal is a beautiful family tradition. Enjoy it in moderation with plain water, keep the vessel clean, and treat it as a cultural ritual rather than a medicine.`,
    sources: [
      "NIH Office of Dietary Supplements — Copper Fact Sheet for Consumers | https://ods.od.nih.gov/factsheets/Copper-Consumer/",
      S.ayurveda,
      S.detox,
      S.knowScience,
    ].join("\n"),
  },
  {
    slug: "ginger-adrak-traditional-uses",
    title: "Ginger (Adrak): Traditional Kitchen Wisdom and What Research Says",
    metaDescription:
      "From adrak chai to saunth, ginger is a desi kitchen staple. Here is what research says about ginger and nausea, plus who should be careful with it.",
    emoji: "🫚",
    productCategories: ["turmeric-ginger", "herbal-teas"],
    disclaimer:
      "Ginger supplements may interact with blood thinners. Check with your doctor before taking ginger supplements if you are pregnant, take medication, or have gallstones or a bleeding disorder.",
    body: `Adrak in your chai, saunth (dry ginger) in a winter laddoo, a slice of fresh ginger with salt and lemon before a meal — ginger is everywhere in Indian cooking, and it is one of the best-studied kitchen herbs.

## Ginger in Indian tradition

Ayurveda has long used ginger as a warming spice for digestion, and many families reach for ginger tea when someone has an upset stomach or a cold. Ginger is also used across Chinese, Arabic and European traditions.

## What research suggests

- **Nausea.** Studies suggest ginger may help relieve nausea and vomiting in pregnancy for some people. Research on nausea from chemotherapy and after surgery is mixed.
- **Other uses.** Ginger has been studied for arthritis pain, menstrual cramps and digestive comfort, but the evidence is limited and not conclusive.
- **Food amounts are generally safe.** Ginger used in cooking and tea is considered safe for most people.

## Safety notes

- Some people get heartburn, gas or an upset stomach, especially from large amounts or capsules.
- Ginger supplements may increase bleeding risk with blood-thinning medicines such as warfarin.
- If you are pregnant, ask your doctor or midwife before using ginger supplements (not just food amounts).
- Supplements are not regulated like medicines — quality and dose can vary.

## Easy ways to enjoy ginger

- Adrak chai: crush a small piece of fresh ginger into tea as it boils.
- Ginger-lemon-honey water (not for children under 1 year because of honey).
- Add grated ginger to dal tadka, sabzi and soups.

## The bottom line

Ginger is a flavourful, well-loved spice with some research support for easing nausea. Enjoy it in food and tea, and talk to a professional before using concentrated supplements.`,
    sources: [
      "NCCIH — Ginger | https://www.nccih.nih.gov/health/ginger",
      S.indigestion,
      S.supplements,
    ].join("\n"),
  },
  {
    slug: "honey-shahad-traditional-uses",
    title: "Honey (Shahad): Sweet Tradition, Cough Comfort and Safety",
    metaDescription:
      "Honey with ginger or tulsi is a classic desi remedy for a sore throat. Learn what research says about honey and coughs, and why babies under one must never have it.",
    emoji: "🍯",
    productCategories: ["herbal-teas", "glass-storage"],
    disclaimer:
      "Never give honey to babies under 12 months — it can cause infant botulism. People with diabetes should count honey as sugar.",
    body: `A spoon of shahad with a pinch of haldi or a few drops of ginger juice is many desi families' first response to a scratchy throat. Honey also appears in Ayurveda, in prasad and in countless sweets.

## Honey in tradition

Ayurveda describes honey (madhu) as a carrier for other herbs and traditionally advises against heating it to very high temperatures. Families often mix it into warm — not boiling — water or tea.

## What research suggests

- **Coughs from colds.** Some studies suggest honey may help ease nighttime coughing in children over one year old, and it is often recommended as a simple comfort measure.
- **Not an antibiotic.** Most colds and coughs are caused by viruses and get better on their own. Honey may soothe symptoms; it does not treat the infection.

## Safety notes

- **Babies under 12 months must never be given honey** (raw, cooked or in foods) because of the risk of infant botulism.
- Honey is sugar. People with diabetes should count it in their carbohydrates and check with their care team.
- Pick honey from a trusted source; some cheap "honey" is blended with syrups.
- See a doctor for a cough that lasts more than 3 weeks, comes with high fever, trouble breathing, chest pain, or blood.

## Gentle ways to use honey

- A teaspoon in warm water with lemon or ginger.
- Drizzled on oats or curd instead of refined sugar — in moderation.
- Stored in a clean, dry glass jar, away from moisture.

## The bottom line

Honey is a comforting, traditional home measure for a sore throat or cough in adults and children over one, and nothing more magical than that. Keep it away from infants.`,
    sources: [
      "MedlinePlus (NIH) — Cough | https://medlineplus.gov/cough.html",
      "MedlinePlus (NIH) — Common Cold | https://medlineplus.gov/commoncold.html",
      S.knowScience,
    ].join("\n"),
  },
  {
    slug: "peppermint-pudina-digestion",
    title: "Peppermint (Pudina): Cooling Tradition and Digestive Comfort",
    metaDescription:
      "Pudina chutney, mint chaas and peppermint tea are desi favourites. See what research says about peppermint oil and IBS, and when mint can make heartburn worse.",
    emoji: "🌱",
    productCategories: ["herbal-teas"],
    disclaimer:
      "Peppermint can worsen heartburn and acid reflux. Peppermint oil should not be applied to the face of infants or young children.",
    body: `Fresh pudina is the star of green chutney, mint chaas and summer coolers. Peppermint — a close cousin of the garden mint used in Indian kitchens — has also been studied for digestive comfort.

## Mint in Indian tradition

Mint is traditionally considered cooling and is served alongside heavy, rich food. Pudina water and chaas are classic summer drinks.

## What research suggests

- **Irritable bowel syndrome (IBS).** Research suggests enteric-coated peppermint oil capsules may help relieve abdominal pain and other IBS symptoms for some people.
- **Indigestion.** A few studies of peppermint combined with caraway oil suggest it may help with indigestion symptoms.
- **Peppermint tea** is widely enjoyed, but there is little research on the tea itself.

## Safety notes

- Peppermint can relax the valve at the top of the stomach and **may make heartburn or GERD worse.**
- Peppermint oil capsules can cause heartburn, nausea and dry mouth in some people.
- Concentrated peppermint oil should **not be put on the face or chest of babies and young children** — it can affect breathing.
- Peppermint oil may interact with some medicines; check with a pharmacist.
- See a doctor for ongoing stomach pain, weight loss, blood in stool, or trouble swallowing.

## Easy ways to enjoy mint

- Mint chaas: blend curd, water, roasted jeera and fresh pudina.
- Pudina chutney with meals.
- A cup of plain peppermint tea after dinner (if it does not trigger heartburn).

## The bottom line

Mint is refreshing and well-loved, and peppermint oil has some evidence for IBS comfort. If heartburn is your main problem, mint may not be your friend.`,
    sources: [
      "NCCIH — Peppermint Oil | https://www.nccih.nih.gov/health/peppermint-oil",
      S.indigestion,
      S.supplements,
    ].join("\n"),
  },
  {
    slug: "turmeric-haldi-traditional-uses",
    title: "Turmeric (Haldi): Golden Spice, Big Claims and Real Evidence",
    metaDescription:
      "Haldi doodh, haldi in every dal — turmeric is central to desi life. Here is what research actually shows about turmeric and curcumin, and supplement safety.",
    emoji: "🟡",
    productCategories: ["turmeric-ginger", "glass-storage"],
    disclaimer:
      "Turmeric and curcumin supplements have been linked to rare cases of liver injury and may interact with blood thinners and diabetes medicines. Ask your doctor before taking them.",
    body: `Haldi colours almost every desi kitchen. It goes into dal and sabzi, into haldi doodh at bedtime, and into the haldi ceremony before a wedding.

## Turmeric in Indian tradition

Ayurveda uses turmeric widely, and many families treat haldi doodh (golden milk) as a soothing bedtime drink. Turmeric's bright colour comes from **curcumin**, the compound most often studied.

## What research suggests

- **Mixed evidence.** Turmeric and curcumin have been studied for joint pain, digestive conditions and more. Results are mixed, and many studies are small.
- **Absorption is low.** Curcumin is poorly absorbed on its own, which is one reason results are hard to interpret.
- **Cooking amounts are generally safe** for most people.

## Safety notes

- High-dose supplements can cause stomach upset, nausea or diarrhea.
- **Rare cases of liver injury** have been reported with turmeric/curcumin supplements, especially some formulations designed for higher absorption.
- Turmeric supplements may interact with blood thinners and diabetes medicines.
- Some imported turmeric powders have been found contaminated with lead. Buy from reputable brands.
- Talk to your doctor before supplements if you are pregnant, have gallbladder disease, or take medication.

## Easy ways to enjoy haldi

- Haldi doodh: warm milk with a pinch of turmeric and black pepper.
- A pinch in dal, sabzi and rice.
- Fresh turmeric root pickle in winter.

## The bottom line

Turmeric is a wonderful spice to cook with. The research on supplements is still unsettled, so enjoy haldi in food and be cautious with concentrated pills.`,
    sources: [
      "NCCIH — Turmeric | https://www.nccih.nih.gov/health/turmeric",
      S.supplements,
      S.ayurveda,
    ].join("\n"),
  },
  {
    slug: "fiber-isabgol-whole-grains",
    title: "Fiber: Isabgol, Whole Grains and the Desi Thali",
    metaDescription:
      "Dal, sabzi, millets, isabgol — the traditional desi thali is full of fiber. Learn how fiber supports regular digestion and how to increase it comfortably.",
    emoji: "🌾",
    productCategories: ["glass-storage"],
    disclaimer:
      "Increase fiber slowly and drink enough water. Take isabgol (psyllium) at least 2 hours apart from medicines, and see a doctor for sudden changes in bowel habits.",
    body: `Our grandparents rarely talked about "fiber", but their meals were full of it: dal, rajma, chana, leafy sabzi, rotis made from whole wheat, bajra or jowar, and fruit after meals. Many families also keep a packet of **isabgol** (psyllium husk) in the cupboard.

## Why fiber matters

Dietary fiber is the part of plant food the body does not digest. It adds bulk to stool and helps food move through the gut. Diets rich in fiber are linked with regular bowel movements and are part of an overall healthy eating pattern.

- **Soluble fiber** (oats, isabgol, beans, apples) forms a gel with water.
- **Insoluble fiber** (whole grains, bran, vegetables) adds bulk.

## Desi foods rich in fiber

- Dal, chana, rajma, lobia and sprouts.
- Whole-wheat roti, bajra, jowar, ragi and other millets.
- Vegetables like bhindi, methi, palak, gajar and lauki.
- Fruits such as guava, papaya, pear and apple with skin.

## Safety notes

- **Go slowly.** Adding a lot of fiber suddenly can cause gas, bloating and cramps.
- **Drink water.** Fiber, and especially isabgol, needs enough fluid; take psyllium with a full glass of water.
- **Space it from medicines.** Psyllium can affect how some medicines are absorbed — take it at least 2 hours apart.
- **See a doctor** for blood in stool, unexplained weight loss, severe pain, or a lasting change in bowel habits.

## Simple steps

- Swap one maida roti for a whole-grain or millet roti.
- Add a bowl of dal or sabzi to each meal.
- Keep fruit, not biscuits, for snacks.

## The bottom line

The traditional desi thali already gives us a great fiber toolkit. Build up gradually, drink water, and let food do most of the work.`,
    sources: [
      "MedlinePlus (NIH) — Dietary Fiber | https://medlineplus.gov/dietaryfiber.html",
      "MedlinePlus (NIH) Medical Encyclopedia — Fiber | https://medlineplus.gov/ency/article/002470.htm",
      "NIDDK (NIH) — Eating, Diet & Nutrition for Constipation | https://www.niddk.nih.gov/health-information/digestive-diseases/constipation/eating-diet-nutrition",
    ].join("\n"),
  },
  {
    slug: "warm-compress-sek-home-comfort",
    title: "The Warm Compress (Sek): A Simple Home Comfort for Aches",
    metaDescription:
      "A warm towel or garam paani ki bottle — sek is a desi home comfort for sore muscles and cramps. How to use heat safely and when to see a doctor.",
    emoji: "♨️",
    productCategories: ["home-comfort"],
    disclaimer:
      "Never apply heat to a fresh injury, an area with poor feeling, or broken skin. People with diabetes or circulation problems should ask their doctor before using heat.",
    body: `When someone in the family had a stiff back or stomach cramps, out came the garam paani ki bottle or a towel warmed on the tawa. This **sek** (warm compress) is one of the simplest home comforts there is.

## What heat may help with

- **Sore, tight muscles** and everyday back stiffness.
- **Menstrual cramps** — warmth on the lower belly is a commonly recommended self-care step.
- **General relaxation** after a long day.

Heat is a comfort measure. It can make you feel better, but it does not treat the underlying cause of pain.

## How to use a warm compress safely

- Use **warm, not hot** — test on the inside of your wrist first.
- Wrap a hot water bottle or heating pad in a towel; never put it directly on skin.
- Apply for about **15–20 minutes**, then take a break.
- Never sleep with an electric heating pad switched on.

## When NOT to use heat

- On a **fresh injury** (sprain, swelling, bruising) in the first day or two — cool packs are usually advised then.
- On skin with **poor sensation**, such as from diabetic neuropathy, or on broken or irritated skin.
- On children, older adults or anyone who cannot easily tell you it is too hot, without close supervision.

## See a doctor if

- Pain is severe, sudden, or follows a fall or accident.
- Back pain comes with fever, numbness, weakness, or bladder/bowel changes.
- Menstrual pain is getting worse or stops you from daily activities.

## The bottom line

A warm compress is a low-cost, comforting home habit for ordinary aches. Keep it warm, wrapped and time-limited, and get checked for pain that is new, severe or lasting.`,
    sources: [
      "NCCIH — Low-Back Pain and Complementary Health Approaches | https://www.nccih.nih.gov/health/low-back-pain-and-complementary-health-approaches-what-you-need-to-know",
      "MedlinePlus (NIH) — Back Pain | https://medlineplus.gov/backpain.html",
      "MedlinePlus (NIH) — Painful Menstrual Periods | https://medlineplus.gov/ency/article/003150.htm",
      "MedlinePlus (NIH) — Strains and Sprains | https://medlineplus.gov/sprainsandstrains.html",
    ].join("\n"),
  },
  {
    slug: "saline-nasal-rinsing-jala-neti",
    title: "Saline Nasal Rinsing (Jala Neti): Tradition and Safe Practice",
    metaDescription:
      "Jala neti is a yogic practice of rinsing the nose with salt water. Learn how saline rinsing is used today and the one safety rule you must never skip: safe water.",
    emoji: "💧",
    productCategories: ["yoga-meditation"],
    disclaimer:
      "Never use untreated tap water for nasal rinsing. Use distilled, sterile, or boiled-and-cooled water. Ask a doctor before rinsing if you have ear problems or recent nose surgery.",
    body: `**Jala neti** is one of the traditional cleansing practices (kriyas) of hatha yoga: lukewarm salt water is poured into one nostril and allowed to flow out of the other, often with a small pot called a neti pot.

## How saline rinsing is used today

Saline nasal rinsing is widely used to rinse mucus and allergens from the nose. Many people use it for comfort during colds, allergies or sinus congestion.

## The most important safety rule: safe water

Tap water is safe to drink but **not safe to put up your nose** unless it is treated. Rarely, untreated tap water can carry organisms that cause serious infections when they reach the nose.

Use only:
- **Distilled or sterile water** from a store, or
- **Tap water boiled for 3–5 minutes** and cooled to lukewarm (use within 24 hours), or
- Water passed through a filter designed to trap infectious organisms.

## How to rinse

- Wash your hands and use a clean neti pot or squeeze bottle.
- Mix the salt packet or a recommended saline mix with safe, lukewarm water.
- Lean over a sink, tilt your head sideways, and breathe through your mouth.
- Pour gently into the upper nostril and let it drain from the lower one; repeat on the other side.
- Rinse the device with safe water and let it air-dry.

## Safety notes

- Do not rinse if one side of your nose is completely blocked, or if you have an ear infection.
- Children should use rinsing only with a doctor's advice.
- See a doctor if you have fever, facial swelling, severe headache, or symptoms lasting more than 10 days.

## The bottom line

Saline rinsing is an old yogic practice with modern everyday uses. It is simple and gentle — as long as the water is safe.`,
    sources: [
      "U.S. FDA — Is Rinsing Your Sinuses With Neti Pots Safe? | https://www.fda.gov/consumers/consumer-updates/rinsing-your-sinuses-neti-pots-safe",
      "MedlinePlus (NIH) — Sinusitis | https://medlineplus.gov/sinusitis.html",
      "MedlinePlus (NIH) — Common Cold | https://medlineplus.gov/commoncold.html",
    ].join("\n"),
  },
  {
    slug: "walking-after-meals-shatapawali",
    title: "Walking After Meals (Shatapawali): The Desi After-Dinner Stroll",
    metaDescription:
      "Shatapawali — a hundred steps after eating — is an old Indian habit. Here is how light walking after meals fits into an active lifestyle, and how to do it safely.",
    emoji: "🚶",
    productCategories: ["home-comfort"],
    disclaimer:
      "If you have heart disease, diabetes, joint problems or are new to exercise, ask your doctor what activity level is right for you.",
    body: `"Khana khake sau kadam" — walk a hundred steps after eating. In Ayurveda this is called **shatapawali**, and in many desi neighbourhoods you can still see families out for their after-dinner stroll.

## Why a short walk is a good habit

- **Movement after meals.** Light activity after eating is a simple way to add movement to your day, and research suggests that physical activity helps the body use blood sugar.
- **Part of the activity guidelines.** Health agencies recommend adults get about 150 minutes of moderate activity a week; a 10–15 minute walk after two meals a day gets you most of the way.
- **Family time.** Walking together after dinner is screen-free time to talk.

## How to do it

- Keep it **gentle** — an easy, conversational pace. This is not the time for a run.
- Start with **5–10 minutes** and build up to 15–20 minutes.
- Wear comfortable shoes and choose a safe, well-lit route.
- Indoors works too: walk around the house or a mall in bad weather.

## Safety notes

- If you have diabetes and take insulin or certain tablets, ask your care team how activity affects your blood sugar.
- Stop and seek help if you feel chest pain, severe breathlessness, dizziness or unusual heartbeat.
- People with knee or hip problems can ask a physical therapist about suitable options.

## The bottom line

Shatapawali is an easy, free tradition that fits right into modern activity advice. A short, gentle walk after meals is a habit worth keeping.`,
    sources: [
      "NIDDK (NIH) — Diabetes Diet, Eating, & Physical Activity | https://www.niddk.nih.gov/health-information/diabetes/overview/diet-eating-physical-activity",
      "MedlinePlus (NIH) — Exercise and Physical Fitness | https://medlineplus.gov/exerciseandphysicalfitness.html",
      "NHLBI (NIH) — Physical Activity and Your Heart | https://www.nhlbi.nih.gov/health/heart-healthy-living/physical-activity",
    ].join("\n"),
  },
  {
    slug: "pranayama-yogic-breathing",
    title: "Pranayama: Yogic Breathing for Calm in a Busy Day",
    metaDescription:
      "Pranayama — yogic breathing like anulom vilom — is part of India's yoga heritage. What research says about breathing and relaxation, and how to begin safely.",
    emoji: "🧘",
    productCategories: ["yoga-meditation", "home-comfort"],
    disclaimer:
      "Stop if you feel dizzy or lightheaded. People who are pregnant or have heart disease, high blood pressure, asthma or other lung conditions should ask a doctor before forceful breathing practices like kapalbhati or bhastrika.",
    body: `**Pranayama** — control of the breath — is one of the eight limbs of yoga described in the Yoga Sutras. Many families learned anulom vilom or bhramari from a grandparent, a teacher or a morning yoga programme on TV.

## Common pranayama practices

- **Anulom vilom** (alternate-nostril breathing): breathe in through one nostril, out through the other.
- **Bhramari** (humming bee breath): a gentle hum on the exhale.
- **Deep belly breathing:** slow breaths that expand the abdomen.
- **Kapalbhati and bhastrika:** forceful, rapid breathing — these are more intense and not for everyone.

## What research suggests

- Slow, deep breathing is a core part of **relaxation techniques**, which research suggests may help some people manage stress and anxiety.
- **Yoga**, which includes breathing practices, has been studied for stress, sleep and quality of life, with encouraging but varied results.
- Breathing exercises are a support for well-being, not a treatment for any disease.

## How to begin

- Sit comfortably with a straight back, on a chair or a mat.
- Start with **slow belly breathing for 3–5 minutes**.
- Try anulom vilom gently, without forcing or holding the breath.
- Practise on an empty stomach or a couple of hours after eating.
- Learning from a qualified yoga teacher is the best way to start.

## Safety notes

- Stop if you feel dizzy, lightheaded, short of breath or anxious.
- **Avoid forceful practices** (kapalbhati, bhastrika, long breath-holds) if you are pregnant or have high blood pressure, heart disease, glaucoma, hernia, epilepsy or lung conditions, unless your doctor agrees.
- Do not use breathing exercises in place of medical care for chest pain or trouble breathing.

## The bottom line

Pranayama is a gift from India's yoga tradition: free, portable, and calming. Start slow and gentle, and let a few quiet breaths become part of your day.`,
    sources: [
      "NCCIH — Yoga: Effectiveness and Safety | https://www.nccih.nih.gov/health/yoga-effectiveness-and-safety",
      "NCCIH — Relaxation Techniques: What You Need To Know | https://www.nccih.nih.gov/health/relaxation-techniques-what-you-need-to-know",
      "NCCIH — Meditation and Mindfulness: Effectiveness and Safety | https://www.nccih.nih.gov/health/meditation-and-mindfulness-effectiveness-and-safety",
      "MedlinePlus (NIH) — Stress | https://medlineplus.gov/stress.html",
    ].join("\n"),
  },
];

export const EBOOK = {
  slug: "natural-healing-traditional-indian-wisdom",
  title: "Natural Healing — Traditional Indian Wisdom for Modern Living",
  coverUrl: "/wellness/ebook-cover.svg",
  pdfUrl: "natural-healing-traditional-indian-wisdom.pdf",
  description: `## About this eBook

Our dadis and nanis had a home answer for almost everything — a copper jug of water by the bed, adrak in the chai, a spoon of honey for a sore throat, a warm towel for a stiff back, a stroll after dinner. This free GoDesi eBook gathers ten of these traditions and explains each one in plain language: where it comes from, what modern research says, and the safety notes to know first.

It is written for desi families in the USA and Canada who want to keep these habits alive — sensibly.

## What's inside

- The Copper Water Tradition (Tamra Jal)
- Ginger (Adrak)
- Honey (Shahad)
- Peppermint (Pudina)
- Turmeric (Haldi)
- Fiber: Isabgol, Whole Grains and the Desi Thali
- The Warm Compress (Sek)
- Saline Nasal Rinsing (Jala Neti)
- Walking After Meals (Shatapawali)
- Pranayama: Yogic Breathing
- Sources from the NIH and NCCIH for every chapter

## Free for GoDesi members

Create a free GoDesi account or log in, then download the PDF. You can re-download it any time.`,
};

export type SeedProduct = {
  slug: string;
  name: string;
  merchantName: string;
  category: string;
  description: string;
  regularUrl?: string;
};

/**
 * Placeholder shelf: every row starts with affiliateUrl null, so nothing shows
 * publicly until an approved tracking link is entered in /admin/wellness or via
 * the WELLNESS_AFFILIATE_<SLUG> env var when seeding.
 */
export const PRODUCTS: SeedProduct[] = [
  {
    slug: "house-of-ayurveda-copper-water-bottle",
    name: "House of Ayurveda Copper Water Bottle",
    merchantName: "House of Ayurveda",
    category: "copper-drinkware",
    description: "Pure copper bottle for the traditional tamra jal habit. Plain water only.",
    regularUrl:
      process.env.WELLNESS_HOA_COPPER_URL ??
      "https://www.amazon.com/s?k=House+of+Ayurveda+copper+water+bottle",
  },
  { slug: "copper-jug-and-glass-set", name: "Copper Jug & Glass Set", merchantName: "Copper drinkware partner", category: "copper-drinkware", description: "Bedside copper jug with tumblers for overnight water." },
  { slug: "organic-turmeric-powder", name: "Organic Turmeric (Haldi) Powder", merchantName: "Spice partner", category: "turmeric-ginger", description: "Lab-tested haldi for everyday cooking and haldi doodh." },
  { slug: "dry-ginger-saunth-powder", name: "Dry Ginger (Saunth) Powder", merchantName: "Spice partner", category: "turmeric-ginger", description: "For adrak chai, laddoos and winter cooking." },
  { slug: "tulsi-ginger-herbal-tea", name: "Tulsi Ginger Herbal Tea", merchantName: "Tea partner", category: "herbal-teas", description: "Caffeine-free tulsi and ginger infusion." },
  { slug: "peppermint-herbal-tea", name: "Peppermint Herbal Tea", merchantName: "Tea partner", category: "herbal-teas", description: "A cup of pudina after dinner." },
  { slug: "yoga-mat", name: "Non-slip Yoga Mat", merchantName: "Yoga partner", category: "yoga-meditation", description: "Cushioned mat for asana and pranayama practice." },
  { slug: "meditation-cushion", name: "Meditation Cushion (Zafu)", merchantName: "Yoga partner", category: "yoga-meditation", description: "Comfortable seat for pranayama and meditation." },
  { slug: "ceramic-neti-pot", name: "Ceramic Neti Pot", merchantName: "Yoga partner", category: "yoga-meditation", description: "For jala neti — use only distilled or boiled-and-cooled water." },
  { slug: "glass-spice-jars", name: "Glass Spice Jar Set", merchantName: "Kitchen partner", category: "glass-storage", description: "Airtight glass jars for haldi, saunth and masalas." },
  { slug: "glass-water-bottle", name: "Glass Water Bottle", merchantName: "Kitchen partner", category: "glass-storage", description: "For lemon water and other acidic drinks — never copper." },
  { slug: "hot-water-bottle", name: "Hot Water Bottle with Cover", merchantName: "Home comfort partner", category: "home-comfort", description: "Garam paani ki bottle for a classic warm compress." },
  { slug: "microwavable-heat-pack", name: "Microwavable Heat Pack", merchantName: "Home comfort partner", category: "home-comfort", description: "Reusable warm compress for sore shoulders and back." },
];
