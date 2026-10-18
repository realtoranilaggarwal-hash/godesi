"use client";

import { useState } from "react";

export type WhyAgentCard = {
  name: string;
  place: string;
  logoUrl: string | null;
  href: string;
  verified: boolean;
  claimed: boolean;
  featured: boolean;
  yearsExperience: number | null;
  specialties: string[];
};

type Mode = "sell" | "buy";

const REASONS: Record<Mode, { icon: string; title: string; body: string }[]> = {
  sell: [
    {
      icon: "🧭",
      title: "Less stress, fewer surprises",
      body: "Your agent prices the home, runs the showings and handles the paperwork and back-and-forth with buyers.",
    },
    {
      icon: "💰",
      title: "Get the best price",
      body: "Local sold prices, prep tips and firm negotiating help you keep more money at closing.",
    },
    {
      icon: "⏱️",
      title: "Sell sooner",
      body: "The MLS and the agent's own buyer contacts put your home in front of serious buyers from day one.",
    },
  ],
  buy: [
    {
      icon: "🤝",
      title: "Someone in your corner",
      body: "From pre-approval to the keys, your agent explains each step and every paper before you sign.",
    },
    {
      icon: "🔑",
      title: "Find the right home faster",
      body: "Agents hear about new homes early and skip the ones that don't fit your list.",
    },
    {
      icon: "📈",
      title: "Make your budget go further",
      body: "Smart offers, inspection requests and negotiation can save you money on price and repairs.",
    },
  ],
};

/** Buyer/seller explainer with a sample local agent and a free compare-agents request. */
export function WhyAgent({
  agent,
  action,
  joinHref,
}: {
  agent: WhyAgentCard | null;
  /** Requirement form the city goes to (GET). */
  action: string;
  /** Where an agent without a profile claims one. */
  joinHref: string;
}) {
  const [mode, setMode] = useState<Mode>("sell");

  return (
    <section className="rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50 via-white to-sky-50 p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <HouseArt />
          <div>
            <h2 className="text-lg font-black sm:text-xl">
              Why work with a real estate agent?
            </h2>
            <p className="text-sm text-slate-600">
              A good local agent saves you time, money and worry.
            </p>
          </div>
        </div>
        <div
          role="tablist"
          aria-label="Selling or buying"
          className="flex rounded-full bg-white p-1 text-sm font-bold shadow-sm ring-1 ring-slate-200"
        >
          {(["sell", "buy"] as const).map((value) => (
            <button
              key={value}
              type="button"
              role="tab"
              aria-selected={mode === value}
              onClick={() => setMode(value)}
              className={`rounded-full px-4 py-1.5 ${
                mode === value
                  ? "bg-indigo-600 text-white"
                  : "text-slate-600 hover:text-indigo-700"
              }`}
            >
              {value === "sell" ? "🏷️ Selling" : "🏡 Buying"}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_300px]">
        <ul className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
          {REASONS[mode].map((reason) => (
            <li key={reason.title} className="flex gap-3">
              <span
                aria-hidden
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-xl shadow-sm ring-1 ring-indigo-100"
              >
                {reason.icon}
              </span>
              <div>
                <p className="font-bold">{reason.title}</p>
                <p className="text-sm text-slate-600">{reason.body}</p>
              </div>
            </li>
          ))}
        </ul>

        <div className="space-y-3">
          {agent ? (
            <a
              href={agent.href}
              className="flex gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm hover:shadow-md"
            >
              {agent.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={agent.logoUrl}
                  alt=""
                  className="h-14 w-14 shrink-0 rounded-xl object-cover"
                />
              ) : (
                <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-sky-100 text-2xl">
                  🏡
                </span>
              )}
              <div className="min-w-0 text-sm">
                <p className="text-[11px] font-bold uppercase tracking-wide text-indigo-600">
                  Local agent
                </p>
                <p className="truncate font-bold">{agent.name}</p>
                <p className="text-slate-600">{agent.place}</p>
                <p className="mt-1 flex flex-wrap gap-1 text-[11px] font-semibold">
                  {agent.featured ? (
                    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-amber-800">
                      ⭐ Featured
                    </span>
                  ) : null}
                  {agent.verified ? (
                    <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-emerald-800">
                      ✔ Licence verified
                    </span>
                  ) : agent.claimed ? (
                    <span className="rounded-full bg-sky-100 px-2 py-0.5 text-sky-800">
                      Claimed
                    </span>
                  ) : null}
                  {agent.yearsExperience ? (
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-slate-700">
                      {agent.yearsExperience}+ yrs
                    </span>
                  ) : null}
                </p>
                {agent.specialties.length ? (
                  <p className="mt-1 line-clamp-1 text-xs text-slate-500">
                    {agent.specialties.slice(0, 3).join(" · ")}
                  </p>
                ) : null}
              </div>
            </a>
          ) : (
            <a
              href={joinHref}
              className="flex items-center gap-3 rounded-xl border border-dashed border-indigo-300 bg-white p-3 text-sm hover:bg-indigo-50"
            >
              <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-2xl">
                🧑‍💼
              </span>
              <span>
                <span className="block font-bold">Your profile here</span>
                <span className="text-slate-600">
                  Agents: claim your free card →
                </span>
              </span>
            </a>
          )}

          <form
            action={action}
            method="get"
            className="rounded-xl bg-indigo-600 p-3 text-white"
          >
            <input type="hidden" name="category" value="real-estate" />
            <input type="hidden" name="do" value={mode} />
            <label className="text-sm font-bold" htmlFor="why-agent-city">
              {mode === "sell"
                ? "Where is the home you're selling?"
                : "Where do you want to buy?"}
            </label>
            <div className="mt-2 flex gap-2">
              <input
                id="why-agent-city"
                name="city"
                required
                maxLength={80}
                placeholder="City or ZIP"
                className="min-w-0 flex-1 rounded-lg px-3 py-2 text-sm text-slate-900"
              />
              <button className="shrink-0 rounded-lg bg-amber-400 px-3 py-2 text-sm font-bold text-slate-900 hover:bg-amber-300">
                Compare agents
              </button>
            </div>
            <p className="mt-1.5 text-[11px] text-white/80">
              Free, no obligation. Local agents see your request and reach out.
            </p>
          </form>
        </div>
      </div>
    </section>
  );
}

function HouseArt() {
  return (
    <svg viewBox="0 0 64 64" className="h-12 w-12 shrink-0" aria-hidden>
      <circle cx="32" cy="32" r="30" fill="#e0e7ff" />
      <path
        d="M14 32 32 16l18 16"
        fill="none"
        stroke="#4338ca"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <rect
        x="19"
        y="30"
        width="26"
        height="18"
        rx="2"
        fill="#fff"
        stroke="#4338ca"
        strokeWidth="3"
      />
      <rect x="28" y="36" width="8" height="12" fill="#f59e0b" />
      <circle cx="47" cy="44" r="7" fill="#10b981" />
      <path
        d="m44 44 2 2 4-4"
        fill="none"
        stroke="#fff"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}
