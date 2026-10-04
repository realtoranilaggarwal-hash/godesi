import Link from "next/link";
import { ClipCoupon } from "@/components/ClipCoupon";
import { LogoTile } from "@/components/LogoTile";
import { expiryLabel } from "@/lib/dealFormat";

export type DealCardProps = {
  title: string;
  details: string | null;
  code: string | null;
  linkUrl: string | null;
  expiresAt: Date | null;
  business?: {
    slug: string;
    name: string;
    city: string;
    logoUrl: string | null;
    icon?: string | null;
    line?: string | null;
  };
  /** Issuer printed on the downloaded coupon when no business header is shown. */
  issuer?: string | null;
  pageUrl?: string | null;
};

export function DealCard({
  title,
  details,
  code,
  linkUrl,
  expiresAt,
  business,
  issuer,
  pageUrl,
}: DealCardProps) {
  return (
    <ClipCoupon
      title={title}
      details={details}
      code={code}
      ends={expiryLabel(expiresAt)}
      issuer={business?.name ?? issuer}
      pageUrl={business ? `godesi.com/b/${business.slug}` : pageUrl}
      action={
        linkUrl
          ? { href: linkUrl, label: "Claim offer →", external: true }
          : null
      }
      header={
        business ? (
          <Link
            href={`/b/${business.slug}`}
            className="flex items-center gap-2 text-sm font-semibold text-slate-800 hover:text-indigo-700"
          >
            <LogoTile
              name={business.name}
              icon={business.icon}
              imageUrl={business.logoUrl}
              className="h-9 w-9 shrink-0"
              emojiClassName="text-lg"
            />
            <span className="min-w-0 leading-tight">
              <span className="block truncate">{business.name}</span>
              <span className="block truncate text-xs font-normal text-slate-500">
                {[business.line, business.city].filter(Boolean).join(" · ")}
              </span>
            </span>
          </Link>
        ) : null
      }
    />
  );
}
