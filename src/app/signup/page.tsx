import type { Metadata } from "next";
import Link from "next/link";
import { SignupForm } from "@/components/forms/SignupForm";
import { Card } from "@/components/ui";
import { JoinBenefits } from "@/components/JoinBenefits";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Create your account" };

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
          <SignupForm
            defaultRole={searchParams.role === "CLIENT" ? "CLIENT" : "BUSINESS"}
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
