import type { Metadata } from "next";
import Link from "next/link";
import { LoginForm } from "@/components/forms/LoginForm";
import { Card } from "@/components/ui";

export const metadata: Metadata = { title: "Sign in" };

export default function LoginPage() {
  return (
    <div className="mx-auto max-w-md space-y-4 py-6">
      <h1 className="text-2xl font-bold">Sign in to Godesi</h1>
      <Card>
        <LoginForm />
      </Card>
      <p className="text-sm text-slate-600">
        New here?{" "}
        <Link href="/signup" className="font-semibold text-indigo-600">
          Create an account
        </Link>
      </p>
    </div>
  );
}
