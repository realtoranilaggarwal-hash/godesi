import type { Metadata } from "next";
import Link from "next/link";
import { SignupForm } from "@/components/forms/SignupForm";
import { Card } from "@/components/ui";

export const metadata: Metadata = { title: "Create your account" };

export default function SignupPage({
  searchParams,
}: {
  searchParams: { role?: string };
}) {
  return (
    <div className="mx-auto max-w-md space-y-4 py-6">
      <h1 className="text-2xl font-bold">Create your Godesi account</h1>
      <Card>
        <SignupForm
          defaultRole={searchParams.role === "CLIENT" ? "CLIENT" : "BUSINESS"}
        />
      </Card>
      <p className="text-sm text-slate-600">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-indigo-600">
          Sign in
        </Link>
      </p>
    </div>
  );
}
