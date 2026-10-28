import Link from "next/link";
import type { ReactNode } from "react";
import { joinGoal } from "@/lib/joinGoals";

type PostOption = { href: string; icon: string; label: string };

const SECTIONS: { title: string; options: PostOption[] }[] = [
  {
    title: "🏠 Homes & rooms",
    options: [
      {
        href: "/listings/new?kind=PROPERTY_SALE",
        icon: "🏠",
        label: "Property for sale",
      },
      {
        href: "/listings/new?kind=PROPERTY_RENT",
        icon: "🔑",
        label: "Property for rent",
      },
      {
        href: "/listings/new?kind=ROOM_OFFERED",
        icon: "🛏️",
        label: "Room available",
      },
      {
        href: "/listings/new?kind=ROOM_WANTED",
        icon: "🔎",
        label: "Looking for a room",
      },
    ],
  },
  {
    title: "🛍️ Buy, sell & offers",
    options: [
      {
        href: "/listings/new?kind=MARKETPLACE",
        icon: "🛍️",
        label: "Something to sell",
      },
      { href: "/dashboard/deals", icon: "🏷️", label: "A deal or coupon" },
      { href: "/leads/new", icon: "📋", label: "A requirement — get quotes" },
    ],
  },
  {
    title: "💼 Business & services",
    options: [
      { href: "/dashboard/profile", icon: "🏪", label: "Business card" },
      {
        href: "/post?type=professional",
        icon: "🎓",
        label: "Professional profile",
      },
      {
        href: "/dashboard/gigs",
        icon: "🛠️",
        label: "A gig (fixed-price service)",
      },
      { href: "/jobs/new", icon: "💼", label: "A job or mini job" },
    ],
  },
  {
    title: "🎉 Events & community",
    options: [
      { href: "/events/new", icon: "🎟️", label: "Event" },
      { href: "/clubs/new", icon: "🎤", label: "Club" },
      { href: "/connect/new", icon: "🤝", label: "Connect profile" },
      {
        href: "/religious/new",
        icon: "🛕",
        label: "Temple / place of worship",
      },
      { href: "/news/report", icon: "📰", label: "News / report" },
      {
        href: "/rishta/new",
        icon: "💍",
        label: "Matrimonial (Rishta) profile",
      },
    ],
  },
];

/** Every kind of post a member can make, grouped, each one click from its form. */
export function PostAnything({
  title,
  hasCard = false,
  goals = [],
  children,
}: {
  title: string;
  /** The member already has their one business/professional card. */
  hasCard?: boolean;
  /** Goals ticked at signup — shown as "your next steps" on top. */
  goals?: string[];
  /** Extra block at the bottom (e.g. the member's profiles). */
  children?: ReactNode;
}) {
  const picked = goals.flatMap((id) => {
    const goal = joinGoal(id);
    return goal ? [goal] : [];
  });
  const sections = hasCard
    ? SECTIONS.map((section) => ({
        ...section,
        options: section.options.flatMap((option) =>
          option.href === "/post?type=professional"
            ? []
            : option.href === "/dashboard/profile"
              ? [{ ...option, label: "My card ✓ — edit" }]
              : [option],
        ),
      }))
    : SECTIONS;
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4">
      <h2 className="text-lg font-bold text-slate-900">{title}</h2>
      {picked.length ? (
        <div className="mt-3">
          <p className="mb-1.5 text-sm font-bold text-emerald-800">
            ✅ Your next steps
          </p>
          <ul className="grid gap-1 sm:grid-cols-2">
            {picked.map((goal) => (
              <li key={goal.id}>
                <Link
                  href={goal.href}
                  className="flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-2 py-1.5 text-sm font-semibold text-emerald-900 hover:bg-emerald-100"
                >
                  <span aria-hidden>{goal.icon}</span>
                  {goal.next} →
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {sections.map((section) => (
          <div key={section.title}>
            <p className="mb-1.5 text-sm font-bold text-slate-900">
              {section.title}
            </p>
            <ul className="space-y-1 text-sm">
              {section.options.map((option) => (
                <li key={option.href}>
                  <Link
                    href={option.href}
                    className="flex items-center gap-1.5 rounded-lg px-2 py-1 font-semibold text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                  >
                    <span aria-hidden>{option.icon}</span>
                    {option.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      {children ? <div className="mt-4 border-t pt-4">{children}</div> : null}
    </section>
  );
}
