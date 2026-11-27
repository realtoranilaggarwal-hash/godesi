"use client";

import { useState, type ReactNode } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { startCustomWebsiteAction } from "@/app/actions/websiteBuilder";
import { emptyState } from "@/lib/actions";
import { Button, Field, inputClass } from "@/components/ui";
import { FormError } from "@/components/forms/FormError";
import { ALBUM_LINK_STEPS } from "@/components/forms/PhotoAlbumField";
import { PLAYLIST_LINK_STEPS } from "@/components/forms/PlaylistField";
import { WEBSITE_CONTENT_PACKAGE, WEBSITE_OFFER } from "@/lib/websiteOffer";
import {
  CUSTOM_INCLUDES,
  CUSTOM_PAGE_NAMES,
  CUSTOM_SOURCES,
  EXAMPLE_SITE_KEYS,
  EXTRA_SOCIAL_SOURCES,
  MEDIA_SOURCES,
  WEBSITE_CATEGORIES,
  WEBSITE_GOALS,
} from "@/lib/websiteBuilder";

const NAMESILO_URL = "https://www.namesilo.com/?rid=8ec0177ty";
const DEFAULT_PAGES = ["Home", "About us", "Services", "Contact"];
const GOAL_KEYS = [
  "call",
  "whatsapp",
  "inquiry",
  "appointment",
  "quote",
  "buy",
  "order-food",
  "ai-chat",
  "reviews",
];
const LINK_STEPS: Record<string, readonly string[]> = {
  googleAlbum: ALBUM_LINK_STEPS,
  youtubePlaylist: PLAYLIST_LINK_STEPS,
};
const usd = (amount: number) => `$${amount.toLocaleString("en-US")}`;
const GOALS = WEBSITE_GOALS.filter((goal) => GOAL_KEYS.includes(goal.key));

function SendButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full py-3 text-base">
      {pending ? "Sending…" : "🚀 Send my website request"}
    </Button>
  );
}

function Section({ n, title, lead, children }: { n: number; title: string; lead?: string; children: ReactNode }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="text-xs font-bold uppercase tracking-wide text-indigo-600">Section {n}</div>
      <h2 className="text-lg font-black text-slate-900">{title}</h2>
      {lead ? <p className="text-sm text-slate-600">{lead}</p> : null}
      <div className="mt-3 space-y-3">{children}</div>
    </section>
  );
}

function HowTo({ steps }: { steps: readonly string[] }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="mt-2 text-xs font-semibold text-indigo-700 underline"
      >
        {open
          ? "Hide the steps"
          : `How do I get this link? (${steps.length} steps)`}
      </button>
      {open ? (
        <ol className="mt-2 list-decimal space-y-1 rounded-xl bg-indigo-50 p-3 pl-7 text-xs text-indigo-900">
          {steps.map((step) => (
            <li key={step}>{step.replace("the box above", "the box")}</li>
          ))}
        </ol>
      ) : null}
    </>
  );
}

function Choice({
  on,
  onClick,
  children,
}: {
  on: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={onClick}
      className={`rounded-xl border px-3 py-2 text-sm font-semibold ${
        on ? "border-indigo-600 bg-indigo-600 text-white" : "border-slate-300 bg-white text-slate-700 hover:border-indigo-400"
      }`}
    >
      {children}
    </button>
  );
}

