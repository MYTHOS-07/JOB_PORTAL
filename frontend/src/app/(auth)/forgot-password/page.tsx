"use client";

import Link from "next/link";
import { useState } from "react";
import { Alert } from "@/components/common/Alert";
import { Field, inputClass } from "@/components/common/Field";
import { PageHeader } from "@/components/layout/PageHeader";
import { authService, getErrorMessage } from "@/services/auth.service";
import { forgotPasswordSchema } from "@/schemas/auth";

export default function ForgotPasswordPage() {
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [resetUrl, setResetUrl] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(formData: FormData) {
    setError("");
    setMessage("");
    setResetUrl("");
    const parsed = forgotPasswordSchema.safeParse({ email: formData.get("email") });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Invalid email");
      return;
    }
    setLoading(true);
    try {
      const response = await authService.forgotPassword(parsed.data.email);
      setMessage(response.message);
      if (response.data?.resetUrl) {
        setResetUrl(response.data.resetUrl);
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-md">
      <PageHeader
        title="Forgot password"
        text="Enter your account email. We send a reset link to smtp4dev in local development."
      />
      <form action={(formData) => void onSubmit(formData)} className="space-y-4 rounded-2xl border border-stone-200 bg-card p-6">
        {error ? <Alert>{error}</Alert> : null}
        {message ? <Alert tone="success">{message}</Alert> : null}
        {resetUrl ? (
          <Alert tone="muted">
            Development reset link:{" "}
            <Link href={resetUrl} className="font-medium text-ink underline">
              Open reset page
            </Link>
          </Alert>
        ) : null}
        <Field label="Email">
          <input name="email" type="email" className={inputClass} required />
        </Field>
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-stone-900 py-2.5 text-sm font-medium text-white"
        >
          {loading ? "Sending…" : "Send reset link"}
        </button>
        <p className="text-center text-sm text-stone-500">
          Local inbox:{" "}
          <a href="http://localhost:3000" className="underline" target="_blank" rel="noreferrer">
            smtp4dev
          </a>
        </p>
      </form>
    </div>
  );
}
