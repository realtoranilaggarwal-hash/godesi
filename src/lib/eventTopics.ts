/**
 * Topic buckets for Anil's satellite sites: each site shows the host's events
 * whose title, description or tags mention its subject.
 */
export const EVENT_TOPICS = {
  "real-estate": [
    "real estate", "realtor", "home buyer", "homebuyer", "home buying",
    "buying a home", "selling a home", "sell your home", "home seller",
    "open house", "first-time buyer", "first time buyer", "property",
    "properties", "housing", "1031", "landlord", "broker",
  ],
  flips: [
    "flip", "flipping", "fix and flip", "fix & flip", "rehab", "renovation",
    "construction", "wholesal", "distressed", "auction", "foreclosure",
  ],
  mortgage: [
    "mortgage", "refinanc", "refi", "home loan", "pre-approval",
    "preapproval", "pre approval", "interest rate", "down payment", "heloc",
    "lender", "lending", "fha",
  ],
  insurance: [
    "insurance", "iul", "annuit", "retirement", "life policy", "term life",
    "whole life", "final expense", "estate planning", "wills", "trust",
    "1035", "financial planning",
  ],
} as const;

export type EventTopic = keyof typeof EVENT_TOPICS;

export function isEventTopic(value: string): value is EventTopic {
  return Object.prototype.hasOwnProperty.call(EVENT_TOPICS, value);
}

export function eventMatchesTopic(
  event: { title: string; description?: string | null; tags?: string[] },
  topic: EventTopic,
) {
  const text = [event.title, event.description ?? "", ...(event.tags ?? [])]
    .join(" ")
    .toLowerCase();
  return EVENT_TOPICS[topic].some((word) =>
    new RegExp(`\\b${word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`).test(text),
  );
}
