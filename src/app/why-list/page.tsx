import type { Metadata } from "next";
import Link from "next/link";
import { WhyGodesi } from "@/components/WhyGodesi";
import { AboutGodesi } from "@/components/AboutGodesi";
import { LinkButton } from "@/components/ui";

export const metadata: Metadata = {
  title: "Why list on Godesi?",
  description:
    "Free digital business card, QR code, WhatsApp enquiries, buyer requirements, events and advertising — everything Godesi gives a desi business.",
  alternates: { canonical: "/why-list" },
};

export default function WhyListPage() {
  return (
    <div className="space-y-6">
      <AboutGodesi />
      <WhyGodesi />
      <div className="flex flex-wrap items-center gap-3">
        <LinkButton href="/signup?role=business">List my business free</LinkButton>
        <Link href="/pricing" className="text-sm font-semibold text-indigo-600 hover:underline">
          See plans and pricing →
        </Link>
      </div>
    </div>
  );
}
