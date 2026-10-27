import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

/** Booking detail lives on the list; email/notify links land here. */
export default function BookingDetailPage({
  params,
}: {
  params: { id: string };
}) {
  redirect(`/dashboard/bookings#${params.id}`);
}
