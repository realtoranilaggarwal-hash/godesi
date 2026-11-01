import { vdoEbookCode } from "@/lib/vdoEbookCode";

/** Dashboard perk: every GoDesi member gets one paid VDO Rental ebook free. */
export function VdoEbookOffer({ userId }: { userId: string }) {
  const code = vdoEbookCode(userId);
  if (!code) return null;
  return (
    <section className="rounded-2xl border border-violet-200 bg-violet-50 p-4">
      <p className="text-sm font-bold text-violet-900">📘 Member perk: 1 free ebook on VDO Rental</p>
      <p className="mt-1 text-sm text-violet-800">
        Pick any landlord, investor or homeowner ebook and enter your code at checkout.
      </p>
      <p className="mt-2 inline-block select-all rounded-lg bg-white px-3 py-1.5 font-mono text-sm font-bold tracking-wider text-violet-900 ring-1 ring-violet-200">
        {code}
      </p>
      <a
        href="https://www.vdorental.com/ebooks"
        target="_blank"
        rel="noopener"
        className="ml-2 inline-block rounded-lg bg-violet-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-violet-700"
      >
        Choose your ebook →
      </a>
      <p className="mt-2 text-xs text-violet-700">One code per member, good for one ebook.</p>
    </section>
  );
}
