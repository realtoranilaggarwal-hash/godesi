import Image from "next/image";
import type { PressCard as PressCardData } from "@/lib/journalists";

function shortDate(date: Date) {
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

/**
 * The Godesi press card an Editor-level journalist can show at a venue. The QR
 * points at their public profile so anyone can check the card is real.
 */
export function PressCard({ card }: { card: PressCardData }) {
  return (
    <div
      className={`overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-indigo-900 to-fuchsia-900 p-4 text-white shadow-lg ${
        card.expired ? "opacity-60 grayscale" : ""
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="text-sm font-black tracking-widest">GODESI PRESS</span>
        <span className="rounded-full bg-white/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest">
          {card.expired ? "Expired" : card.level}
        </span>
      </div>

      <div className="mt-3 flex items-center gap-3">
        {card.avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={card.avatarUrl}
            alt=""
            className="h-16 w-16 rounded-xl border-2 border-white/40 object-cover"
          />
        ) : (
          <span className="flex h-16 w-16 items-center justify-center rounded-xl border-2 border-white/40 bg-white/10 text-2xl font-black">
            {card.name.slice(0, 1).toUpperCase()}
          </span>
        )}

        <div className="min-w-0 flex-1">
          <p className="truncate text-lg font-black leading-tight">
            {card.name}
          </p>
          {card.beat ? (
            <p className="truncate text-xs text-white/80">
              Coverage area: {card.beat}
            </p>
          ) : null}
          <p className="mt-1 font-mono text-sm tracking-widest text-amber-300">
            {card.id}
          </p>
        </div>

        {card.username ? (
          <Image
            src={`/api/qr/u/${card.username}`}
            alt={`QR code for ${card.name}`}
            width={64}
            height={64}
            unoptimized
            className="h-16 w-16 shrink-0 rounded-lg bg-white p-0.5"
          />
        ) : null}
      </div>

      <dl className="mt-3 grid grid-cols-2 gap-2 border-t border-white/20 pt-2 text-[11px]">
        <div>
          <dt className="uppercase tracking-wide text-white/60">Issued</dt>
          <dd className="font-semibold">{shortDate(card.issuedAt)}</dd>
        </div>
        <div>
          <dt className="uppercase tracking-wide text-white/60">Valid until</dt>
          <dd className="font-semibold">{shortDate(card.expiresAt)}</dd>
        </div>
      </dl>

      <p className="mt-2 text-[10px] leading-snug text-white/60">
        Issued by Godesi to a community journalist. This card grants no legal
        press accreditation — scan the QR to verify the holder.
      </p>
    </div>
  );
}
