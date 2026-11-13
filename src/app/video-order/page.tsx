import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { Alert, Card } from "@/components/ui";
import { VideoOrderForm } from "@/components/video/VideoOrderForm";
import { VIDEO_OFFER } from "@/lib/videoOrders";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: `AI video for your business — $${VIDEO_OFFER.priceUsd}`,
  description:
    "A talking AI presenter video about your business, like our GoDesi Shorts. You send the words, we make the video and WhatsApp it back to you.",
};

export default async function VideoOrderPage({
  searchParams,
}: {
  searchParams: { cancelled?: string };
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/video-order");

  const business = await db.business.findUnique({
    where: { ownerId: user.id },
    select: { name: true, phone: true, whatsappNumber: true },
  });

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <section className="rounded-3xl bg-gradient-to-r from-fuchsia-600 via-rose-600 to-orange-500 px-5 py-7 text-white sm:px-8">
        <p className="text-sm font-bold uppercase tracking-wide text-white/80">GoDesi Shorts for you</p>
        <h1 className="mt-1 text-3xl font-black leading-tight">
          🎬 AI video for your business — ${VIDEO_OFFER.priceUsd}
        </h1>
        <p className="mt-3 text-white/90">
          A talking AI presenter video about your business, like our GoDesi Shorts. You send
          the words, we make the video and WhatsApp it back to you.
        </p>
        <Link href={VIDEO_OFFER.examplesHref} className="mt-3 inline-block font-semibold text-white underline">
          See examples →
        </Link>
      </section>

      {searchParams.cancelled ? (
        <Alert>Payment cancelled — nothing has been charged. Your words are not saved, so paste them again.</Alert>
      ) : null}

      <Card>
        <VideoOrderForm
          defaults={{
            businessName: business?.name,
            contactPhone: business?.whatsappNumber ?? business?.phone ?? undefined,
            websiteUrl: user.username ? `godesi.com/${user.username}` : undefined,
          }}
        />
      </Card>
    </div>
  );
}
