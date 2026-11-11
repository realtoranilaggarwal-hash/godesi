import { NextResponse } from "next/server";
import type { EventType } from "@prisma/client";
import { db } from "@/lib/db";

const VALID: EventType[] = ["PROFILE_VIEW", "QR_SCAN", "WHATSAPP_CLICK"];
const MAX_REFERRER = 2048;
const MAX_PATH = 300;
const HOSTNAME = /^[a-z0-9-]+(\.[a-z0-9-]+)+$/;

/**
 * Keeps only the hostname of where the visitor came from ("google.com"),
 * "direct" when there was none, or null when it can't be trusted.
 * Accepts a full URL or a bare hostname.
 */
function referrerHost(raw: unknown): string | null {
  if (typeof raw !== "string" || raw.length > MAX_REFERRER) return null;
  const value = raw.trim().toLowerCase();
  if (!value) return "direct";
  let host = value;
  if (value.includes("/")) {
    try {
      host = new URL(value).hostname;
    } catch {
      return null;
    }
  }
  host = host.replace(/^(www|m|l|lm|mobile)\./, "");
  if (host.length > 253 || !HOSTNAME.test(host)) return null;
  return host;
}

function cleanPath(raw: unknown): string | null {
  if (
    typeof raw !== "string" ||
    !raw.startsWith("/") ||
    raw.length > MAX_PATH
  ) {
    return null;
  }
  return raw.split(/[?#]/)[0] || null;
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as {
    slug?: string;
    type?: EventType;
    referrer?: unknown;
    path?: unknown;
  } | null;

  if (!body?.slug || !body.type || !VALID.includes(body.type)) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const business = await db.business.findUnique({
    where: { slug: body.slug },
    select: { id: true },
  });
  if (!business) return NextResponse.json({ ok: false }, { status: 404 });

  await db.analyticsEvent.create({
    data: {
      businessId: business.id,
      type: body.type,
      referrer:
        body.referrer === undefined ? null : referrerHost(body.referrer),
      path: cleanPath(body.path),
    },
  });
  return NextResponse.json({ ok: true });
}
