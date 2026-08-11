import Link from "next/link";
import { SidebarBanners } from "@/components/Banners";

const STEPS = [
  {
    icon: "📝",
    title: "Post it free",
    body: "Name, city and category is enough — you can finish the rest later.",
  },
  {
    icon: "📇",
    title: "Get your digital card",
    body: "A shareable page at godesi.com/yourname with a QR code and WhatsApp button.",
  },
  {
    icon: "🔍",
    title: "Appear in search",
    body: "You show up in your category, city and subcategory searches straight away.",
  },
  {
    icon: "🎯",
    title: "Get contacted",
    body: "Customers message you on WhatsApp, and buyer requirements land in your dashboard.",
  },
  {
    icon: "⭐",
    title: "Upgrade to feature",
    body: "Paid listings sit above free ones and ride the featured strip on every page.",
  },
];

/** Fills the empty column on posting pages: why to post, then sellable ad space. */
export function PostingSidebar() {
  return (
    <div className="hidden w-[300px] shrink-0 space-y-4 lg:block">
      <section className="rounded-2xl border border-slate-200 bg-white p-4">
        <h2 className="text-sm font-black text-slate-900">
          Why post on Godesi?
        </h2>

        <ol className="mt-3 space-y-3">
          {STEPS.map((step, index) => (
            <li key={step.title} className="relative pl-7">
              {index < STEPS.length - 1 ? (
                <span className="absolute left-[11px] top-6 h-full w-px bg-slate-200" />
              ) : null}
              <span className="absolute left-0 top-0 text-base" aria-hidden>
                {step.icon}
              </span>
              <p className="text-sm font-bold text-slate-900">{step.title}</p>
              <p className="text-xs text-slate-600">{step.body}</p>
            </li>
          ))}
        </ol>

        <Link
          href="/pricing"
          className="mt-4 block rounded-xl bg-gradient-to-r from-orange-500 via-rose-500 to-fuchsia-600 px-3 py-2 text-center text-sm font-bold text-white"
        >
          See what paid unlocks →
        </Link>
      </section>

      <SidebarBanners />
    </div>
  );
}
