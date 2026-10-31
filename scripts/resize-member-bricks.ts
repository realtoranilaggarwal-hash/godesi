/**
 * One-off data migration for the wall resize: founding-member bricks were
 * 2x2 px dots; the new brick is a 10x10 tile. Re-place every 2x2 member brick
 * on the 10px grid, keeping the same fill order (top-right, moving left), and
 * skipping cells already covered by paid blocks.
 *
 * Run:  npx tsx scripts/resize-member-bricks.ts
 */
import { db } from "../src/lib/db";

const BOARD = 1000;
const BRICK = 10;

async function main() {
  const members = await db.wallBlock.findMany({
    where: { w: 2, h: 2 },
    orderBy: [{ y: "asc" }, { x: "desc" }],
    select: { id: true, x: true, y: true },
  });
  const nonMembers = await db.wallBlock.findMany({
    where: {
      NOT: { w: 2, h: 2 },
      status: { in: ["ACTIVE", "PENDING", "DRAFT"] },
    },
    select: { x: true, y: true, w: true, h: true },
  });

  const cols = BOARD / BRICK;
  const taken = new Set<number>();
  const mark = (x: number, y: number, w: number, h: number) => {
    const x1 = Math.floor(x / BRICK);
    const x2 = Math.floor((x + w - 1) / BRICK);
    const y1 = Math.floor(y / BRICK);
    const y2 = Math.floor((y + h - 1) / BRICK);
    for (let yy = y1; yy <= y2; yy++)
      for (let xx = x1; xx <= x2; xx++) taken.add(yy * cols + xx);
  };
  for (const b of nonMembers) mark(b.x, b.y, b.w, b.h);

  const nextCell = () => {
    for (let y = 0; y < cols; y++)
      for (let x = cols - 1; x >= 0; x--)
        if (!taken.has(y * cols + x)) return { x: x * BRICK, y: y * BRICK };
    return null;
  };

  let moved = 0;
  for (const m of members) {
    const cell = nextCell();
    if (!cell) {
      console.error(`board full — brick ${m.id} left at (${m.x}, ${m.y})`);
      break;
    }
    await db.wallBlock.update({
      where: { id: m.id },
      data: { x: cell.x, y: cell.y, w: BRICK, h: BRICK },
    });
    mark(cell.x, cell.y, BRICK, BRICK);
    moved++;
  }
  console.log(`resized ${moved} member bricks to 10x10`);
}

main().finally(() => db.$disconnect());
