import type { Metadata } from "next";
import Link from "next/link";
import { SignupForm } from "@/components/forms/SignupForm";
import { Card } from "@/components/ui";
import { JoinBenefits } from "@/components/JoinBenefits";
import { GoogleSignIn } from "@/components/GoogleSignIn";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Create your free Godesi account",
  description:
    "Join Godesi free: a digital business card with QR code and WhatsApp button, buyer requirements, event tickets, coupons and reward points for the desi community.",
  alternates: { canonical: "/signup" },
};

export default function SignupPage({
  searchParams,
}: {
  searchParams: { role?: string; next?: string };
}) {
  return (
    <div className="flex justify-center gap-8 py-6">
      <div className="w-full max-w-md space-y-4">
        <h1 className="text-2xl font-bold">Create your Godesi account</h1>
        <Card>
          <GoogleSignIn next={searchParams.next} label="Sign up with Google" />
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
