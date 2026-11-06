"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Alert } from "@/components/common/Alert";
import { Field, inputClass } from "@/components/common/Field";
import { PageHeader } from "@/components/layout/PageHeader";
import { useAuth } from "@/context/AuthContext";
import { dashboardPath } from "@/lib/format";
import { authService, getErrorMessage } from "@/services/auth.service";
import { loginSchema } from "@/schemas/auth";

export default function LoginPage() {
  const router = useRouter();
  const { setUser } = useAuth();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(formData: FormData) {
    setError("");
    const parsed = loginSchema.safeParse({
      email: formData.get("email"),
      password: formData.get("password"),
    });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Invalid details");
      return;
    }
    setLoading(true);
    try {
      const response = await authService.login(parsed.data.email, parsed.data.password);
      setUser(response.data);
      router.push(dashboardPath(response.data.role));
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-md">
      <PageHeader title="Log in" text="Welcome back to Elevate Workforce." />
      <form action={(formData) => void onSubmit(formData)} className="space-y-4 rounded-2xl border border-stone-200 bg-card p-6">
        {error ? <Alert>{error}</Alert> : null}
        <Field label="Email">
          <input name="email" type="email" className={inputClass} required />
        </Field>
        <Field label="Password">
          <input name="password" type="password" className={inputClass} required />
        </Field>
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-stone-900 py-2.5 text-sm font-medium text-white disabled:opacity-60"
        >
          {loading ? "Signing in…" : "Log in"}
        </button>
        <div className="flex justify-between text-sm text-stone-500">
          <Link href="/forgot-password">Forgot password</Link>
          <Link href="/register">Create account</Link>
        </div>
      </form>
    </div>
  );
}
