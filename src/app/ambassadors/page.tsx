import type { Metadata } from "next";
import Link from "next/link";
import { PrintButton } from "@/components/PrintButton";
import {
  AMBASSADOR_COMPLIANCE,
  AMBASSADOR_EVENT_BENEFITS,
  AMBASSADOR_HELP,
} from "@/lib/joinGoals";

export const metadata: Metadata = {
  title: "Become an Ambassador — GoDesi Community & New Year's Eve Party 2027",
  description:
    "Two ways to represent your community: the GoDesi Community Ambassador program (badge, certificate, free event invites) and the New Year's Eve Party 2027 ticket ambassador program (your own link and code, commission on ticket sales).",
  alternates: { canonical: "/ambassadors" },
};

const PHONE = "732-877-8585";
const PHONE_HREF = "tel:+17328778585";
const NYE_AMBASSADORS_URL = "https://www.newyearevesparty.com/ambassadors";

/** Prints only the proposal: site chrome, side banners and widgets are hidden. */
const PRINT_CSS = `
  @media print {
    body > *:not(main) { display: none !important; }
    main > *:not(:has(#ambassador-proposal)) { display: none !important; }
    main > div > *:not(#ambassador-proposal) { display: none !important; }
    main { display: block !important; padding: 0 !important; max-width: none !important; }
    body { background: #fff !important; padding: 0 !important; }
    #ambassador-proposal { max-width: none !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    @page { margin: 12mm; }
  }
`;

const PARTY_BENEFITS = [
  "Your own referral link and code to share on WhatsApp, Facebook and Instagram",
  "10% commission on every ticket bought through your link or code",
  "Your friends save 5% when they use your code",
  "A live dashboard showing your clicks and ticket sales",
];

const STEPS = [
  {
    icon: "📝",
    title: "Sign up",
    text: "Pick one program or both. It's free and takes 2 minutes.",
  },
  {
    icon: "📣",
    title: "Share",
    text: "Post your link and GoDesi news in your groups and your area.",
  },
  {
    icon: "🏆",
    title: "Get recognised",
    text: "Badges, invites and a thank-you on stage on New Year's Eve.",
  },
];

function Check({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex gap-2">
      <span aria-hidden className="text-emerald-600">
        ✔
      </span>
      <span className="min-w-0">{children}</span>
    </li>
  );
}

