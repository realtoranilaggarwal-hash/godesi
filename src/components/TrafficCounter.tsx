import { siteTraffic } from "@/lib/traffic";
import { VisitPing } from "@/components/VisitPing";

const MONTH = new Intl.DateTimeFormat("en-GB", {
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

/**
 * The visitor count in the footer, read from the public traffic dashboard the
 * site already shares, so it covers every visit since tracking began rather
 * than starting from the day the counter was added.
 */
export async function TrafficCounter() {
  const traffic = await siteTraffic();
  const statsUrl = process.env.NEXT_PUBLIC_UMAMI_SHARE_URL;

  if (!traffic.views && !traffic.visitors) return <VisitPing />;

  return (
    <p className="text-xs text-slate-500">
      <VisitPing />
      <span aria-hidden>👀</span>{" "}
      <strong className="font-semibold text-slate-700">
        {traffic.views.toLocaleString()}
      </strong>{" "}
      page views from{" "}
      <strong className="font-semibold text-slate-700">
        {traffic.visitors.toLocaleString()}
      </strong>{" "}
      visitors
      {traffic.since ? ` since ${MONTH.format(traffic.since)}` : ""}
      {statsUrl ? (
        <>
          {" · "}
          <a
            href={statsUrl}
            target="_blank"
            rel="noreferrer"
            className="font-semibold text-slate-600 underline hover:text-slate-900"
          >
            live traffic
          </a>
        </>
      ) : null}
    </p>
  );
}
