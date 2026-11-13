import { recommendedLinks } from "@/lib/resourcesQueries";
import { LinkImpressions } from "@/components/LinkImpressions";

/**
 * USA → India money transfer services on the USD → INR page. Managed in
 * Admin → Resources with the "Send money to India" rail selected: swap a
 * company's plain link for an invite link there and it shows here.
 */
export async function SendMoneyBox() {
  const links = await recommendedLinks(null, 8, "money-transfer");
  if (!links.length) return null;
  const ordered = [
    ...links.filter((link) => link.kind !== "EDITORIAL"),
    ...links.filter((link) => link.kind === "EDITORIAL"),
  ];

  return (
    <section
      id="send-money"
      className="scroll-mt-24 rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4"
    >
      <h2 className="text-lg font-black text-emerald-900">
        💸 Send money to India — compare services
      </h2>
      <p className="mt-1 text-sm text-emerald-900/80">
        Check what your family receives in rupees on each app before you send:
        the exchange rate matters as much as the fee.
      </p>
      <LinkImpressions ids={ordered.map((link) => link.id)} />
      <ul className="mt-3 grid gap-2 sm:grid-cols-2">
        {ordered.map((link) => (
          <li
            key={link.id}
            className="flex flex-col justify-between gap-2 rounded-xl border border-emerald-100 bg-white p-3"
          >
            <div>
              <p className="text-sm font-bold text-slate-900">{link.title}</p>
              {link.description ? (
                <p className="mt-0.5 text-xs text-slate-600">
                  {link.description}
                </p>
              ) : null}
            </div>
            <a
              href={`/api/links/${link.id}/click`}
              target="_blank"
              rel={
                link.kind === "EDITORIAL"
                  ? "noopener noreferrer nofollow"
                  : "noopener noreferrer sponsored nofollow"
              }
              className="self-start rounded-full bg-emerald-600 px-4 py-1.5 text-xs font-bold text-white transition hover:bg-emerald-500"
            >
              See today&apos;s rate →
            </a>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-[11px] text-slate-500">
        Some links are invite or partner links — GoDesi may earn a reward when
        you sign up or send, at no cost to you. Exchange rates, fees and offers
        change all the time; compare before you transfer. Not financial advice.
      </p>
    </section>
  );
}
