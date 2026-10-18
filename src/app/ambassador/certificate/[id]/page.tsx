import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { properName } from "@/lib/names";
import { PrintButton } from "@/components/PrintButton";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "GoDesi Local Ambassador certificate",
  robots: { index: false },
};

export default async function AmbassadorCertificatePage({
  params,
}: {
  params: { id: string };
}) {
  const ambassador = await db.ambassador.findUnique({
    where: { id: params.id },
    include: { user: { select: { name: true, username: true } } },
  });
  if (
    !ambassador ||
    ambassador.status !== "APPROVED" ||
    !ambassador.approvedAt ||
    ambassador.certificateNo === null
  )
    notFound();

  const name = properName(ambassador.user.name);
  const number = String(ambassador.certificateNo).padStart(4, "0");

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 print:hidden">
        {ambassador.user.username ? (
          <Link
            href={`/${ambassador.user.username}`}
            className="text-sm font-semibold text-indigo-600"
          >
            ← {name}&apos;s profile
          </Link>
        ) : (
          <span />
        )}
        <PrintButton />
      </div>
      <div className="rounded-3xl border-[10px] border-double border-amber-500 bg-gradient-to-br from-amber-50 via-white to-emerald-50 p-8 text-center shadow-sm sm:p-12">
        <p className="text-sm font-bold uppercase tracking-[0.3em] text-amber-700">
          GoDesi.com
        </p>
        <h1 className="mt-3 font-serif text-3xl font-black text-slate-900 sm:text-4xl">
          Certificate of Honour
        </h1>
        <p className="mt-6 text-slate-600">This certifies that</p>
        <p className="mt-2 font-serif text-3xl italic text-emerald-800 sm:text-4xl">
          {name}
        </p>
        <p className="mt-4 text-slate-700">
          is an approved
          <strong className="block text-xl text-slate-900">
            🤝 GoDesi Local Ambassador — {ambassador.city}
          </strong>
        </p>
        <p className="mx-auto mt-4 max-w-lg text-sm text-slate-600">
          for helping the South Asian community be discovered, heard and
          remembered, and for signing and keeping the GoDesi ambassador ethics
          pledge.
        </p>
        <div className="mt-8 flex flex-wrap items-end justify-between gap-4 text-left text-xs text-slate-500">
          <div>
            <p className="font-semibold text-slate-800">
              📜 Ethics pledge signed
            </p>
            <p>{ambassador.pledgedAt.toDateString()}</p>
          </div>
          <div className="text-right">
            <p className="font-semibold text-slate-800">
              Certificate No. GD-AMB-{number}
            </p>
            <p>Approved {ambassador.approvedAt.toDateString()}</p>
          </div>
        </div>
      </div>
      <p className="text-center text-xs text-slate-500 print:hidden">
        Anyone can check this certificate at this page&apos;s address. It is
        removed if the ambassador is no longer approved.
      </p>
    </div>
  );
}
