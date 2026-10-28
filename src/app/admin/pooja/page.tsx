import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getCurrentUser, isStaff } from "@/lib/auth";
import { poojaPackageBySlug } from "@/lib/poojaPackages";
import { Card, EmptyState } from "@/components/ui";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Pooja bookings", robots: { index: false } };

export default async function AdminPoojaPage() {
  const user = await getCurrentUser();
  if (!user || !isStaff(user)) redirect("/");

  const bookings = await db.poojaBooking.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <h1 className="text-2xl font-black">🙏 Pooja bookings</h1>
      {bookings.length ? (
        bookings.map((booking) => {
          const pkg = poojaPackageBySlug(booking.package);
          return (
            <Card key={booking.id}>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-bold">
                    {pkg?.emoji} {pkg?.name ?? booking.package} —{" "}
                    {booking.priceUsd ? `$${booking.priceUsd}` : "custom quote"}
                  </p>
                  <p className="text-sm text-slate-600">
                    {booking.name} · {booking.email} · {booking.phone}
                  </p>
                </div>
                <span className="rounded-full bg-amber-100 px-2 py-1 text-xs font-bold text-amber-800">
                  {booking.status}
                </span>
              </div>
              <p className="mt-1 text-xs text-slate-500">
                Sankalp: {booking.sankalp || "—"} · Date:{" "}
                {booking.preferredDate
                  ? booking.preferredDate.toDateString()
                  : "flexible"}{" "}
                · Booked {booking.createdAt.toDateString()}
              </p>
              {booking.address ? (
                <p className="text-xs text-slate-500">
                  Prasad to: {booking.address}
                </p>
              ) : null}
              {booking.notes ? (
                <p className="mt-1 text-sm text-slate-600">{booking.notes}</p>
              ) : null}
            </Card>
          );
        })
      ) : (
        <EmptyState title="No pooja bookings yet" />
      )}
    </div>
  );
}
