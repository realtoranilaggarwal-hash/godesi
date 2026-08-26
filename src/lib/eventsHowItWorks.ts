import { AD_PLACEMENTS } from "@/lib/ads";
import { platformFeePercent } from "@/lib/connect";
import { EVENT_FEATURE_GROUPS, EVENT_TYPES } from "@/lib/eventOptions";
import { PLANS } from "@/lib/plans";
import { siteUrl } from "@/lib/format";

/**
 * The organiser pitch — steps, plans, ticket fees and where a post travels.
 * It is data rather than markup because the network sites (eventringer.com)
 * render their own version of this page from /api/events/how-it-works, so the
 * prices only ever have to be right in one place.
 */
export type HowItWorksContent = ReturnType<typeof howItWorks>;

export function howItWorks() {
  const fee = platformFeePercent();
  const hero = AD_PLACEMENTS.HERO;
  const leaderboard = AD_PLACEMENTS.LEADERBOARD;
  const featureCount = EVENT_FEATURE_GROUPS.reduce(
    (total, group) => total + group.options.length,
    0,
  );

  return {
    tagline: "Post it once. Get found everywhere.",
    blurb:
      "One post, several sites, real ticketing. Godesi hosts the event page, sells the tickets and hands you the door list — listing it costs nothing.",
    postUrl: `${siteUrl()}/events/new`,
    guideUrl: `${siteUrl()}/events/how-it-works`,
    posterUrl: `${siteUrl()}/how-events-work-on-godesi.webp`,
    /** JPEG copy, for WhatsApp groups and printing. */
    posterShareUrl: `${siteUrl()}/how-events-work-on-godesi.jpg`,
    eventTypeCount: EVENT_TYPES.length,
    featureCount,
    steps: [
      {
        title: "Create the event",
        body: "Title, description, date and start time, venue, images — two minutes, no card, no approval queue.",
      },
      {
        title: "Get listed",
        body: `Pick one of ${EVENT_TYPES.length} event types and a directory category; it goes live on Godesi events, its city page and its category page.`,
      },
      {
        title: "Sell tickets",
        body: "Set one price and a seat count, or named tiers (Early bird, VIP, Family of four). Attendees get a QR ticket by email and you get a check-in page for the door.",
      },
      {
        title: "Reach more people",
        body: `Tick what the event offers from ${featureCount} facilities and extras — parking, food stalls, vendor booths, sponsorship slots — and attendees find you through the filters.`,
      },
      {
        title: "Grow & succeed",
        body: "Every event keeps its own page, structured dates for Google, an RSS feed and an add-to-calendar file, so it works long after a WhatsApp forward would have died.",
      },
    ],
    plans: [
      {
        id: PLANS.FREE.id,
        name: `${PLANS.FREE.name} plan`,
        priceUsd: PLANS.FREE.priceUsd,
        priceInr: PLANS.FREE.priceInr,
        blurb: "Unlimited event listings. Perfect for getting started.",
        note: "Ideal for new events & small organisers",
      },
      {
        id: PLANS.PRO.id,
        name: `${PLANS.PRO.name} plan`,
        priceUsd: PLANS.PRO.priceUsd,
        priceInr: PLANS.PRO.priceInr,
        blurb: "Great for growing events and more visibility.",
        note: "Upgraded features & more reach",
      },
      {
        id: PLANS.PREMIUM.id,
        name: `${PLANS.PREMIUM.name} plan`,
        priceUsd: PLANS.PREMIUM.priceUsd,
        priceInr: PLANS.PREMIUM.priceInr,
        blurb: "Maximum visibility, priority support and premium features.",
        note: "Best for large events & organisations",
      },
    ],
    fees: [
      {
        label: "Listing an event",
        value: "Free on every plan, unlimited",
      },
      {
        label: "Free-entry events",
        value: "No Godesi fee at all",
      },
      {
        label: `${PLANS.FREE.name} plan, ticketed events`,
        value: `${fee}% of tickets sold (Godesi ticket service fee)`,
      },
      {
        label: `${PLANS.PRO.name} & ${PLANS.PREMIUM.name} plans`,
        value: "0% Godesi ticket service fee",
      },
      {
        label: "Card processing",
        value: "About 3% via Stripe / PayPal on paid tickets, paid to them",
      },
    ],
    ads: [
      {
        name: hero.name,
        priceUsd: hero.priceUsd,
        priceInr: hero.priceInr,
        blurb: "Showcase your event at the top of Godesi.com.",
      },
      {
        name: leaderboard.name,
        priceUsd: leaderboard.priceUsd,
        priceInr: leaderboard.priceInr,
        blurb: "Display your event inside content pages for maximum reach.",
      },
    ],
    published: [
      {
        where: "Godesi.com events directory",
        body: "Your event page plus the searchable board, with tickets and the door list.",
      },
      {
        where: "City pages",
        body: "Shown on your city's events page next to everything else happening there.",
      },
      {
        where: "Category pages",
        body: "Listed under the directory category and subcategory you picked.",
      },
      {
        where: "Search results",
        body: "People find the event when they search Godesi for what it is.",
      },
      {
        where: "Eventringer.com",
        body: "Our dedicated events site publishes a full page of its own for the event, so it can rank on its own and send bookings back to Godesi.",
      },
      {
        where: "Newsletter (if featured)",
        body: "Featured events may be included in the Godesi newsletter.",
      },
    ],
    reasons: [
      "Easy event posting — two minutes, no approval queue",
      "Low fees, and none at all on a paid plan or a free event",
      "Real ticketing: card payment, QR tickets, tiers and coupon codes",
      "Ticket management with a dashboard and door check-ins",
      "The audience is already desi, in your own city",
      "Publish once, get found everywhere across the Godesi network",
      "Vendor booth and sponsorship slots find you through the filters",
      "Real support from real people",
    ],
  };
}