export default function AmbassadorProposalPage() {
  return (
    <div id="ambassador-proposal" className="mx-auto max-w-5xl space-y-5">
      <style dangerouslySetInnerHTML={{ __html: PRINT_CSS }} />

      <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
        <p className="text-sm text-slate-500">
          Share this page, or save it as a PDF to send on WhatsApp or email.
        </p>
        <PrintButton className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-bold text-white hover:bg-slate-800 print:hidden">
          🖨️ Download / Print PDF
        </PrintButton>
      </div>

      <header className="rounded-3xl bg-gradient-to-br from-emerald-900 via-teal-800 to-slate-900 p-6 text-white print:rounded-xl print:p-4 sm:p-8">
        <p className="text-xs font-bold uppercase tracking-widest text-amber-300">
          GoDesi.com &amp; NewYearEvesParty.com ambassadors
        </p>
        <h1 className="mt-2 break-words text-3xl font-black leading-tight sm:text-4xl">
          REPRESENT YOUR COMMUNITY.{" "}
          <span className="text-amber-300">BE AN AMBASSADOR.</span>
        </h1>
        <p className="mt-3 max-w-3xl text-sm text-slate-100">
          Help local desi families, businesses and events in your area get
          discovered, and help us fill the Big Ball Room at Royal Albert Palace,
          Fords NJ, for the Grand New Year&apos;s Eve Party 2027 on December 31.
          There are two separate programs: join one or both.
        </p>
        <p className="mt-4 text-sm font-bold text-amber-300">
          Questions? Call or WhatsApp Anil at{" "}
          <a href={PHONE_HREF} className="underline">
            {PHONE}
          </a>
        </p>
      </header>

      <div className="grid gap-5 md:grid-cols-2 print:grid-cols-2">
        <section className="flex min-w-0 break-inside-avoid flex-col overflow-hidden rounded-3xl border-4 border-amber-400 bg-white shadow-md print:rounded-xl print:shadow-none">
          <div className="bg-gradient-to-b from-emerald-700 to-emerald-900 p-5 text-center text-white">
            <h2 className="break-words text-2xl font-black">
              GoDesi Community Ambassador
            </h2>
            <p className="mt-0.5 text-sm font-semibold italic text-emerald-100">
              Free volunteer program · godesi.com/ambassador
            </p>
          </div>
          <div className="flex flex-1 flex-col gap-4 p-5 print:gap-2 print:p-3">
            <div>
              <p className="text-sm font-black text-slate-900">
                Ways you can help:
              </p>
              <ul className="mt-1 space-y-1 text-sm text-slate-700">
                {AMBASSADOR_HELP.map((item) => (
                  <Check key={item.id}>{item.label}</Check>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-sm font-black text-slate-900">What you get:</p>
              <ul className="mt-1 space-y-1 text-sm text-slate-700">
                <Check>
                  A GoDesi Local Ambassador badge and a numbered certificate
                </Check>
                <Check>
                  Your own ambassador code, like GD-12, and a dashboard
                </Check>
                {AMBASSADOR_EVENT_BENEFITS.map((benefit) => (
                  <Check key={benefit.title}>
                    <strong>{benefit.title}:</strong> {benefit.text}
                  </Check>
                ))}
              </ul>
            </div>
            <p className="rounded-2xl bg-emerald-50 p-3 text-xs text-emerald-900">
              No commission, cash or points: benefits are non-cash recognition
              with no cash value.
            </p>
            <Link
              href="/ambassador"
              className="mt-auto block rounded-xl bg-emerald-700 px-5 py-3 text-center text-base font-black text-white hover:bg-emerald-800 print:hidden"
            >
              🤝 Join as a GoDesi Ambassador
            </Link>
          </div>
        </section>

        <section className="flex min-w-0 break-inside-avoid flex-col overflow-hidden rounded-3xl border-4 border-amber-400 bg-white shadow-md print:rounded-xl print:shadow-none">
          <div className="bg-gradient-to-b from-fuchsia-700 to-purple-900 p-5 text-center text-white">
            <h2 className="break-words text-2xl font-black">
              New Year&apos;s Eve Party Ambassador
            </h2>
            <p className="mt-0.5 text-sm font-semibold italic text-fuchsia-100">
              Ticket sales program · run by NewYearEvesParty.com
            </p>
          </div>
          <div className="flex flex-1 flex-col gap-4 p-5 print:gap-2 print:p-3">
            <ul className="space-y-1 text-sm text-slate-700">
              {PARTY_BENEFITS.map((benefit) => (
                <Check key={benefit}>{benefit}</Check>
              ))}
            </ul>
            <p className="rounded-2xl bg-fuchsia-50 p-3 text-xs text-fuchsia-900">
              Grand New Year&apos;s Eve Party 2027 · Thursday, Dec 31, 8 PM to 1
              AM · Big Ball Room, Royal Albert Palace, 1050 King Georges Post
              Rd, Fords, NJ
            </p>
            <a
              href={NYE_AMBASSADORS_URL}
              className="mt-auto block rounded-xl bg-fuchsia-700 px-5 py-3 text-center text-base font-black text-white hover:bg-fuchsia-800 print:hidden"
            >
              🎉 Join as a Party Ambassador
            </a>
          </div>
        </section>
      </div>

      <ul className="grid break-inside-avoid gap-3 rounded-2xl bg-slate-900 p-4 text-white sm:grid-cols-3 print:grid-cols-3 print:p-2">
        {STEPS.map((step, index) => (
          <li key={step.title} className="min-w-0 text-sm">
            <span aria-hidden className="text-2xl">
              {step.icon}
            </span>
            <p className="font-black text-amber-300">
              {index + 1}. {step.title}
            </p>
            <p className="text-slate-200">{step.text}</p>
          </li>
        ))}
      </ul>

      <section className="break-inside-avoid rounded-2xl border border-slate-200 bg-white p-4 text-xs text-slate-500">
        <p className="font-bold text-slate-700">
          GoDesi Community Ambassador program terms
        </p>
        <ul className="mt-1 list-disc space-y-1 pl-4">
          {AMBASSADOR_COMPLIANCE.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
        <p className="mt-2">
          The two programs are separate. Full terms:{" "}
          <Link href="/ambassador/terms" className="underline">
            godesi.com/ambassador/terms
          </Link>
          .
        </p>
      </section>
    </div>
  );
}
