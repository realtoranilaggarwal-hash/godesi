import Link from "next/link";
import { offerDemand } from "@/lib/offerDemand";

/** Members waiting for help, by benefit topic, so businesses see demand in their trade. */
export async function OfferDemandBox({
  category,
  title = "🙋 Members looking for help",
}: {
  category?: string | null;
  title?: string;
}) {
  const { topics: demand, members } = await offerDemand(category);
  if (!demand.length) return null;
  return (
    <section className="rounded-2xl border border-amber-200 bg-amber-50 p-3">
      <h2 className="text-sm font-bold text-amber-900">
        {title}{" "}
        <span className="font-semibold text-amber-700">
          · {members} {members === 1 ? "member" : "members"}
        </span>
      </h2>
      <ul className="mt-2 flex flex-wrap gap-1.5">
        {demand.slice(0, 12).map(({ interest, members }) => (
          <li
            key={interest.id}
            className="rounded-full bg-white px-2.5 py-1 text-xs text-slate-700 ring-1 ring-amber-200"
          >
            {interest.icon} {interest.label}{" "}
            <b className="text-amber-800">{members}</b>
          </li>
        ))}
      </ul>
      <p className="mt-2 text-xs text-amber-800">
        Members ticked these at signup. Their details stay private; GoDesi
        connects them only with matching vendors, and only when they agree.{" "}
        <Link href="/dashboard/profile" className="font-semibold underline">
          List your business free
        </Link>{" "}
        to be the one we suggest.
      </p>
    </section>
  );
}
