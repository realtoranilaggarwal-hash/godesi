"use client";

import { recordListingLeadAction } from "@/app/actions/listings";

/** WhatsApp button that also counts the enquiry for the seller's lead desk. */
export function WhatsAppLead({
  listingId,
  href,
  children,
}: {
  listingId: string;
  href: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => void recordListingLeadAction(listingId, "whatsapp")}
      className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 font-semibold text-white hover:bg-emerald-700 sm:w-auto"
    >
      {children}
    </a>
  );
}
