import Image from "next/image";

const FFP_URL =
  "https://futurefinanceplanning.com/?utm_source=godesi&utm_medium=banner&utm_campaign=crypto-fear-greed";

/** Anil Aggarwal's Future Finance Planning banner, leaderboard-wide on computers. */
export function FinancialAdviceBanner() {
  return (
    <div>
      <a
        href={FFP_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="flex flex-col items-center gap-3 rounded-2xl bg-gradient-to-r from-emerald-700 via-teal-700 to-slate-800 p-4 text-white shadow-sm transition hover:brightness-110 sm:flex-row sm:gap-4"
      >
        <Image
          src="/anil-aggarwal.jpg"
          alt="Anil Aggarwal"
          width={72}
          height={72}
          className="h-16 w-16 shrink-0 rounded-full border-2 border-white/70 object-cover"
        />
        <div className="min-w-0 flex-1 text-center sm:text-left">
          <p className="text-xs font-semibold uppercase tracking-widest text-emerald-200">
            Need financial advice?
          </p>
          <p className="text-xl font-black">Talk to Anil Aggarwal</p>
          <p className="text-sm text-white/90">
            Retirement, tax-free growth, life insurance and annuities — a plan
            you understand.
          </p>
        </div>
        <div className="shrink-0 text-center">
          <span className="inline-block rounded-full bg-white px-4 py-2 text-sm font-bold text-emerald-800">
            futurefinanceplanning.com →
          </span>
          <p className="mt-1 text-xs text-white/80">Call (732) 983-7958</p>
        </div>
      </a>
      <p className="mt-1 px-1 text-[11px] text-slate-500">
        Ad · Anil Aggarwal, Future Finance Planning · Life Producer Lic
        #1687981 · NMLS #2678719
      </p>
    </div>
  );
}
