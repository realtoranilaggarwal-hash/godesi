import { ImageResponse } from "next/og";
import QRCode from "qrcode";
import { db } from "@/lib/db";
import { siteUrl } from "@/lib/format";
import { findVenue, venuePath } from "@/lib/venues";

const MAX_PHOTO_BYTES = 8 * 1024 * 1024;

/** The venue's lead photo as a data URL, so a dead link drops the photo, not the banner. */
async function photoData(url: string | undefined) {
  if (!url) return null;
  try {
    const response = await fetch(url, { next: { revalidate: 86400 } });
    const type = response.headers.get("content-type") ?? "";
    if (!response.ok || !/^image\/(jpeg|png)/.test(type)) return null;
    const bytes = await response.arrayBuffer();
    if (bytes.byteLength > MAX_PHOTO_BYTES) return null;
    return `data:${type};base64,${Buffer.from(bytes).toString("base64")}`;
  } catch {
    return null;
  }
}

/**
 * Shareable banner for a venue page: its photo, name and next events, with the
 * link and a QR to the page. Also the page's social preview image.
 */
export async function GET(
  request: Request,
  { params }: { params: { key: string } },
) {
  const venue = await findVenue(params.key);
  if (!venue) return new Response("Venue not found", { status: 404 });

  const search = new URL(request.url).searchParams;
  const square = search.get("size") === "square";
  const width = square ? 1080 : 1200;
  const height = square ? 1080 : 630;

  const path = venuePath(venue);
  const link = `${siteUrl()}${path}`;
  const shortLink = link.replace(/^https?:\/\/(www\.)?/, "");

  const [photo, events, qr] = await Promise.all([
    photoData(venue.photos[0]?.url),
    db.event.findMany({
      where: {
        venueRefId: venue.id,
        status: "APPROVED",
        startsAt: { gte: new Date() },
      },
      orderBy: { startsAt: "asc" },
      take: square ? 4 : 3,
      select: { title: true, startsAt: true, timeZone: true },
    }),
    QRCode.toDataURL(link, { width: 220, margin: 1 }),
  ]);

  const place = [venue.city, venue.state].filter(Boolean).join(", ");
  const dateOf = (event: (typeof events)[number]) =>
    event.startsAt.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      timeZone: event.timeZone || "America/New_York",
    });
  const clip = (text: string, max: number) =>
    text.length > max ? `${text.slice(0, max - 1)}…` : text;

  const image = new ImageResponse(
    <div
      style={{
        width,
        height,
        display: "flex",
        position: "relative",
        fontFamily: "sans-serif",
        color: "#ffffff",
        background:
          "linear-gradient(135deg, #4c1d95 0%, #7c3aed 50%, #db2777 100%)",
      }}
    >
      {photo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={photo}
          alt=""
          width={width}
          height={height}
          style={{ position: "absolute", top: 0, left: 0, objectFit: "cover" }}
        />
      ) : null}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width,
          height,
          display: "flex",
          background:
            "linear-gradient(90deg, rgba(17,24,39,0.92) 0%, rgba(17,24,39,0.72) 55%, rgba(17,24,39,0.25) 100%)",
        }}
      />
      <div
        style={{
          position: "relative",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          width: "100%",
          padding: square ? 64 : 52,
        }}
      >
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              display: "flex",
              alignSelf: "flex-start",
              background: "#f97316",
              borderRadius: 999,
              padding: "6px 18px",
              fontSize: 24,
              fontWeight: 800,
            }}
          >
            GoDesi.com · Events at
          </div>
          <div
            style={{
              display: "flex",
              marginTop: 18,
              fontSize: square ? 84 : 68,
              fontWeight: 900,
              lineHeight: 1.05,
              maxWidth: square ? 950 : 820,
            }}
          >
            {clip(venue.name, 40)}
          </div>
          <div
            style={{
              display: "flex",
              marginTop: 8,
              fontSize: 30,
              opacity: 0.9,
            }}
          >
            {place}
            {venue.halls.length > 1 ? ` · ${venue.halls.length} halls` : ""}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {events.length ? (
            events.map((event) => (
              <div
                key={`${event.title}${event.startsAt.toISOString()}`}
                style={{
                  display: "flex",
                  fontSize: square ? 32 : 28,
                  fontWeight: 700,
                }}
              >
                <span
                  style={{
                    display: "flex",
                    minWidth: square ? 130 : 110,
                    color: "#fcd34d",
                  }}
                >
                  {dateOf(event)}
                </span>
                <span style={{ display: "flex" }}>
                  {clip(event.title, square ? 38 : 44)}
                </span>
              </div>
            ))
          ) : (
            <div style={{ display: "flex", fontSize: 30, fontWeight: 700 }}>
              Every desi event at this venue, in one place
            </div>
          )}
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", fontSize: 24, opacity: 0.85 }}>
              All events, tickets & map:
            </div>
            <div
              style={{
                display: "flex",
                fontSize: square ? 34 : 30,
                fontWeight: 800,
              }}
            >
              {shortLink}
            </div>
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={qr}
            alt=""
            width={square ? 170 : 130}
            height={square ? 170 : 130}
            style={{ borderRadius: 12, border: "4px solid #ffffff" }}
          />
        </div>
      </div>
    </div>,
    {
      width,
      height,
      headers: {
        "cache-control": "public, max-age=600, s-maxage=3600",
        ...(search.get("download")
          ? {
              "content-disposition": `attachment; filename="${venue.slug ?? venue.id}${square ? "-square" : ""}.png"`,
            }
          : {}),
      },
    },
  );
  return image;
}
