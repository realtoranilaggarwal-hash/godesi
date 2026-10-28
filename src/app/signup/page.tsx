import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { SignupForm } from "@/components/forms/SignupForm";
import { Card } from "@/components/ui";
import { JoinPerks, JoinRail } from "@/components/JoinBenefits";
import { SocialSignIn } from "@/components/SocialSignIn";
import { FoundingOffer } from "@/components/FoundingOffer";
import { NewsMediaStrip } from "@/components/NewsMediaStrip";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Create your free Godesi account",
  description:
    "Join Godesi free: a digital business card with QR code and WhatsApp button, buyer requirements, event tickets, coupons and reward points for the desi community.",
  alternates: { canonical: "/signup" },
};

export default async function SignupPage({
  searchParams,
}: {
  searchParams: { role?: string; next?: string };
}) {
  const user = await getCurrentUser();
  if (user) {
    redirect(
      searchParams.next || (user.role === "ADMIN" ? "/admin" : "/dashboard"),
    );
  }

  return (
    <div className="flex justify-center gap-6 py-6">
      <JoinPerks />

      <div className="w-full max-w-md space-y-4">
        <h1 className="text-2xl font-bold">Create your Godesi account</h1>
        <NewsMediaStrip />
        <Link
          href="/tools"
          className="block rounded-2xl border border-teal-200 bg-teal-50 px-4 py-3 text-sm font-bold text-teal-900 transition hover:bg-teal-100"
        >
          🧰 Members unlock 50+ free creator tools — SEO, design, video, email
          &amp; automation →
        </Link>
        <FoundingOffer showCta={false} />
        <Card>
          <SocialSignIn next={searchParams.next} verb="Sign up" />
          <SignupForm
            defaultRole={
              searchParams.role === "CLIENT" || searchParams.role === "PROFESSIONAL"
                ? searchParams.role
                : "BUSINESS"
            }
            next={searchParams.next}
          />
        </Card>
        <Card className="space-y-2 border-indigo-200 bg-indigo-50/60">
          <h2 className="font-bold text-slate-900">
            What would you like to do on GoDesi?
          </h2>
          <Link
            href="/ambassador"
            className="block rounded-xl bg-gradient-to-r from-amber-500 to-rose-500 px-4 py-2.5 text-sm font-black text-white hover:opacity-90"
          >
            🏅 Become a local GoDesi Ambassador — represent your city &amp;
            earn →
          </Link>
          <Link
            href="/post"
            className="block rounded-xl border border-indigo-200 bg-white px-4 py-2.5 text-sm font-bold text-indigo-700 hover:bg-indigo-50"
          >
            ✨ See everything you can post — business, event, item to sell,
            news… →
          </Link>
        </Card>
        <p className="text-sm text-slate-600">
          Already have an account?{" "}
          <Link
            href={
              searchParams.next
                ? `/login?next=${encodeURIComponent(searchParams.next)}`
                : "/login"
            }
            className="font-semibold text-indigo-600"
          >
            Sign in
          </Link>
        </p>
      </div>

      <JoinRail />
    </div>
  );
}
