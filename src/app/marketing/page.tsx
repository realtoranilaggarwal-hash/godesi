import type { Metadata } from "next";
import Link from "next/link";
import { GodesiWikiBanner } from "@/components/GodesiWikiPromo";
import { Card } from "@/components/ui";

export const metadata: Metadata = {
  title: "Free marketing, free SEO and a free GoDesi.wiki membership | Godesi",
  description:
    "List your business free on Godesi.com: pick any categories, add services, languages, service areas, hours, price range, photos and videos — and everything is published on GoDesi.wiki too, free for your first year.",
};

const STEPS = [
  {
    title: "Sign up",
    text: "Create your free listing on Godesi.com — no card, no fee.",
  },
  {
    title: "Add your details",
    text: "Pick any categories, then the micro detail: services and products, languages, service areas, working hours, price range, offers, payments, photos and videos.",
  },
  {
    title: "Get listed",
    text: "Your card goes live on Godesi.com with a QR code and a WhatsApp button.",
  },
  {
    title: "Published on GoDesi.wiki",
    text: "The same information appears on GoDesi.wiki, the world's first exclusive desi wiki directory — free for your first year.",
  },
  {
    title: "Get more visibility",
    text: "We market the directory for you: social posts, search optimisation and the Godesi network of sites.",
  },
  {
    title: "Grow your business",
    text: "Enquiries and quote requests come straight to you. Godesi takes no commission on your work.",
  },
];

const VARIABLES = [
  {
    title: "Multiple languages",
    text: "English, Hindi, Punjabi, Gujarati, Marathi, Bengali, Telugu, Tamil, Kannada, Malayalam, Urdu, Nepali and more.",
  },
  {
    title: "Service areas",
    text: "The cities and states you cover, how far you travel, or nationwide.",
  },
  {
    title: "Price range",
    text: "Your own range or named packages, so enquiries arrive pre-qualified.",
  },
  {
    title: "Services and products",
    text: "Tick your trade's own list — every category asks the questions that matter for it.",
  },
  {
    title: "Photos and videos",
    text: "A logo, gallery photos and YouTube clips on your card.",
  },
  {
    title: "Hours, offers and payments",
    text: "Working hours, special offers, and the payment methods you accept.",
  },
];

export default function MarketingPage() {
  return (
    <div className="space-y-8">
      <GodesiWikiBanner />

      <section className="space-y-3">
        <h2 className="text-xl font-black">How it works</h2>
        <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {STEPS.map((step, index) => (
            <li
              key={step.title}
              className="rounded-2xl border border-slate-200 bg-white p-4"
            >
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-amber-600 text-sm font-black text-white">
                {index + 1}
              </span>
              <p className="mt-2 font-bold text-slate-900">{step.title}</p>
              <p className="mt-1 text-sm text-slate-600">{step.text}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-black">Everything you can set</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {VARIABLES.map((item) => (
            <Card key={item.title}>
              <p className="font-bold text-slate-900">{item.title}</p>
              <p className="mt-1 text-sm text-slate-600">{item.text}</p>
            </Card>
          ))}
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6">
        <h2 className="text-xl font-black">Start today</h2>
        <p className="mt-2 max-w-3xl text-sm text-slate-600">
          A free listing takes a few minutes. You can come back and add photos,
          videos and more detail whenever you like — changes flow through to
          GoDesi.wiki as well.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link
            href="/dashboard/profile?type=business"
            className="rounded-xl bg-amber-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-amber-700"
          >
            List my business free
          </Link>
          <Link
            href="/categories"
            className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50"
          >
            Browse every category
          </Link>
        </div>
      </section>
    </div>
  );
}
