"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { Alert } from "@/components/common/Alert";
import { Field, inputClass } from "@/components/common/Field";
import { PageHeader } from "@/components/layout/PageHeader";
import { Spinner } from "@/components/common/Spinner";
import { authService, getErrorMessage } from "@/services/auth.service";
import { resetPasswordSchema } from "@/schemas/auth";

function ResetForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token") ?? "";
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(formData: FormData) {
    setError("");
    const parsed = resetPasswordSchema.safeParse({
      token,
      newPassword: formData.get("newPassword"),
      confirmPassword: formData.get("confirmPassword"),
    });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Invalid details");
      return;
    }
    setLoading(true);
    try {
      await authService.resetPassword(
        parsed.data.token,
        parsed.data.newPassword,
        parsed.data.confirmPassword,
      );
      router.push("/login");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <form action={(formData) => void onSubmit(formData)} className="space-y-4 rounded-2xl border border-stone-200 bg-card p-6">
      {error ? <Alert>{error}</Alert> : null}
      {!token ? <Alert>Missing reset token. Open the link from your email.</Alert> : null}
      <Field label="New password">
        <input name="newPassword" type="password" className={inputClass} required />
      </Field>
      <Field label="Confirm password">
        <input name="confirmPassword" type="password" className={inputClass} required />
      </Field>
      <button
        type="submit"
        disabled={loading || !token}
        className="w-full rounded-lg bg-stone-900 py-2.5 text-sm font-medium text-white disabled:opacity-60"
      >
        Reset password
      </button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="mx-auto max-w-md">
      <PageHeader title="Reset password" text="Choose a new password for your account." />
      <Suspense
        fallback={
          <div className="flex justify-center py-10">
            <Spinner />
          </div>
        }
      >
        <ResetForm />
      </Suspense>
    </div>
  );
}
