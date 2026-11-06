"use client";

import { useState } from "react";
import { Link } from "next-view-transitions";
import { Alert } from "@/components/common/Alert";
import { Field, inputClass } from "@/components/common/Field";
import { useAuth } from "@/context/AuthContext";
import { applicationService } from "@/services/application.service";
import { getErrorMessage } from "@/services/auth.service";

export function JobApplyPanel({ jobId }: { jobId: number }) {
  const { user } = useAuth();
  const [coverLetter, setCoverLetter] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function apply() {
    setError("");
    setMessage("");
    setSubmitting(true);
    try {
      await applicationService.apply(jobId, coverLetter);
      setMessage("Application submitted.");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  if (user?.role !== "JOB_SEEKER") {
    return (
      <Link href="/login" className="block rounded-lg bg-ink py-2.5 text-center text-sm text-white">
        Log in to apply
      </Link>
    );
  }

  return (
    <div className="space-y-3 pt-2">
      {error ? <Alert>{error}</Alert> : null}
      {message ? <Alert tone="success">{message}</Alert> : null}
      <Field label="Cover letter">
        <textarea
          className={inputClass}
          rows={5}
          value={coverLetter}
          onChange={(event) => setCoverLetter(event.target.value)}
        />
      </Field>
      <button
        type="button"
        disabled={submitting}
        onClick={() => void apply()}
        className="w-full rounded-lg bg-ink py-2.5 text-sm font-medium text-white disabled:opacity-60"
      >
        {submitting ? "Submitting…" : "Apply"}
      </button>
    </div>
  );
}
