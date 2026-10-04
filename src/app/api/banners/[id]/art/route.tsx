import { ImageResponse } from "next/og";
import { db } from "@/lib/db";

export const revalidate = 3600;

const WIDTH = 600;
const HEIGHT = 500;

/** Inlines a png/jpeg logo; anything else (webp, svg, errors) falls back to initials. */
async function inlineImage(url: string | null) {
  if (!url || !/^https?:\/\//i.test(url)) return null;
  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(4000) });
    const type = response.headers.get("content-type") ?? "";
    if (!response.ok || !/^image\/(png|jpe?g)/.test(type)) return null;
    const bytes = Buffer.from(await response.arrayBuffer());
    if (bytes.length > 2_000_000) return null;
    return `data:${type};base64,${bytes.toString("base64")}`;
  } catch {
    return null;
  }
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase())
    .join("");
}

/** The 300×250 creative for a banner members bought with points, drawn from their card or profile. */
export async function GET(
  _request: Request,
  { params }: { params: { id: string } },
) {
  const banner = await db.banner.findUnique({
    where: { id: params.id },
    select: {
      advertiser: {
        select: {
          name: true,
          username: true,
          headline: true,
          avatarUrl: true,
          business: {
            select: {
              slug: true,
              name: true,
              category: true,
              city: true,
              logoUrl: true,
            },
          },
        },
      },
    },
  });
  const member = banner?.advertiser;
  if (!member) return new Response("not found", { status: 404 });

  const business = member.business;
  const name = business?.name ?? member.name;
  const line = business
    ? `${business.category} · ${business.city}`
    : (member.headline ?? "");
  const path = business
    ? `godesi.com/b/${business.slug}`
    : `godesi.com/${member.username ?? ""}`;
  const picture = await inlineImage(business?.logoUrl ?? member.avatarUrl);

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        background: "linear-gradient(135deg, #f97316, #e11d48 55%, #c026d3)",
        padding: 24,
        fontFamily: "sans-serif",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          flex: 1,
          background: "#ffffff",
          borderRadius: 28,
          padding: "24px 28px",
          textAlign: "center",
        }}
      >
        {picture ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={picture}
            alt=""
            width={132}
            height={132}
            style={{ borderRadius: 24, objectFit: "contain" }}
          />
        ) : (
          <div
            style={{
              width: 132,
              height: 132,
              borderRadius: 66,
              background: "#4f46e5",
              color: "#ffffff",
              fontSize: 56,
              fontWeight: 800,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {initials(name)}
          </div>
        )}
        <div
          style={{
            marginTop: 18,
            fontSize: name.length > 28 ? 34 : 42,
            fontWeight: 800,
            color: "#0f172a",
            lineHeight: 1.1,
            display: "flex",
            maxHeight: 96,
            overflow: "hidden",
          }}
        >
          {name}
        </div>
        {line ? (
          <div
            style={{
              marginTop: 8,
              fontSize: 24,
              color: "#475569",
              display: "flex",
              maxHeight: 62,
              overflow: "hidden",
            }}
          >
            {line.slice(0, 80)}
          </div>
        ) : null}
        <div
          style={{
            marginTop: 18,
            background: "#4f46e5",
            color: "#ffffff",
            fontSize: 24,
            fontWeight: 700,
            borderRadius: 999,
            padding: "10px 26px",
            display: "flex",
          }}
        >
          Visit on GoDesi →
        </div>
      </div>
      <div
        style={{
          marginTop: 12,
          display: "flex",
          justifyContent: "space-between",
          color: "#ffffff",
          fontSize: 20,
          fontWeight: 700,
        }}
      >
        <span>{path}</span>
        <span>GoDesi</span>
      </div>
    </div>,
    { width: WIDTH, height: HEIGHT },
  );
}
