import { ImageResponse } from "next/og";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { WEDDING_SLUG } from "@/lib/wedding";

/** Square Instagram post for a staff-verified wedding vendor. */
const SIZE = 1080;

export async function GET(
  _request: Request,
  { params }: { params: { slug: string } },
) {
  const business = await db.business.findUnique({
    where: { slug: params.slug },
    select: { name: true, city: true, state: true, verifiedProvider: true, categorySlug: true },
  });
  if (!business?.verifiedProvider || business.categorySlug !== WEDDING_SLUG)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  const name = business.name.length > 34 ? `${business.name.slice(0, 33)}…` : business.name;
  const place = [business.city, business.state].filter(Boolean).join(", ");

  return new ImageResponse(
    (
      <div
        style={{
          width: SIZE,
          height: SIZE,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(150deg, #881337 0%, #be123c 45%, #f59e0b 100%)",
          color: "#ffffff",
          fontFamily: "sans-serif",
          padding: 80,
          textAlign: "center",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 260,
            height: 260,
            borderRadius: 999,
            background: "#ffffff",
            color: "#be123c",
            fontSize: 150,
            fontWeight: 900,
          }}
        >
          ✓
        </div>
        <div style={{ display: "flex", marginTop: 50, fontSize: 70, fontWeight: 900 }}>
          GoDesi Verified
        </div>
        <div style={{ display: "flex", fontSize: 58, fontWeight: 800 }}>Wedding Vendor</div>
        <div style={{ display: "flex", marginTop: 50, fontSize: 52, fontWeight: 700 }}>{name}</div>
        {place ? (
          <div style={{ display: "flex", marginTop: 10, fontSize: 38, opacity: 0.9 }}>{place}</div>
        ) : null}
        <div style={{ display: "flex", marginTop: 60, fontSize: 36, fontWeight: 700 }}>
          Find us on GoDesi.com
        </div>
      </div>
    ),
    {
      width: SIZE,
      height: SIZE,
      headers: {
        "Content-Disposition": `attachment; filename="godesi-verified-${params.slug}.png"`,
      },
    },
  );
}
