import type { Metadata } from "next";
import Link from "next/link";
import { HIRING_STEPS, PLATFORM_DISCLAIMER } from "@/lib/safety";
import { SidebarBanners } from "@/components/Banners";
import { NeedHelpBox, TradingTips } from "@/components/NeedHelp";
import { Card, LinkButton } from "@/components/ui";

export const metadata: Metadata = {
  title: "How to hire safely on Godesi — trust & safety guide",
  description:
    "Eight checks before you hire any vendor or service provider: verify the profile, speak directly, ask for samples, confirm pricing in writing, use an agreement, avoid full advance payment, check reviews and trust your judgment.",
  alternates: { canonical: "/safety" },
};

export default function SafetyPage() {
  return (
    <div className="flex justify-center gap-6">
      <div className="min-w-0 max-w-3xl flex-1 space-y-5">
        <section className="rounded-3xl bg-gradient-to-r from-emerald-500 via-teal-500 to-sky-500 px-5 py-8 text-white sm:px-8">
          <p className="text-xs font-semibold uppercase tracking-widest text-white/80">
            Trust &amp; safety
          </p>
          <h1 className="mt-2 text-3xl font-bold sm:text-4xl">How to hire safely 🛡️</h1>
          <p className="mt-3 max-w-2xl text-white/90">
            Before hiring any vendor or service provider on Godesi, run through these
            eight checks. They take a few minutes and save a lot of trouble.
          </p>
        </section>

        <ol className="grid gap-3 sm:grid-cols-2">
          {HIRING_STEPS.map((step, index) => (
            <li
              key={step.title}
              className="rounded-2xl border border-slate-200 bg-white p-4"
            >
              <p className="text-sm font-bold text-slate-900">
                <span className="mr-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-xs font-black text-emerald-700">
                  {index + 1}
                </span>
                {step.title}
              </p>
              <ul className="mt-2 space-y-1 text-sm text-slate-600">
                {step.points.map((point) => (
                  <li key={point}>• {point}</li>
                ))}
              </ul>
            </li>
          ))}
        </ol>

        <TradingTips />

        <Card>
          <h2 className="text-lg font-bold">Our role</h2>
          <p className="mt-1 text-sm leading-relaxed text-slate-600">
            {PLATFORM_DISCLAIMER}
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <LinkButton href="/report">Report an issue</LinkButton>
            <Link
              href="/contact"
              className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold hover:bg-slate-50"
            >
              Contact us
            </Link>
          </div>
        </Card>

        <Card className="text-sm text-slate-600">
          <h2 className="text-lg font-bold text-slate-900">Meeting people</h2>
          <p className="mt-1">
            For Connect meet-ups: meet in public places, tell a friend where you are
            going, and never send money to anyone you have not met. Godesi Connect is a
            community and networking space — it is not a dating service.
          </p>
          <p className="mt-2">
            For housing: never pay a deposit for a property you have not seen, and read
            the fair housing notice on every property and room listing.
          </p>
        </Card>
      </div>

      <aside className="hidden w-[260px] shrink-0 space-y-4 lg:order-first lg:block">
        <NeedHelpBox />
        <SidebarBanners />
      </aside>
    </div>
  );
}
