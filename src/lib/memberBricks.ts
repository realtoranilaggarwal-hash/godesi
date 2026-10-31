import { db } from "@/lib/db";
import { requestCurrency } from "@/lib/currency";

const BOARD = 1000;
const BRICK = 10; // member bricks are the standard 10x10 (100px) $10 tile

/** $0 free order — currency is cosmetic; requestCurrency throws off-request. */
function orderCurrency() {
  try {
    return requestCurrency();
  } catch {
    return "INR" as const;
  }
}

/**
 * Founding bricks fill the board from the TOP-RIGHT corner, moving left, then
 * row by row down — the reverse reading order of the paid market, so the
 * member strip is easy to spot and point at.
 */
async function nextMemberBrickCell() {
  const blocks = await db.wallBlock.findMany({
    where: { status: { in: ["ACTIVE", "PENDING", "DRAFT"] } },
    select: { x: true, y: true, w: true, h: true },
  });
  const cols = BOARD / BRICK;
  const taken = new Set<number>();
  for (const b of blocks) {
    const y1 = Math.floor(b.y / BRICK);
    const y2 = Math.floor((b.y + b.h - 1) / BRICK);
    const x1 = Math.floor(b.x / BRICK);
    const x2 = Math.floor((b.x + b.w - 1) / BRICK);
    for (let y = y1; y <= y2; y++)
      for (let x = x1; x <= x2; x++) taken.add(y * cols + x);
  }
  for (let y = 0; y < cols; y++)
    for (let x = cols - 1; x >= 0; x--)
      if (!taken.has(y * cols + x)) return { x: x * BRICK, y: y * BRICK };
  return null;
}

/**
 * One free founding brick per member, auto-placed. Hover shows their name and
 * picture; clicking opens their profile (or card, or the join page). Safe to
 * call more than once — the unique free-order index makes repeats a no-op.
 */
export async function assignMemberBrick(userId: string) {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      username: true,
      avatarUrl: true,
      business: { select: { slug: true, logoUrl: true } },
    },
  });
  if (!user) return null;
  const spot = await nextMemberBrickCell();
  if (!spot) return null;
  try {
    const block = await db.wallBlock.create({
      data: {
        ...spot,
        w: BRICK,
        h: BRICK,
        title: user.name,
        imageUrl: user.business?.logoUrl ?? user.avatarUrl ?? "",
        linkUrl: user.username
          ? `/${user.username}`
          : user.business
            ? `/business/${user.business.slug}`
            : "/start",
        description:
          "Founding member of GoDesi — this brick stays on the wall for life.",
        // Auto-approved: the only content is the member's own name and photo.
        status: "ACTIVE",
        advertiserId: user.id,
      },
    });
    await db.adOrder.create({
      data: {
        userId: user.id,
        wallBlockId: block.id,
        slot: "WALL",
        pricing: "MONTHLY",
        months: 1,
        amountMinor: 0,
        currency: orderCurrency(),
        provider: "free",
        status: "PAID",
      },
    });
    return block;
  } catch {
    // wall_one_free_order_per_user — they already have their brick.
    return null;
  }
}
