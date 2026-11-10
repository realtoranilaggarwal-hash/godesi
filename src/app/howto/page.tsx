import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "How to post your business on GoDesi — free",
  description:
    "Watch the 90-second video: sign up, choose Business card, add your category, address and WhatsApp, and your business page is live on GoDesi.com.",
  alternates: { canonical: "/howto" },
  openGraph: {
    title: "How to post your business on GoDesi — free",
    description: "A 90-second guide to getting your business found by the desi community.",
    images: ["/videos/how-to-post-business.jpg"],
  },
};

const STEPS = [
  "Click Register free and pick Business owner (or sign in if you already joined).",
  "Choose 🏪 Business card.",
  "Pick your category and subcategory.",
  "Add your street address, city and country.",
  "Write a few lines about your business and add your WhatsApp number.",
  "Click Create my card. Verify your email and your page goes live.",
];

export default function HowToPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
        How to post your business on GoDesi — free
      </h1>
      <p className="mt-2 text-slate-600">
        It takes about 2 minutes. Watch the video, then post yours.
      </p>

      <video
        className="mt-5 w-full rounded-xl border border-slate-200 bg-black shadow"
        src="/videos/how-to-post-business.mp4"
        poster="/videos/how-to-post-business.jpg"
        controls
        playsInline
        preload="metadata"
      />

      <div className="mt-6 flex flex-wrap gap-3">
        <Link
          href="/dashboard/profile"
          className="rounded-lg bg-pink-600 px-5 py-3 font-semibold text-white hover:bg-pink-700"
        >
          Post my business free
        </Link>
        <Link
          href="/signup?role=BUSINESS"
          className="rounded-lg border border-slate-300 px-5 py-3 font-semibold text-slate-800 hover:bg-slate-50"
        >
          New here? Register free
        </Link>
      </div>

      <h2 className="mt-8 text-lg font-semibold text-slate-900">The steps</h2>
      <ol className="mt-2 list-decimal space-y-1.5 pl-6 text-slate-700">
        {STEPS.map((step) => (
          <li key={step}>{step}</li>
        ))}
      </ol>

      <p className="mt-6 text-sm text-slate-500">
        Questions? Call or WhatsApp Anil at{" "}
        <a href="tel:+17328778585" className="underline">
          732-877-8585
        </a>
        .
      </p>
    </main>
  );
}
