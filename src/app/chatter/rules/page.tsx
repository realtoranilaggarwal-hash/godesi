import type { Metadata } from "next";
import Link from "next/link";
import {
  CHATTER_AUTO_HIDE_REPORTS,
  CHATTER_MAX,
  CHATTER_RATE,
} from "@/lib/chatter";

export const metadata: Metadata = {
  title: "GoDesi Chatter rules",
  description: "How GoDesi Chatter works and what isn't allowed.",
};

const RULES = [
  "Be kind. Disagree with ideas, not people. No abuse, threats, bullying or hate about religion, caste, region, gender or anything else.",
  "No sexual content, and nothing involving children.",
  "Don't post anyone else's phone number, address or private photos.",
  "No spam: don't post the same thing again and again, and don't make every post an ad. Businesses can post a deal on GoDesi Deals instead.",
  "No fake news on purpose, and no scams or requests for money.",
  "Post only photos you took or have the right to share.",
];

export default function ChatterRulesPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <Link href="/chatter" className="text-sm font-semibold text-indigo-700">
        ← GoDesi Chatter
      </Link>
      <h1 className="text-3xl font-black">GoDesi Chatter rules</h1>
      <ol className="list-decimal space-y-2 pl-5 text-slate-700">
        {RULES.map((rule) => (
          <li key={rule}>{rule}</li>
        ))}
      </ol>
      <h2 className="text-xl font-bold">How it works</h2>
      <ul className="list-disc space-y-2 pl-5 text-slate-700">
        <li>
          Posts are up to {CHATTER_MAX} characters with one photo. You can edit
          or delete your own posts at any time.
        </li>
        <li>
          To stop spam, each member can post{" "}
          {CHATTER_RATE.map(
            (rule) => `${rule.max} times per ${rule.label}`,
          ).join(" and ")}
          . You need a verified email to post.
        </li>
        <li>Words GoDesi doesn&apos;t allow are refused when you post.</li>
        <li>
          Tap 🚩 Report on a post that breaks the rules. After{" "}
          {CHATTER_AUTO_HIDE_REPORTS} members report a post it is hidden until
          GoDesi staff check it.
        </li>
        <li>
          Tap 🚫 Block to stop seeing a member&apos;s posts. They can no longer
          reply to you. Tap it again to unblock.
        </li>
        <li>
          Staff can remove any post that breaks these rules, and repeat
          offenders lose their GoDesi account.
        </li>
      </ul>
    </div>
  );
}
