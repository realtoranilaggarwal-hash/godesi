import type { Metadata } from "next";
import Link from "next/link";
import { LoginForm } from "@/components/forms/LoginForm";
import { Card } from "@/components/ui";
import { JoinBenefits } from "@/components/JoinBenefits";
import { GoogleSignIn } from "@/components/GoogleSignIn";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Sign in to Godesi",
  description:
    "Sign in to manage your Godesi business card, listings, events, leads, coupons and reward points.",
  alternates: { canonical: "/login" },
  robots: { index: false },
};

export default function LoginPage({
  searchParams,
}: {
  searchParams: { next?: string; error?: string };
}) {
  return (
    <div className="flex justify-center gap-8 py-6">
      <div className="w-full max-w-md space-y-4">
        <h1 className="text-2xl font-bold">Sign in to Godesi</h1>
        {searchParams.error === "google" ? (
          <p className="rounded-xl bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
            Google sign-in did not complete. Please try again or use your email
            and password.
          </p>
        ) : null}
        <Card>
          <GoogleSignIn next={searchParams.next} label="Sign in with Google" />
          <LoginForm next={searchParams.next} />
        </Card>
        <p className="text-sm text-slate-600">
          New here?{" "}
          <Link
            href={
              searchParams.next
                ? `/signup?next=${encodeURIComponent(searchParams.next)}`
                : "/signup"
            }
            className="font-semibold text-indigo-600"
          >
            Create an account
          </Link>
        </p>
      </div>

      <JoinBenefits />
    </div>
  );
}
