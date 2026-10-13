import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { LoginForm } from "@/components/forms/LoginForm";
import { Card } from "@/components/ui";
import { JoinPerks, JoinRail } from "@/components/JoinBenefits";
import { SocialSignIn } from "@/components/SocialSignIn";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Sign in to Godesi",
  description:
    "Sign in to manage your Godesi business card, listings, events, leads, coupons and reward points.",
  alternates: { canonical: "/login" },
  robots: { index: false },
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: { next?: string; error?: string };
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
        <h1 className="text-2xl font-bold">Sign in to Godesi</h1>
        {searchParams.error === "suspended" ? (
          <p className="rounded-xl bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
            This account has been suspended. Email us if you think that is a
            mistake.
          </p>
        ) : searchParams.error === "facebook-email" ? (
          <p className="rounded-xl bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
            Facebook did not share an email address with us, so we could not
            create your account. Please allow email on the Facebook screen, or
            sign up with your email below.
          </p>
        ) : searchParams.error === "google" || searchParams.error === "facebook" ? (
          <p className="rounded-xl bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
            {searchParams.error === "google" ? "Google" : "Facebook"} sign-in did
            not complete. Please try again or use your email and password.
          </p>
        ) : null}
        <Card>
          <SocialSignIn next={searchParams.next} verb="Sign in" />
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

      <JoinRail />
    </div>
  );
}
