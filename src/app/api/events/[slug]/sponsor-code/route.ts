import { NextResponse } from "next/server";
import { sponsorDiscountLabel, sponsorForCode } from "@/lib/sponsors";

export const dynamic = "force-dynamic";

const HEADERS = {
  "access-control-allow-origin": "*",
  "cache-control": "no-store",
};

/**
 * Checks one sponsor ticket code for network sites' checkouts. Codes are not in
 * the public event feed: buyers get them from the sponsor or by reviewing it.
 */
export async function GET(
  request: Request,
  { params }: { params: { slug: string } },
) {
  const code = new URL(request.url).searchParams.get("code")?.trim() ?? "";
  const sponsor =
    code && code.length <= 40 ? await sponsorForCode(params.slug, code) : null;
  const discountLabel = sponsor ? sponsorDiscountLabel(sponsor) : null;
  if (!sponsor?.coupon || !discountLabel) {
    return NextResponse.json(
      { valid: false },
      { status: 404, headers: HEADERS },
    );
  }
  return NextResponse.json(
    {
      valid: true,
      name: sponsor.business.name,
      code: sponsor.coupon.code,
      discountKind: sponsor.coupon.discountKind,
      discountAmount: sponsor.coupon.amount,
      discountLabel,
    },
    { headers: HEADERS },
  );
}
