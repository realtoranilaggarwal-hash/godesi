import type { Metadata } from "next";
import { redirect } from "next/navigation";
import type { VideoOrder } from "@prisma/client";
import { db } from "@/lib/db";
import { getCurrentUser, isStaff } from "@/lib/auth";
import { deskFallback } from "@/lib/adminSections";
import { updateVideoOrderAction } from "@/app/actions/videoOrders";
import { ActionForm } from "@/components/gigs/GigForms";
import { Badge, Card, Field, inputClass } from "@/components/ui";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "AI videos" };

const TONE: Record<string, "slate" | "indigo" | "amber" | "green" | "red"> = {
  PENDING: "slate",
  PAID: "amber",
  DELIVERED: "green",
  CANCELLED: "red",
};

type Row = VideoOrder & { user: { name: string; email: string } | null };

function when(date: Date | null) {
  return date
    ? date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    : "";
}

function OrderCard({ order }: { order: Row }) {
  const wa = order.deliveryWhatsapp.replace(/\D/g, "");
  return (
    <li className="space-y-2 rounded-2xl border border-slate-200 p-4 text-sm">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="min-w-0">
          <span className="font-bold text-slate-900">{order.businessName}</span>
          <span className="text-slate-500">
            {" "}
            · {order.language} · ${(order.priceMinor / 100).toFixed(0)}
            {order.user ? ` · ${order.user.name || order.user.email}` : ""}
          </span>
          <div className="text-xs text-slate-500">
            {order.paidAt ? `Paid ${when(order.paidAt)}` : `Started ${when(order.createdAt)}`}
            {order.deliveredAt ? ` · Delivered ${when(order.deliveredAt)}` : ""}
            {order.email ? ` · ${order.email}` : ""}
          </div>
        </div>
        <Badge tone={TONE[order.status] ?? "slate"}>{order.status}</Badge>
      </div>
      <p className="whitespace-pre-wrap break-words rounded-xl bg-slate-50 p-3 text-slate-800">
        {order.script}
      </p>
      <p className="break-words text-xs text-slate-600">
        On screen: <strong>{order.contactPhone}</strong>
        {order.websiteUrl ? (
          <>
            {" "}
            · <strong>{order.websiteUrl}</strong>
          </>
        ) : null}
        {order.logoUrl ? (
          <>
            {" "}
            ·{" "}
            <a href={order.logoUrl} target="_blank" rel="noreferrer" className="font-semibold text-indigo-700 underline">
              Logo/photo
            </a>
          </>
        ) : null}
        {" "}· Deliver to{" "}
        <a
          href={`https://wa.me/${wa}`}
          target="_blank"
          rel="noreferrer"
          className="font-semibold text-emerald-700 underline"
        >
          WhatsApp {order.deliveryWhatsapp}
        </a>
      </p>
      <ActionForm action={updateVideoOrderAction.bind(null, order.id)} submitLabel="Save">
        <div className="grid gap-2 sm:grid-cols-3">
          <Field label="Status">
            <select name="status" defaultValue={order.status} className={inputClass}>
              <option value="PENDING">Pending (not paid)</option>
              <option value="PAID">Paid — to make</option>
              <option value="DELIVERED">Delivered</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </Field>
          <Field label="Finished video link" className="sm:col-span-2">
            <input name="videoUrl" defaultValue={order.videoUrl ?? ""} placeholder="https://…" className={inputClass} />
          </Field>
        </div>
        <Field label="Notes">
          <textarea name="staffNotes" rows={2} defaultValue={order.staffNotes ?? ""} className={inputClass} />
        </Field>
        <label className="flex items-center gap-2 text-xs">
          <input type="checkbox" name="revisionUsed" value="1" defaultChecked={order.revisionUsed} className="h-4 w-4" />
          Free revision used
        </label>
      </ActionForm>
    </li>
  );
}

export default async function AdminVideosPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/admin/videos");
  if (!isStaff(user)) redirect(deskFallback(user, "AI videos"));

  const include = { user: { select: { name: true, email: true } } };
  const [toMake, delivered, unpaid] = await Promise.all([
    db.videoOrder.findMany({ where: { status: "PAID" }, orderBy: { paidAt: "asc" }, take: 100, include }),
    db.videoOrder.findMany({ where: { status: "DELIVERED" }, orderBy: { deliveredAt: "desc" }, take: 50, include }),
    db.videoOrder.findMany({
      where: { status: { in: ["PENDING", "CANCELLED"] } },
      orderBy: { createdAt: "desc" },
      take: 30,
      include,
    }),
  ]);

  const section = (title: string, rows: Row[], empty: string) => (
    <Card>
      <h2 className="mb-3 font-bold">{title}</h2>
      {rows.length ? (
        <ul className="space-y-3">
          {rows.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </ul>
      ) : (
        <p className="text-sm text-slate-500">{empty}</p>
      )}
    </Card>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">🎬 AI videos</h1>
        <p className="text-sm text-slate-600">
          $50 AI presenter videos ordered from /video-order · {toMake.length} paid and waiting ·{" "}
          {delivered.length} delivered
        </p>
      </div>
      {section("Paid — make and WhatsApp these (oldest first)", toMake, "Nothing waiting.")}
      {section("Delivered", delivered, "None yet.")}
      {section("Started but not paid / cancelled", unpaid, "None.")}
    </div>
  );
}
