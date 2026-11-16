import type { Metadata } from "next";
import Link from "next/link";
import { Card } from "@/components/ui";
import {
  AMBASSADOR_COMPLIANCE_REVIEW_NOTE,
  AMBASSADOR_PROGRAM_NAME,
} from "@/lib/joinGoals";

export const metadata: Metadata = {
  title: "Ambassador caller guide",
  description:
    "How GoDesi team callers invite people to become community ambassadors: call script, answers and rules.",
  robots: { index: false },
};

/*
 * Compliance: this script must be reviewed by compliance personnel before
 * callers use it. Ambassador calls must never mention or refer mortgage,
 * real-estate or insurance services.
 */
const SECTIONS: { title: string; lines: string[] }[] = [
  {
    title: "1. Before you call",
    lines: [
      "Only call people who already know GoDesi, came to a GoDesi event, or gave their number and agreed to be contacted.",
      "Call between 9am and 8pm in the person's own time zone. Never call numbers on the Do Not Call list unless that person gave you permission.",
      "Dial by hand. Never use auto-dialers, robocalls or pre-recorded messages.",
      "Have the event you are talking about open on godesi.com/events so you can answer questions about date, place and price.",
    ],
  },
  {
    title: "2. Opening",
    lines: [
      "“Hi, is this [name]? This is [your name] calling from GoDesi, the desi community site at godesi.com. Do you have one minute?”",
      "If they say no or sound busy: “No problem — can I text you the link instead?” Then end the call politely.",
    ],
  },
  {
    title: "3. The invitation",
    lines: [
      "“We're looking for people who love our community to be GoDesi ambassadors in [city]. You share our local desi events with your friends and groups, and you can get complimentary event tickets and recognition for it.”",
      "“It's free and voluntary. You get your own link, a badge, a certificate, and a dashboard that shows how many tickets came from you.”",
      "“If you like writing or sharing local news, you can also become a GoDesi local reporter — be the voice of your community.”",
    ],
  },
  {
    title: "4. How they join (read it out)",
    lines: [
      "“Go to godesi.com/ambassador.”",
      "“Create a free account or log in, fill in the short form and tick the pledge.”",
      "“Our team reviews it. Once you're approved, your links show up at godesi.com/ambassador/dashboard.”",
      "“Can I text you the link right now?” (only text if they say yes)",
    ],
  },
  {
    title: "5. Common questions",
    lines: [
      "“Do I get paid?” — “No, it's not a paid job. Ambassadors get non-cash benefits like complimentary tickets and featured recognition.”",
      "“How do I get free tickets?” — “Each event has a target, for example 2 free tickets once 10 confirmed tickets are booked through your link. Your dashboard shows your progress.”",
      "“How do you know the tickets came from me?” — “Anyone who opens your link and books within 30 days counts for you. Your own tickets don't count.”",
      "“Is there a cost?” — “No, it's completely free.”",
      "“Can I promote my business?” — “Approved ambassadors can submit their business for a free spotlight after review. Mortgage, real-estate and insurance businesses can't be featured.”",
    ],
  },
  {
    title: "6. Never do this on an ambassador call",
    lines: [
      "Never mention, recommend or ask for referrals for mortgage, loans, real estate, title/settlement or insurance — including any business run by the GoDesi team.",
      "Never promise cash, commission, points, gift cards or a share of sales. Never say free tickets are guaranteed.",
      "Never pressure anyone, and never ask for passwords, card numbers or bank details.",
      "If someone says “don't call me”, apologise, note it right away and never call that number again.",
    ],
  },
  {
    title: "7. Text to send (only if they said yes)",
    lines: [
      "“Hi [name], it's [your name] from GoDesi. Here's the ambassador program we talked about: godesi.com/ambassador — promote local desi events and get complimentary tickets. Reply STOP and we won't message again.”",
    ],
  },
  {
    title: "8. After the call",
    lines: [
      "Note the date, the result (interested, not now, do not call) and whether they asked for the link.",
      "Tell the GoDesi team about anyone who applied, so their application is reviewed quickly in the ambassador desk.",
    ],
  },
];

export default function AmbassadorCallerGuidePage() {
  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">
          {AMBASSADOR_PROGRAM_NAME}
        </p>
        <h1 className="mt-1 text-3xl font-black">Caller guide</h1>
        <p className="mt-2 text-sm text-slate-600">
          For GoDesi team members calling people about becoming an ambassador.
        </p>
      </div>
      <div className="rounded-2xl border border-amber-300 bg-amber-50 p-4 text-sm font-semibold text-amber-950">
        ⚖️ {AMBASSADOR_COMPLIANCE_REVIEW_NOTE} This is an event and community
        program only — keep it completely separate from any mortgage,
        real-estate or insurance business.
      </div>
      {SECTIONS.map((section) => (
        <Card key={section.title}>
          <h2 className="text-lg font-bold">{section.title}</h2>
          <ul className="mt-2 list-disc space-y-1.5 break-words pl-5 text-sm text-slate-700">
            {section.lines.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </Card>
      ))}
      <p className="text-sm text-slate-600">
        <Link href="/ambassador" className="font-semibold underline">
          Ambassador program
        </Link>{" "}
        ·{" "}
        <Link href="/ambassador#faq" className="underline">
          Ambassador FAQ
        </Link>{" "}
        ·{" "}
        <Link href="/ambassador/terms" className="underline">
          Program terms
        </Link>
      </p>
    </div>
  );
}
