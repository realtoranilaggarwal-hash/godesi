import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { formatEventDate, isPast } from "@/lib/events";
import { formatMoney, siteUrl } from "@/lib/format";
import { eventTheme } from "@/lib/eventTheme";

export const dynamic = "force-dynamic";

/** Anything pasted into someone else's page is escaped, never trusted. */
function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * A self-contained ticket card the organiser frames on their own website.
 * Inline styles only, so it looks the same inside any theme, and every link
 * lands back on Godesi — that backlink is what we get in return.
 */
export async function GET(
  request: Request,
  { params }: { params: { slug: string } },
) {
  const event = await db.event.findUnique({
    where: { slug: params.slug },
    select: {
      title: true,
      slug: true,
      startsAt: true,
      timeZone: true,
      venue: true,
      city: true,
      price: true,
      currency: true,
      imageUrl: true,
      status: true,
      sourceId: true,
    },
  });

  const dark = new URL(request.url).searchParams.get("theme") === "dark";
  const bg = dark ? "#0f172a" : "#ffffff";
  const border = dark ? "#1e293b" : "#e2e8f0";
  const text = dark ? "#f8fafc" : "#0f172a";
  const muted = dark ? "#94a3b8" : "#64748b";

  const shell = (inner: string) =>
    new NextResponse(
      `<!doctype html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>Godesi event</title>
<style>
  html,body{margin:0;padding:0;background:transparent;font-family:"Segoe UI",Helvetica,Arial,sans-serif}
  a{text-decoration:none}
  .card{box-sizing:border-box;display:flex;flex-direction:column;height:100%;min-height:150px;
        background:${bg};border:1px solid ${border};border-radius:16px;overflow:hidden;color:${text}}
  .body{display:flex;flex-direction:column;gap:4px;padding:14px;flex:1}
  .when{font-size:11px;font-weight:700;letter-spacing:.4px;text-transform:uppercase;color:#e11d48}
  .title{font-size:16px;font-weight:800;line-height:1.25;color:${text}}
  .where{font-size:12px;color:${muted}}
  .row{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-top:auto;padding-top:12px}
  .price{font-size:14px;font-weight:800}
  .cta{background:#4f46e5;color:#fff;font-size:12px;font-weight:700;padding:8px 14px;border-radius:12px}
  .credit{font-size:10px;font-weight:600;color:${muted};margin-top:8px}
  img.poster{width:100%;height:110px;object-fit:cover;display:block}
</style></head><body><div class="card">${inner}</div></body></html>`,
      {
        headers: {
          "Content-Type": "text/html; charset=utf-8",
          "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
        },
      },
    );

  if (!event || event.status !== "APPROVED") {
    return shell(
      `<div class="body"><p class="title">Event not available</p><p class="where">This event is no longer listed on Godesi.</p>
       <div class="row"><span></span><a class="cta" href="${siteUrl()}/events" target="_blank" rel="noopener">Browse events</a></div></div>`,
    );
  }

  const url = `${siteUrl()}/events/${event.slug}?utm_source=embed`;
  const label = event.sourceId
    ? "See organiser"
    : event.price
      ? formatMoney(event.price, event.currency)
      : "Free entry";
  const cta =
    event.sourceId || isPast(event) ? "See details" : "Get tickets";
  const icon = event.imageUrl ? "" : `${eventTheme(event.title).icon} `;

  return shell(
    `${
      event.imageUrl
        ? `<img class="poster" src="${escapeHtml(event.imageUrl)}" alt="" loading="lazy">`
        : ""
    }
     <div class="body">
       <p class="when">${escapeHtml(formatEventDate(event.startsAt, event.timeZone))}</p>
       <a class="title" href="${url}" target="_blank" rel="noopener">${icon}${escapeHtml(event.title)}</a>
       <p class="where">📍 ${escapeHtml(event.venue)}, ${escapeHtml(event.city)}</p>
       <div class="row">
         <span class="price">${escapeHtml(label)}</span>
         <a class="cta" href="${url}" target="_blank" rel="noopener">${cta}</a>
       </div>
       <a class="credit" href="${siteUrl()}/events?utm_source=embed" target="_blank" rel="noopener">Powered by Godesi.com</a>
     </div>`,
  );
}
