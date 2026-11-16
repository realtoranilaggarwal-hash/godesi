import type { Metadata } from "next";
import Link from "next/link";
import { Card } from "@/components/ui";
import {
  AMBASSADOR_COMPLIANCE,
  AMBASSADOR_COMPLIANCE_REVIEW_NOTE,
  AMBASSADOR_PLEDGE,
  AMBASSADOR_PROGRAM_NAME,
} from "@/lib/joinGoals";

export const metadata: Metadata = {
  title: "Ambassador program terms & conditions",
  description:
    "Terms for the GoDesi Community Ambassador & Event Promotion Program: event and community marketing only, non-cash benefits, tracked links and conduct rules.",
  alternates: { canonical: "/ambassador/terms" },
};

/*
 * Compliance: these terms and every campaign benefit must be reviewed by
 * compliance personnel before the program launches. Do not add rewards tied
 * to mortgage, real-estate settlement or insurance business.
 */
const TERMS: { title: string; lines: string[] }[] = [
  {
    title: "1. What the program is",
    lines: [
      `The ${AMBASSADOR_PROGRAM_NAME} lets approved GoDesi members promote community events listed on godesi.com and be recognised for it.`,
      "Taking part is voluntary. Ambassadors are not employees, agents or partners of GoDesi and may not sign anything or accept payment on GoDesi's behalf.",
    ],
  },
  {
    title: "2. Event & community marketing only",
    lines: AMBASSADOR_COMPLIANCE,
  },
  {
    title: "3. Tracked links and attribution",
    lines: [
      "Each campaign gives the ambassador a personal link (godesi.com/r/<code>) for one event. Clicks are counted using a one-way hash of the visitor's IP address and browser; raw IP addresses are not stored.",
      "A ticket is credited to an ambassador when the buyer arrives through their link within 30 days and completes a booking on godesi.com. Only confirmed (verified) tickets count; cancelled or refunded tickets do not.",
      "Ambassadors' own bookings, and bookings made with fake accounts, are never counted. GoDesi's records are final.",
    ],
  },
  {
    title: "4. Benefits",
    lines: [
      "Benefits — such as complimentary event invites or featured recognition — are set by the GoDesi team for each campaign, together with who is eligible, and shown on the ambassador dashboard.",
      "Benefits are non-cash, non-transferable, have no cash value and cannot be exchanged for money, credit or any financial product.",
      "Ambassadors are never paid commission, cash, points or a share of any sale, and are not GoDesi employees or agents.",
      "GoDesi may change, pause or end a campaign or its benefit at any time. Benefits already earned on verified tickets will be honoured or replaced with something of similar value.",
    ],
  },
  {
    title: "5. Business promotion",
    lines: [
      "Approved ambassadors may submit a business name, link and logo for review. GoDesi decides what is featured and may remove it at any time.",
      "Mortgage, lending, real-estate (brokerage, title, escrow, closing, appraisal, home inspection) and insurance businesses cannot be featured through this program, and the spotlight must not be used to solicit those services.",
    ],
  },
  {
    title: "6. Conduct",
    lines: [
      "Ambassadors keep the ethics pledge they signed when applying:",
      ...AMBASSADOR_PLEDGE,
      "Ambassadors must say they are a GoDesi ambassador when sharing their link, and must not spam, mislead or use paid ads that impersonate GoDesi or an organiser.",
    ],
  },
  {
    title: "7. Ending participation",
    lines: [
      "Either side may end participation at any time. GoDesi may remove an ambassador, their badge, certificate and links for breaking these terms or the pledge.",
    ],
  },
];

export default function AmbassadorTermsPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">
          {AMBASSADOR_PROGRAM_NAME}
        </p>
        <h1 className="mt-1 text-3xl font-black">Terms &amp; conditions</h1>
      </div>
      <div className="rounded-2xl border border-amber-300 bg-amber-50 p-4 text-sm font-semibold text-amber-950">
        ⚖️ {AMBASSADOR_COMPLIANCE_REVIEW_NOTE}
      </div>
      {TERMS.map((section) => (
        <Card key={section.title}>
          <h2 className="text-lg font-bold">{section.title}</h2>
          <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm text-slate-700">
            {section.lines.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </Card>
      ))}
      <p className="text-sm text-slate-600">
        <Link href="/ambassador" className="font-semibold underline">
          Back to the ambassador program
        </Link>{" "}
        ·{" "}
        <Link href="/terms" className="underline">
          GoDesi terms of use
        </Link>{" "}
        ·{" "}
        <Link href="/contact" className="underline">
          Contact us
        </Link>
      </p>
    </div>
  );
}
