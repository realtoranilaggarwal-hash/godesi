import { db } from "@/lib/db";
import { ELITE_PACKAGES, type ElitePackageId } from "@/lib/elite";
import { notify } from "@/lib/notifications";

/**
 * Marks an Elite purchase paid and applies it to the profile: the interview fee
 * unlocks the shoot, the film upgrades the video package, and every payment adds
 * to the spend that decides placement inside a section. Idempotent, so the
 * webhook and the success redirect can both call it.
 */
export async function confirmEliteOrder({
  eliteOrderId,
  provider,
  reference,
  amountMinor,
  currency,
}: {
  eliteOrderId: string;
  provider: string;
  reference: string;
  amountMinor: number;
  currency: string;
}) {
  const order = await db.eliteOrder.findUnique({ where: { id: eliteOrderId } });
  if (!order) return null;
  if (order.status === "PAID") return order;

  const claimed = await db.eliteOrder.updateMany({
    where: { id: order.id, status: "PENDING" },
    data: { status: "PAID", provider, reference, amountMinor, currency },
  });
  if (claimed.count === 0) {
    return db.eliteOrder.findUnique({ where: { id: order.id } });
  }

  const item = ELITE_PACKAGES[order.packageId as ElitePackageId];
  await db.eliteEntry.update({
    where: { id: order.entryId },
    data: {
      paidCents: { increment: Math.round((item?.usd ?? 0) * 100) },
      ...(item?.kind === "INTERVIEW" ? { interviewPaid: true } : {}),
      ...(item?.kind === "VIDEO" ? { videoPackage: "PRO" } : {}),
    },
  });

  await notify({
    userId: order.userId,
    title: "Payment received for GoDesi Elite",
    body: `${item?.label ?? "Elite package"} is paid. Our team will be in touch about the next step.`,
    href: "/desi-elite/apply",
  });

  return db.eliteOrder.findUnique({ where: { id: order.id } });
}
