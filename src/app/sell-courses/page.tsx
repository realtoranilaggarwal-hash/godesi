import type { Metadata } from "next";
import Link from "next/link";
import { Card } from "@/components/ui";
import { CourseSellerForm } from "@/components/CourseSellerForm";
import { siteUrl } from "@/lib/format";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Sell your course on GoDesi — keep 90%",
  description:
    "Turn what you know into income: sell your course or ebook on GoDesi.com. We host it, take payments, deliver it and market it — you keep 90% of every sale.",
  alternates: { canonical: `${siteUrl()}/sell-courses` },
};

const STEPS = [
  {
    icon: "✍️",
    title: "Tell us about your course",
    body: "Apply below with your topic and outline — cooking, music, mehndi, tutoring, business skills… anything people want to learn.",
  },
  {
    icon: "📦",
    title: "We build your book",
    body: "Our team turns your knowledge into a professional course with a cover, sales page and checkout — like the GoDesi courses you see in the catalog.",
  },
  {
    icon: "💰",
    title: "You keep 90% of every sale",
    body: "Buyers pay by card and get instant access. We handle hosting, payments, delivery and marketing — GoDesi keeps 10%, you keep 90%.",
  },
];

export default function SellCoursesPage() {
  return (
    <div className="space-y-8">
      <section className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-900 p-8 text-white shadow-xl sm:p-10">
        <p className="text-sm font-bold uppercase tracking-widest text-amber-400">
          Sell on GoDesi
        </p>
        <h1 className="mt-2 max-w-3xl text-3xl font-black leading-tight sm:text-4xl">
          Turn what you know into income — we sell it, you keep{" "}
          <span className="text-amber-400">90%</span>.
        </h1>
        <p className="mt-3 max-w-2xl text-sm text-slate-300 sm:text-base">
          Got a skill, recipe book, business method or course idea? List it in
          the GoDesi course catalog. We write and design the pages with you,
          take card payments, deliver it instantly to buyers and market it
          across GoDesi.com and our family of sites — you keep 90% of every
          sale, paid to you.
        </p>
        <div className="mt-5 flex flex-wrap items-center gap-3 text-xs font-bold">
          <span className="rounded-full bg-amber-400 px-3 py-1 text-slate-950">
            You keep 90% · GoDesi keeps 10%
          </span>
          <Link
            href="/course"
            className="text-slate-300 underline decoration-amber-400 underline-offset-4 hover:text-amber-300"
          >
            See the course catalog →
          </Link>
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-3">
        {STEPS.map((s) => (
          <Card key={s.title} className="p-5">
            <p className="text-2xl">{s.icon}</p>
            <p className="mt-1 text-sm font-bold">{s.title}</p>
            <p className="mt-1 text-xs leading-relaxed text-slate-500">
              {s.body}
            </p>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <Card className="p-6 lg:col-span-3">
          <h2 className="text-lg font-bold">Apply to sell your course</h2>
          <p className="mb-4 mt-1 text-sm text-slate-500">
            Free to apply — we&apos;ll contact you to plan your course before
            anything goes live.
          </p>
          <CourseSellerForm />
        </Card>
        <div className="space-y-4 lg:col-span-2">
          <Card className="p-5">
            <h3 className="text-sm font-bold">What you get</h3>
            <ul className="mt-2 space-y-1.5 text-sm text-slate-600">
              <li>✔ Professional course page + cover art</li>
              <li>✔ Card checkout handled by us</li>
              <li>✔ Instant delivery to buyers</li>
              <li>✔ Marketing across GoDesi + partner sites</li>
              <li>✔ 90% of every sale paid to you</li>
            </ul>
          </Card>
          <Card className="p-5">
            <h3 className="text-sm font-bold">Good courses to sell</h3>
            <ul className="mt-2 space-y-1.5 text-sm text-slate-600">
              <li>🍛 Cooking &amp; regional recipes</li>
              <li>🎵 Music, dance &amp; arts</li>
              <li>💼 Business &amp; professional skills</li>
              <li>📚 Tutoring &amp; exam prep</li>
              <li>🧵 Crafts, mehndi, tailoring</li>
              <li>📈 Money, real estate &amp; insurance</li>
            </ul>
          </Card>
          <Card className="border-amber-300 bg-amber-50 p-5">
            <h3 className="text-sm font-bold text-amber-900">The split</h3>
            <p className="mt-1 text-sm text-amber-800">
              Every sale: <b>90% to you</b>, <b>10% to GoDesi</b> — that 10%
              covers hosting, card fees and marketing. You set your price with
              us; payouts are settled with you directly.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
