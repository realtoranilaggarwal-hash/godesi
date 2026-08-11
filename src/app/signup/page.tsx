import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { SignupForm } from "@/components/forms/SignupForm";
import { Card } from "@/components/ui";
import { JoinBenefits } from "@/components/JoinBenefits";
import { SocialSignIn } from "@/components/SocialSignIn";
import { FoundingOffer } from "@/components/FoundingOffer";

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
    <div className="flex justify-center gap-8 py-6">
      <div className="w-full max-w-md space-y-4">
        <h1 className="text-2xl font-bold">Create your Godesi account</h1>
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

      <JoinBenefits />
    </div>
  );
}
