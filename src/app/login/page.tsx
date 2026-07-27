import type { Metadata } from "next";
import Link from "next/link";
import { LoginForm } from "@/components/forms/LoginForm";
import { Card } from "@/components/ui";
import { JoinBenefits } from "@/components/JoinBenefits";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Sign in" };

export default function LoginPage({
  searchParams,
}: {
  searchParams: { next?: string };
}) {
  return (
    <div className="flex justify-center gap-8 py-6">
      <div className="w-full max-w-md space-y-4">
        <h1 className="text-2xl font-bold">Sign in to Godesi</h1>
        <Card>
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
