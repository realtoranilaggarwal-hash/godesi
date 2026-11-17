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
