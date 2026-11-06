"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Alert } from "@/components/common/Alert";
import { Field, inputClass } from "@/components/common/Field";
import { PageHeader } from "@/components/layout/PageHeader";
import { authService, getErrorMessage } from "@/services/auth.service";
import { registerSchema } from "@/schemas/auth";
import type { Role } from "@/types/api";

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState<Role>("JOB_SEEKER");

  async function onSubmit(formData: FormData) {
    setError("");
    const parsed = registerSchema.safeParse({
      name: formData.get("name"),
      email: formData.get("email"),
      password: formData.get("password"),
      role,
    });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Invalid details");
      return;
    }
    setLoading(true);
    try {
      await authService.register(parsed.data);
      router.push("/login");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-md">
      <PageHeader title="Create account" text="Join as a job seeker or employer." />
      <form action={(formData) => void onSubmit(formData)} className="space-y-4 rounded-2xl border border-stone-200 bg-card p-6">
        {error ? <Alert>{error}</Alert> : null}
        <Field label="Full name">
          <input name="name" className={inputClass} required />
        </Field>
        <Field label="Email">
          <input name="email" type="email" className={inputClass} required />
        </Field>
        <Field label="Password">
          <input name="password" type="password" className={inputClass} required />
        </Field>
        <Field label="I am a">
          <select className={inputClass} value={role} onChange={(event) => setRole(event.target.value as Role)}>
            <option value="JOB_SEEKER">Job seeker</option>
            <option value="EMPLOYER">Employer</option>
          </select>
        </Field>
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-stone-900 py-2.5 text-sm font-medium text-white disabled:opacity-60"
        >
          {loading ? "Creating…" : "Register"}
        </button>
        <p className="text-sm text-stone-500">
          Already have an account? <Link href="/login">Log in</Link>
        </p>
      </form>
    </div>
  );
}
