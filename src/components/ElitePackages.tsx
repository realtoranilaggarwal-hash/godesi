import { Card } from "@/components/ui";
import { ELITE_PACKAGES, type ElitePackageId } from "@/lib/elite";
import { startEliteCheckoutAction } from "@/app/actions/elite";

const ORDER: ElitePackageId[] = [
  "INTERVIEW",
  "VIDEO_PRO",
  "BOOST_100",
  "BOOST_250",
  "BOOST_500",
];

/**
 * Elite fees. Nothing is charged to apply — payment only comes in once an
 * entry exists, and the amount paid decides how high the profile sits.
 */
export function ElitePackages({
  entryId,
  interviewPaid,
  videoPackage,
  paidCents,
}: {
  entryId: string;
  interviewPaid: boolean;
  videoPackage: string;
  paidCents: number;
}) {
  return (
    <Card className="border-amber-200 bg-gradient-to-br from-amber-50 via-white to-white">
      <h2 className="text-lg font-black">Elite fees</h2>
      <p className="mt-1 text-sm text-slate-700">
        Applying and being nominated is free. These one-time fees cover the
        interview and the film — and the more you invest, the higher your profile
        sits in its section.
      </p>
      {paidCents > 0 ? (
        <p className="mt-2 text-xs font-bold text-amber-800">
          Paid so far: ${(paidCents / 100).toLocaleString()} — your profile ranks
          above members who have paid less.
        </p>
      ) : null}

      <div className="mt-3 space-y-2">
        {ORDER.map((id) => {
          const item = ELITE_PACKAGES[id];
          const done =
            (item.kind === "INTERVIEW" && interviewPaid) ||
            (item.kind === "VIDEO" && videoPackage === "PRO");
          return (
            <div
              key={id}
              className="flex flex-wrap items-start justify-between gap-2 rounded-xl border border-slate-200 bg-white p-3"
            >
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold">
                  {item.label} — ${item.usd.toLocaleString()}
                </p>
                <p className="mt-0.5 text-xs text-slate-600">{item.blurb}</p>
              </div>
              {done ? (
                <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800">
                  ✅ Paid
                </span>
              ) : (
                <form action={startEliteCheckoutAction}>
                  <input type="hidden" name="entryId" value={entryId} />
                  <input type="hidden" name="packageId" value={id} />
                  <button
                    type="submit"
                    className="rounded-full bg-slate-900 px-4 py-1.5 text-xs font-bold text-white hover:bg-slate-700"
                  >
                    Pay ${item.usd.toLocaleString()}
                  </button>
                </form>
              )}
            </div>
          );
        })}
      </div>

      <p className="mt-3 text-xs text-slate-500">
        Payments are one-time, taken securely by Stripe in USD. The professional
        film is produced from the photos, footage and story you supply. Every
        Elite member is invited to the annual{" "}
        <a href="/desi-elite/awards" className="font-semibold underline">
          GoDesi Elite Awards
        </a>
        .
      </p>
    </Card>
  );
}