/** The custom website order form, one numbered section per question, with a running price. */
export function CustomWebsiteForm({
  defaults,
}: {
  defaults?: {
    businessName?: string;
    city?: string;
    phone?: string;
    email?: string;
    website?: string;
    wish?: string;
    articles?: boolean;
    ordering?: boolean;
    contentPackage?: boolean;
  };
}) {
  const [state, formAction] = useFormState(startCustomWebsiteAction, emptyState);
  const [hasDomain, setHasDomain] = useState<"yes" | "no" | "">("");
  const [pages, setPages] = useState<string[]>(DEFAULT_PAGES);
  const [goals, setGoals] = useState<string[]>([]);
  const [articles, setArticles] = useState(Boolean(defaults?.articles));
  const [ordering, setOrdering] = useState(Boolean(defaults?.ordering));
  const [category, setCategory] = useState("");
  const [moreLinks, setMoreLinks] = useState(false);
  const [friends, setFriends] = useState([
    { name: "", contact: "" },
    { name: "", contact: "" },
  ]);
  const [code, setCode] = useState("");
  const gift = code.trim().toUpperCase() === WEBSITE_OFFER.giftCode;
  const referred =
    friends.filter((friend) => friend.name.trim() && friend.contact.trim())
      .length >= WEBSITE_OFFER.referralFriends;
  const restaurant = category === "Restaurant";
  const orderingLabel = restaurant
    ? "Online menu & ordering"
    : "Online ordering system";
  const yearly =
    WEBSITE_OFFER.customHostingYearUsd +
    (articles ? WEBSITE_OFFER.dailyArticlesUsd : 0);
  const today =
    WEBSITE_OFFER.customPriceUsd +
    yearly -
    (referred ? WEBSITE_OFFER.customHostingYearUsd : 0) +
    (ordering ? WEBSITE_OFFER.onlineOrderingUsd : 0);
  const packageToday =
    WEBSITE_CONTENT_PACKAGE.priceUsd +
    (ordering ? WEBSITE_OFFER.onlineOrderingUsd : 0) +
    (articles ? WEBSITE_OFFER.dailyArticlesUsd : 0);
  const setFriend = (index: number, field: "name" | "contact", value: string) =>
    setFriends(
      friends.map((friend, i) =>
        i === index ? { ...friend, [field]: value } : friend,
      ),
    );
  const toggle = (list: string[], value: string) =>
    list.includes(value) ? list.filter((item) => item !== value) : [...list, value];

  const estimate = defaults?.contentPackage ? (
    <div className="rounded-2xl border-2 border-amber-300 bg-amber-50 p-4 text-sm">
      <h2 className="font-black text-slate-900">Your package</h2>
      <ul className="mt-2 space-y-1.5">
        <li className="flex justify-between gap-2">
          <span>Website + Content package, first year</span>
          <strong className="shrink-0">{usd(WEBSITE_CONTENT_PACKAGE.priceUsd)}</strong>
        </li>
        {ordering ? (
          <li className="flex justify-between gap-2">
            <span>{orderingLabel}</span>
            <strong className="shrink-0">{usd(WEBSITE_OFFER.onlineOrderingUsd)} once</strong>
          </li>
        ) : null}
        {articles ? (
          <li className="flex justify-between gap-2">
            <span>Daily articles instead of weekly</span>
            <strong className="shrink-0">${WEBSITE_OFFER.dailyArticlesUsd}/year</strong>
          </li>
        ) : null}
      </ul>
      <div className="mt-3 border-t border-amber-200 pt-2">
        <div className="flex justify-between gap-2 text-base">
          <span className="font-semibold">First year</span>
          <strong>{usd(packageToday)}</strong>
        </div>
        <div className="text-xs text-slate-600">
          Package: {usd(WEBSITE_CONTENT_PACKAGE.depositUsd)} to start,{" "}
          {usd(WEBSITE_CONTENT_PACKAGE.priceUsd - WEBSITE_CONTENT_PACKAGE.depositUsd)} when your website is finished.
          {packageToday > WEBSITE_CONTENT_PACKAGE.priceUsd ? " Add-ons are billed on the same invoice." : ""}
          From year 2: {WEBSITE_CONTENT_PACKAGE.renewals.join(" · ")}.
        </div>
      </div>
    </div>
  ) : (
    <div className="rounded-2xl border-2 border-emerald-200 bg-emerald-50/70 p-4 text-sm">
      <h2 className="font-black text-slate-900">Your price</h2>
      <ul className="mt-2 space-y-1.5">
        <li className="flex justify-between gap-2">
          <span>Custom website</span>
          <span className="text-right">
            <s className="mr-1 text-slate-400">
              {usd(WEBSITE_OFFER.customListPriceUsd)}
            </s>
            <strong>{usd(WEBSITE_OFFER.customPriceUsd)} once</strong>
          </span>
        </li>
        <li className="flex justify-between gap-2">
          <span>Hosting</span>
          <strong>${WEBSITE_OFFER.customHostingYearUsd}/year</strong>
        </li>
        {referred ? (
          <li className="flex justify-between gap-2 text-emerald-800">
            <span>Hosting, year 1 (2 referrals)</span>
            <strong className="shrink-0">FREE</strong>
          </li>
        ) : null}
        {ordering ? (
          <li className="flex justify-between gap-2">
            <span>{orderingLabel}</span>
            <strong>{usd(WEBSITE_OFFER.onlineOrderingUsd)} once</strong>
          </li>
        ) : null}
        {articles ? (
          <li className="flex justify-between gap-2">
            <span>Daily articles</span>
            <strong>${WEBSITE_OFFER.dailyArticlesUsd}/year</strong>
          </li>
        ) : null}
        {gift ? (
          <li className="flex justify-between gap-2 text-emerald-800">
            <span>GoDesi featured ad, 1 yr</span>
            <strong className="shrink-0">FREE</strong>
          </li>
        ) : null}
      </ul>
      <div className="mt-3 border-t border-emerald-200 pt-2">
        <div className="flex justify-between gap-2 text-base">
          <span className="font-semibold">First year</span>
          <strong>{usd(today)}</strong>
        </div>
        <div className="text-xs text-slate-600">Then ${yearly}/year. You pay only after you love the preview.</div>
      </div>
    </div>
  );

  return (
    <form action={formAction} className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_240px]">
      {defaults?.contentPackage ? <input type="hidden" name="contentPackage" value="1" /> : null}
      <div className="min-w-0 space-y-5">
        <FormError>{state.error}</FormError>

        <Section n={1} title="Your contact information" lead="We send your private website preview here.">
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Your name">
              <input name="contactName" className={inputClass} />
            </Field>
            <Field label="Business name" required>
              <input name="businessName" required defaultValue={defaults?.businessName} className={inputClass} />
            </Field>
            <Field label="Email" required>
              <input name="email" type="email" required defaultValue={defaults?.email} className={inputClass} />
            </Field>
            <Field label="Phone">
              <input name="phone" type="tel" defaultValue={defaults?.phone} className={inputClass} />
            </Field>
            <Field label="WhatsApp">
              <input name="whatsapp" type="tel" className={inputClass} />
            </Field>
            <Field label="City" required>
              <input name="city" required defaultValue={defaults?.city} className={inputClass} />
            </Field>
          </div>
        </Section>

        <Section n={2} title="Your business">
          <Field label="What type of business do you have?" required>
            <select
              name="category"
              required
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              className={inputClass}
            >
              <option value="" disabled>
                Pick one…
              </option>
              {WEBSITE_CATEGORIES.map((category) => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </Field>
          <div>
            <p className="text-sm font-medium text-slate-700">What should visitors do on your website? (pick any)</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {GOALS.map((goal) => (
                <Choice key={goal.key} on={goals.includes(goal.key)} onClick={() => setGoals(toggle(goals, goal.key))}>
                  {goal.emoji} {goal.label}
                </Choice>
              ))}
            </div>
            {goals.map((key) => (
              <input key={key} type="hidden" name="goals" value={key} />
            ))}
          </div>
        </Section>

        <Section n={3} title="Your domain" lead="Your domain is your website's address, like mybusiness.com.">
          <p className="text-sm font-medium text-slate-700">Do you already own a domain?</p>
          <div className="flex flex-wrap gap-2">
            <Choice on={hasDomain === "yes"} onClick={() => setHasDomain("yes")}>Yes, I have one</Choice>
            <Choice on={hasDomain === "no"} onClick={() => setHasDomain("no")}>No, I need one</Choice>
          </div>
          {hasDomain === "yes" ? (
            <Field label="Your domain">
              <input name="domain" placeholder="mybusiness.com" className={inputClass} />
            </Field>
          ) : null}
          {hasDomain === "no" ? (
            <div className="space-y-2 rounded-xl bg-indigo-50 p-3 text-sm text-slate-700">
              <p>
                Book it first at NameSilo, about $10–15 a year. Keep it short, match your business
                name, and pick .com if you can. Then type it below.
              </p>
              <a
                href={NAMESILO_URL}
                target="_blank"
                rel="noopener noreferrer nofollow sponsored"
                className="inline-block rounded-xl bg-indigo-600 px-4 py-2 font-semibold text-white hover:bg-indigo-700"
              >
                Search domains on NameSilo →
              </a>
              <p className="text-xs text-slate-500">Referral link; it costs you nothing extra.</p>
              <Field label="The domain you booked (or leave blank and we help you)">
                <input name="domain" placeholder="mybusiness.com" className={inputClass} />
              </Field>
            </div>
          ) : null}
        </Section>

        <Section
          n={4}
          title={`Your website — ${usd(WEBSITE_OFFER.customPriceUsd)}`}
          lead={`Regular price ${usd(WEBSITE_OFFER.customListPriceUsd)}, now ${usd(WEBSITE_OFFER.customPriceUsd)} for a limited time. Everything below is included. Hosting is $${WEBSITE_OFFER.customHostingYearUsd} a year.`}
        >
          <ul className="grid gap-1.5 text-sm text-slate-700 sm:grid-cols-2">
            {CUSTOM_INCLUDES.map((line) => (
              <li key={line}>✅ {line}</li>
            ))}
          </ul>
        </Section>

        <Section
          n={5}
          title="Pages you want"
          lead="Tap the pages you need. Tell us what each should say, or leave it empty and we write it."
        >
          <div className="flex flex-wrap gap-2">
            {CUSTOM_PAGE_NAMES.map((name) => (
              <Choice key={name} on={pages.includes(name)} onClick={() => setPages(toggle(pages, name))}>
                {name}
              </Choice>
            ))}
          </div>
          {CUSTOM_PAGE_NAMES.map((name, index) =>
            pages.includes(name) ? (
              <div key={name} className="rounded-xl border border-slate-200 bg-slate-50/60 p-3">
                <input type="hidden" name={`pageOn${index}`} value="1" />
                <input type="hidden" name={`pageName${index}`} value={name} />
                <label className="text-sm font-semibold text-slate-800" htmlFor={`pageText${index}`}>
                  {name}
                </label>
                <textarea
                  id={`pageText${index}`}
                  name={`pageText${index}`}
                  rows={3}
                  maxLength={6000}
                  placeholder={`What should the ${name} page say? (optional)`}
                  className={`${inputClass} mt-1`}
                />
              </div>
            ) : null,
          )}
        </Section>

        <Section
          n={6}
          title="Photos and videos"
          lead="Share a Google Photos album and a YouTube playlist. We turn them into a photo gallery and a video gallery on your site."
        >
          <div className="grid gap-3 sm:grid-cols-2">
            {MEDIA_SOURCES.map((source) => (
              <Field key={source.key} label={source.label}>
                <input
                  name={source.key}
                  inputMode="url"
                  placeholder={source.placeholder}
                  className={inputClass}
                />
                <HowTo steps={LINK_STEPS[source.key]} />
              </Field>
            ))}
          </div>
        </Section>

        <Section
          n={7}
          title="Where you are online now (optional)"
          lead="Paste any links you have. We pull your photos, reviews, services and wording from them."
        >
          <div className="grid gap-3 sm:grid-cols-2">
            {CUSTOM_SOURCES.map((source) => (
              <Field key={source.key} label={source.label}>
                <input
                  name={source.key}
                  inputMode="url"
                  placeholder={source.placeholder}
                  defaultValue={source.key === "website" ? defaults?.website : undefined}
                  className={inputClass}
                />
              </Field>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setMoreLinks(!moreLinks)}
            className="text-sm font-semibold text-indigo-700 underline"
          >
            {moreLinks
              ? "Hide more links"
              : `+ More social links (YouTube, TikTok, X, WhatsApp and ${EXTRA_SOCIAL_SOURCES.length - 4} more)`}
          </button>
          <div className={moreLinks ? "grid gap-3 sm:grid-cols-2" : "hidden"}>
            {EXTRA_SOCIAL_SOURCES.map((source) => (
              <Field key={source.key} label={source.label}>
                <input
                  name={source.key}
                  inputMode="url"
                  placeholder={source.placeholder}
                  className={inputClass}
                />
              </Field>
            ))}
          </div>
        </Section>

        <Section n={8} title="Websites you like (optional)" lead="Up to three sites whose look you like, any business, anywhere.">
          <div className="grid gap-3 sm:grid-cols-3">
            {EXAMPLE_SITE_KEYS.map((key, index) => (
              <Field key={key} label={`Example ${index + 1}`}>
                <input name={key} inputMode="url" placeholder="https://…" className={inputClass} />
              </Field>
            ))}
          </div>
        </Section>

        <Section n={9} title="Add-ons (optional)">
          <label
            className={`flex items-start gap-3 rounded-xl border p-3 text-sm text-slate-700 ${
              restaurant
                ? "border-orange-300 bg-orange-50"
                : "border-slate-200 bg-slate-50"
            }`}
          >
            <input
              type="checkbox"
              name="onlineOrdering"
              value="1"
              checked={ordering}
              onChange={(event) => setOrdering(event.target.checked)}
              className="mt-0.5 h-4 w-4 shrink-0 accent-orange-600"
            />
            <span>
              <strong>
                {restaurant ? "🍽️ " : "🛒 "}
                {orderingLabel} — {usd(WEBSITE_OFFER.onlineOrderingUsd)} one
                time.
              </strong>{" "}
              {restaurant
                ? "Customers see your menu, place their order on your website and pay online, and the order comes straight to you."
                : "Customers order and pay on your website, and each order comes straight to you."}{" "}
              We connect it to your payment gateway (like Stripe, Square or
              PayPal).
            </span>
          </label>
          <label className="flex items-start gap-3 rounded-xl border border-fuchsia-200 bg-fuchsia-50 p-3 text-sm text-slate-700">
            <input
              type="checkbox"
              name="dailyArticles"
              value="1"
              checked={articles}
              onChange={(event) => setArticles(event.target.checked)}
              className="mt-0.5 h-4 w-4 shrink-0 accent-fuchsia-600"
            />
            <span>
              <strong>Daily articles — ${WEBSITE_OFFER.dailyArticlesUsd}/year.</strong> One article a
              day for 365 days, with a picture and hashtags, emailed to you and written for your kind
              of business. Fresh articles help you show up on Google.
            </span>
          </label>
        </Section>

        <Section
          n={10}
          title={`Refer ${WEBSITE_OFFER.referralFriends} friends, get your first year of hosting free`}
          lead={`Know ${WEBSITE_OFFER.referralFriends} people who need a website? Add them here and save $${WEBSITE_OFFER.customHostingYearUsd}. Our team contacts them and confirms your free year.`}
        >
          <div className="grid gap-3 sm:grid-cols-2">
            {friends.map((friend, index) => (
              <div
                key={index}
                className="space-y-2 rounded-xl border border-slate-200 bg-slate-50/60 p-3"
              >
                <Field label={`Friend ${index + 1} name`}>
                  <input
                    name={`friend${index + 1}Name`}
                    value={friend.name}
                    onChange={(event) =>
                      setFriend(index, "name", event.target.value)
                    }
                    maxLength={120}
                    className={inputClass}
                  />
                </Field>
                <Field label="Phone or email">
                  <input
                    name={`friend${index + 1}Contact`}
                    value={friend.contact}
                    onChange={(event) =>
                      setFriend(index, "contact", event.target.value)
                    }
                    maxLength={160}
                    className={inputClass}
                  />
                </Field>
              </div>
            ))}
          </div>
          {referred ? (
            <p className="text-sm font-semibold text-emerald-700">
              ✓ Your first year of hosting is free.
            </p>
          ) : null}
        </Section>

        <Section n={11} title="Special code">
          <Field
            label="Have a code?"
            hint={`Use ${WEBSITE_OFFER.giftCode} to get a free featured ad on GoDesi for 1 year.`}
          >
            <input
              name="code"
              value={code}
              onChange={(event) => setCode(event.target.value)}
              maxLength={40}
              placeholder={WEBSITE_OFFER.giftCode}
              className={`${inputClass} uppercase sm:max-w-xs`}
            />
          </Field>
          {gift ? (
            <p className="text-sm font-semibold text-emerald-700">
              ✓ {WEBSITE_OFFER.giftCode}: your business gets a free featured ad on GoDesi for 1 year.
            </p>
          ) : null}
        </Section>

        <Section n={12} title="Anything else?">
          <Field label="Other wishes, questions, or what to change from your old site">
            <textarea
              name="wish"
              rows={3}
              maxLength={3000}
              defaultValue={defaults?.wish}
              placeholder='e.g. "Modern look, add online booking, show our Google reviews"'
              className={inputClass}
            />
          </Field>
        </Section>

        <div className="lg:hidden">{estimate}</div>
        <SendButton />
      </div>

      <aside className="hidden lg:block">
        <div className="sticky top-24">{estimate}</div>
      </aside>
    </form>
  );
}
