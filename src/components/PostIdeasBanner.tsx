import Link from "next/link";
import { POST_OPTIONS } from "@/lib/postOptions";

const GIG = {
  href: "/dashboard/gigs",
  icon: "💼",
  label: "A gig",
  blurb: "Sell a fixed-price service, $5–$100",
};

/**
 * Shown where a member's page would otherwise be empty: everything they (or a
 * visitor) can post on Godesi, with a direct link into each flow.
 */
export function PostIdeasBanner({ name }: { name: string }) {
  return (
    <section className="rounded-3xl bg-gradient-to-br from-indigo-600 via-fuchsia-600 to-orange-500 p-5 text-white">
      <h2 className="text-lg font-black">
        {name} hasn&rsquo;t posted anything yet — here&rsquo;s what goes on
        Godesi
      </h2>
      <p className="mt-1 text-sm text-white/90">
        All free. Every post gets its own page, WhatsApp button and share link.
      </p>
      <ul className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {[...POST_OPTIONS, GIG].map((option) => (
          <li key={option.href}>
            <Link
              href={option.href}
              className="flex h-full items-start gap-3 rounded-2xl bg-white/15 p-3 transition hover:bg-white/25"
            >
              <span className="text-2xl" aria-hidden>
                {option.icon}
              </span>
              <span>
                <span className="block text-sm font-bold">{option.label}</span>
                <span className="block text-xs text-white/85">
                  {option.blurb}
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
