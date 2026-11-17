"use client";

import { useState } from "react";
import { useFormState } from "react-dom";
import {
  type CompTicketsState,
  createCouponAction,
  createEventCouponAction,
  sendCompTicketsAction,
} from "@/app/actions/coupons";
import { emptyState } from "@/lib/actions";
import { SubmitButton } from "@/components/SubmitButton";
import { Field, inputClass } from "@/components/ui";
import { FormError } from "@/components/forms/FormError";
import { FormSuccess } from "@/components/forms/FormSuccess";
import { formatMoney } from "@/lib/format";

export type CouponEventOption = {
  id: string;
  title: string;
  date: string;
  currency: string;
  tiers: { id: string; name: string; price: number }[];
};

/** Optional "how many of each ticket" boxes (`tierMax_<tierId>`) for a code locked to one event. */
function TierLimitFields({ event }: { event: CouponEventOption }) {
  if (!event.tiers.length) return null;
  return (
    <fieldset className="rounded-lg border border-slate-200 p-3 sm:col-span-2">
      <legend className="px-1 text-sm font-medium text-slate-700">
        Only these tickets (optional)
      </legend>
      <p className="mb-2 text-xs text-slate-500">
        Type how many of each ticket the code covers, e.g. Couple 1 + Small
        Kid 1 with 100% off is a comp for exactly that package — anything
        else in the cart is paid. A fixed amount (e.g. $10 off with Adult
        10) comes off once per order and only when the cart has those
        tickets. Leave all blank to discount the whole order.
      </p>
      <div className="grid gap-2 sm:grid-cols-2">
        {event.tiers.map((tier) => (
          <label
            key={tier.id}
            className="flex min-w-0 items-center justify-between gap-2 text-sm"
          >
            <span className="min-w-0 break-words">
              {tier.name}{" "}
              <span className="text-xs text-slate-400">
                {formatMoney(tier.price, event.currency)}
              </span>
            </span>
            <span className="w-20 shrink-0">
              <input
                name={`tierMax_${tier.id}`}
                type="number"
                min={1}
                max={10}
                placeholder="—"
                aria-label={`${tier.name} tickets covered`}
                className={inputClass}
              />
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

/** Admin ticket codes: lock to one event, and optionally to a set number of each ticket type. */
function TicketCouponFields({ events }: { events: CouponEventOption[] }) {
  const [eventId, setEventId] = useState("");
  const event = events.find((item) => item.id === eventId);

  return (
    <>
      <Field
        label="Event"
        hint="Optional — lock the code to one event, like organiser codes"
        className="sm:col-span-2"
      >
        <select
          name="eventId"
          value={eventId}
          onChange={(change) => setEventId(change.target.value)}
          className={inputClass}
        >
          <option value="">Any event</option>
          {events.map((item) => (
            <option key={item.id} value={item.id}>
              {item.title} · {item.date}
            </option>
          ))}
        </select>
      </Field>
      {event ? <TierLimitFields event={event} /> : null}
    </>
  );
}

function DiscountFields({ withCurrency }: { withCurrency: boolean }) {
  return (
    <>
      <Field label="Discount type">
        <select
          name="discountKind"
          defaultValue="PERCENT"
          className={inputClass}
        >
          <option value="PERCENT">Percent off</option>
          <option value="FIXED">Fixed amount off</option>
        </select>
      </Field>
      <Field
        label="Amount"
        hint="e.g. 20 for 20% off, or 500 for ₹500 off — leave blank if the code only adds months"
      >
        <input name="amount" type="number" min={0} className={inputClass} />
      </Field>
      {withCurrency ? (
        <Field label="Currency" hint="Fixed-amount codes only; event codes use the event's currency">
          <select name="currency" defaultValue="USD" className={inputClass}>
            <option value="USD">USD ($)</option>
            <option value="INR">INR (₹)</option>
          </select>
        </Field>
      ) : null}
      <Field label="Total uses" hint="Leave blank for unlimited">
        <input
          name="maxRedemptions"
          type="number"
          min={1}
          className={inputClass}
        />
      </Field>
      <Field label="Expires on" hint="Optional">
        <input name="expiresAt" type="date" className={inputClass} />
      </Field>
    </>
  );
}

/** Admin-only: a platform code you can hand to clients. */
export function CouponForm({
  events = [],
}: {
  events?: CouponEventOption[];
}) {
  const [state, formAction] = useFormState(createCouponAction, emptyState);
  const [scope, setScope] = useState("PLAN");

  return (
    <form action={formAction} className="space-y-3">
      <FormError>{state.error}</FormError>
      <FormSuccess>{state.success}</FormSuccess>

      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Code" hint="Letters, numbers and dashes">
          <input
            name="code"
            required
            placeholder="WELCOME20"
            className={`${inputClass} uppercase`}
          />
        </Field>
        <Field label="Applies to">
          <select
            name="scope"
            value={scope}
            onChange={(change) => setScope(change.target.value)}
            className={inputClass}
          >
            <option value="PLAN">Plan upgrades</option>
            <option value="BUNDLE">Complete package</option>
            <option value="ADS">Advertising</option>
            <option value="TICKETS">Event tickets</option>
            <option value="WEBSITE">Websites (one-time setup fee)</option>
          </select>
        </Field>
        {scope === "TICKETS" ? <TicketCouponFields events={events} /> : null}
        <Field
          label="Extra months free"
          hint="Package codes only — 48 turns the one-year package into five years"
        >
          <input
            name="bonusMonths"
            type="number"
            min={0}
            max={120}
            defaultValue={0}
            className={inputClass}
          />
        </Field>
        <DiscountFields withCurrency />
        <label className="flex items-start gap-2 text-sm sm:col-span-2">
          <input
            type="checkbox"
            name="publicOffer"
            className="mt-1 h-4 w-4 accent-emerald-600"
          />
          <span>
            Show this code as a flash offer on the upgrade page
            <span className="block text-xs text-slate-500">
              Leave off for caller-only codes. With a use limit it reads “only N
              left at this price”.
            </span>
          </span>
        </label>
      </div>

      <SubmitButton pendingLabel="Creating…">Create coupon</SubmitButton>
    </form>
  );
}

/** Organiser view: a code limited to one of their own events. */
export function EventCouponForm({
  events,
  canLimitTiers,
}: {
  events: CouponEventOption[];
  canLimitTiers: boolean;
}) {
  const [state, formAction] = useFormState(createEventCouponAction, emptyState);
  const [eventId, setEventId] = useState(events[0]?.id ?? "");
  const event = events.find((item) => item.id === eventId);

  return (
    <form action={formAction} className="space-y-3">
      <FormError>{state.error}</FormError>
      <FormSuccess>{state.success}</FormSuccess>

      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Event">
          <select
            name="eventId"
            required
            value={eventId}
            onChange={(change) => setEventId(change.target.value)}
            className={inputClass}
          >
            {events.map((item) => (
              <option key={item.id} value={item.id}>
                {item.title}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Code" hint="Share this with your customers">
          <input
            name="code"
            required
            placeholder="EARLYBIRD"
            className={`${inputClass} uppercase`}
          />
        </Field>
        <DiscountFields withCurrency={false} />
        {event?.tiers.length ? (
          canLimitTiers ? (
            <TierLimitFields event={event} />
          ) : (
            <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800 sm:col-span-2">
              Want a code that covers only set tickets, e.g. 3 Adult or 1
              Couple, and charges anything extra?{" "}
              <a href="/upgrade" className="font-semibold underline">
                Upgrade to Featured (Premium)
              </a>
              .
            </p>
          )
        ) : null}
      </div>

      <SubmitButton pendingLabel="Creating…">Create coupon</SubmitButton>
    </form>
  );
}

const emptyCompState: CompTicketsState = {};

/** Organiser/admin: email a buyer a one-use code that makes the chosen tickets free. */
export function SendCompTicketsForm({
  events,
}: {
  events: CouponEventOption[];
}) {
  const [state, formAction] = useFormState(sendCompTicketsAction, emptyCompState);
  const [eventId, setEventId] = useState(events[0]?.id ?? "");
  const [quantities, setQuantities] = useState<Record<string, string>>({});
  const [kind, setKind] = useState<"PERCENT" | "FIXED">("PERCENT");
  const [amount, setAmount] = useState("");
  const event = events.find((item) => item.id === eventId);
  const total = (event?.tiers ?? []).reduce(
    (sum, tier) => sum + tier.price * (Number(quantities[tier.id]) || 0),
    0,
  );

  return (
    <form action={formAction} className="space-y-3">
      {state.code ? (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm">
          <p className="text-xs text-slate-500">Code to text the buyer</p>
          <p className="select-all break-all font-mono text-lg font-bold tracking-wide text-emerald-800">
            {state.code}
          </p>
          <p className="text-xs text-slate-600">
            {state.emailed ? "✅ Email sent" : "⚠️ Email not sent"}
          </p>
        </div>
      ) : null}
      <FormError>{state.error}</FormError>
      <FormSuccess>{state.success}</FormSuccess>

      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Event" className="sm:col-span-2">
          <select
            name="eventId"
            required
            value={eventId}
            onChange={(change) => {
              setEventId(change.target.value);
              setQuantities({});
            }}
            className={inputClass}
          >
            {events.map((item) => (
              <option key={item.id} value={item.id}>
                {item.title} · {item.date}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Buyer name">
          <input name="name" required maxLength={80} placeholder="Ravi Sharma" className={inputClass} />
        </Field>
        <Field label="Buyer email">
          <input name="email" type="email" required placeholder="ravi@example.com" className={inputClass} />
        </Field>
      </div>

      {event?.tiers.length ? (
        <fieldset className="rounded-lg border border-slate-200 p-3">
          <legend className="px-1 text-sm font-medium text-slate-700">
            Tickets to send
          </legend>
          <div className="grid gap-2 sm:grid-cols-2">
            {event.tiers.map((tier) => (
              <label
                key={tier.id}
                className="flex min-w-0 items-center justify-between gap-2 text-sm"
              >
                <span className="min-w-0 break-words">
                  {tier.name}{" "}
                  <span className="text-xs text-slate-400">
                    {formatMoney(tier.price, event.currency)}
                  </span>
                </span>
                <span className="w-20 shrink-0">
                  <input
                    name={`compQty_${tier.id}`}
                    type="number"
                    min={0}
                    max={10}
                    placeholder="0"
                    value={quantities[tier.id] ?? ""}
                    onChange={(change) =>
                      setQuantities((prev) => ({
                        ...prev,
                        [tier.id]: change.target.value,
                      }))
                    }
                    aria-label={`${tier.name} tickets to send`}
                    className={inputClass}
                  />
                </span>
              </label>
            ))}
          </div>
          <p className="mt-2 text-xs text-slate-500">
            Total {formatMoney(total, event.currency)}. Extra tickets the buyer
            adds are charged at full price.
          </p>
        </fieldset>
      ) : (
        <p className="text-sm text-slate-500">
          This event has no ticket types yet — add them on the event first.
        </p>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Discount">
          <select
            name="discountKind"
            value={kind}
            onChange={(change) =>
              setKind(change.target.value as "PERCENT" | "FIXED")
            }
            className={inputClass}
          >
            <option value="PERCENT">100% off selected tickets</option>
            <option value="FIXED">Fixed dollar amount</option>
          </select>
        </Field>
        {kind === "FIXED" ? (
          <Field
            label={`Amount off (${event?.currency ?? "USD"})`}
            hint="Comes off the tickets above — e.g. what they paid by Zelle"
          >
            <input
              name="amount"
              type="number"
              min={1}
              value={amount}
              placeholder={total ? String(total) : ""}
              onChange={(change) => setAmount(change.target.value)}
              className={inputClass}
            />
          </Field>
        ) : null}
      </div>

      <SubmitButton pendingLabel="Sending…">Send comp tickets</SubmitButton>
    </form>
  );
}
