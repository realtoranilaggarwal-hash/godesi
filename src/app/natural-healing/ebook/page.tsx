import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Card } from "@/components/ui";
import { HealthDisclaimer } from "@/components/wellness/HealthDisclaimer";
import { ProductBlock } from "@/components/wellness/ProductBlock";
import { WellnessText } from "@/components/wellness/WellnessText";
import { cachedCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  WELLNESS_EBOOK_PATH,
  WELLNESS_PATH,
  activeEbook,
  wellnessBlocks,
  wellnessProducts,
} from "@/lib/wellness";

export const dynamic = "force-dynamic";

const DESCRIPTION =
  "Free for GoDesi members: the Natural Healing eBook — traditional Indian wisdom for modern living, with research notes and safety guidance.";

export const metadata: Metadata = {
  title: "Free Natural Healing eBook",
  description: DESCRIPTION,
  alternates: { canonical: WELLNESS_EBOOK_PATH },
  openGraph: { title: "Free Natural Healing eBook", description: DESCRIPTION },
};

export default async function WellnessEbookPage() {
  const ebook = await activeEbook();
  if (!ebook) notFound();
  const [user, products] = await Promise.all([cachedCurrentUser(), wellnessProducts(null)]);
  const downloaded = user
    ? await db.ebookDownload.findUnique({
        where: { userId_ebookId: { userId: user.id, ebookId: ebook.id } },
        select: { id: true },
      })
    : null;
  const loginHref = `/login?next=${encodeURIComponent(WELLNESS_EBOOK_PATH)}`;
  const signupHref = `/signup?next=${encodeURIComponent(WELLNESS_EBOOK_PATH)}`;

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <Link href={WELLNESS_PATH} className="text-sm font-semibold text-emerald-700">
        ← Natural Healing &amp; Wellness
      </Link>
      <Card>
        <div className="flex flex-col gap-5 sm:flex-row">
          <div className="mx-auto w-44 shrink-0 sm:mx-0">
            {ebook.coverUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={ebook.coverUrl} alt={`${ebook.title} cover`} className="w-full rounded-lg shadow-md" />
            ) : (
              <span className="flex aspect-[3/4] items-center justify-center rounded-lg bg-emerald-700 text-5xl">📗</span>
            )}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-wide text-amber-700">Free for members</p>
            <h1 className="mt-1 break-words text-2xl font-black text-slate-900 sm:text-3xl">{ebook.title}</h1>
            <div className="mt-4 flex flex-wrap gap-2">
              {user ? (
                <a
                  href={`${WELLNESS_EBOOK_PATH}/download`}
                  className="rounded-full bg-emerald-700 px-5 py-2.5 text-sm font-bold text-white"
                >
                  ⬇️ {downloaded ? "Download again (PDF)" : "Download free eBook (PDF)"}
                </a>
              ) : (
                <>
                  <Link href={signupHref} className="rounded-full bg-emerald-700 px-5 py-2.5 text-sm font-bold text-white">
                    Register to get free eBook
                  </Link>
                  <Link href={loginHref} className="rounded-full border border-emerald-700 px-5 py-2.5 text-sm font-bold text-emerald-800">
                    Login
                  </Link>
                </>
              )}
            </div>
            {!user ? (
              <p className="mt-2 text-xs text-slate-500">Free GoDesi membership — takes under a minute.</p>
            ) : null}
          </div>
        </div>

        <div className="mt-6">
          <WellnessText blocks={wellnessBlocks(ebook.description)} />
        </div>

        <HealthDisclaimer className="mt-6" />
      </Card>

      <ProductBlock products={products} title="Recommended wellness products" />
    </div>
  );
}
