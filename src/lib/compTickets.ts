import type { CouponEventOption } from "@/components/forms/CouponForms";

/** Event dropdown rows for the coupon forms, dated in New Jersey time. */
export function compEventOptions(
  events: {
    id: string;
    title: string;
    startsAt: Date;
    currency: string;
    tiers: { id: string; name: string; price: number }[];
  }[],
): CouponEventOption[] {
  return events.map((event) => ({
    id: event.id,
    title: event.title,
    date: event.startsAt.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      timeZone: "America/New_York",
    }),
    currency: event.currency,
    tiers: event.tiers,
  }));
}

/** Comp-able events: GoDesi-run listings with at least one entry ticket (sponsor packages book separately). */
export function compTicketEventOptions(
  events: {
    id: string;
    title: string;
    startsAt: Date;
    currency: string;
    sourceId: string | null;
    tiers: { id: string; name: string; price: number; kind: string }[];
  }[],
): CouponEventOption[] {
  return compEventOptions(
    events
      .filter((event) => event.sourceId === null)
      .map((event) => ({
        ...event,
        tiers: event.tiers
          .filter((tier) => tier.kind !== "SPONSOR")
          .map(({ id, name, price }) => ({ id, name, price })),
      }))
      .filter((event) => event.tiers.length),
  );
}
