import Image from "next/image";
import { VENMO } from "@/lib/venmo";

/** Venmo QR and link; the note tells the buyer what to put in the payment memo. */
export function VenmoPay({ note, compact = false }: { note?: string; compact?: boolean }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-sky-200 bg-sky-50 p-4 text-center sm:flex-row sm:text-left">
      <Image
        src={VENMO.qrImage}
        alt={`Venmo QR code for ${VENMO.handle}`}
        width={compact ? 140 : 200}
        height={compact ? 131 : 188}
        className="rounded-xl bg-white"
      />
      <div className="space-y-2 text-sm text-slate-700">
        <p className="font-bold text-slate-900">
          Pay with Venmo: {VENMO.handle} ({VENMO.name})
        </p>
        <p>Scan the code with your phone camera, or tap the button on your phone.</p>
        {note ? <p className="text-xs text-slate-600">{note}</p> : null}
        <a
          href={VENMO.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center rounded-xl bg-sky-600 px-4 py-2 font-semibold text-white hover:bg-sky-700"
        >
          Open Venmo ↗
        </a>
      </div>
    </div>
  );
}
