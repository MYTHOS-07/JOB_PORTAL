"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Alert } from "@/components/common/Alert";
import { dashSelectClass, dashSelectStyle, Field, inputClass } from "@/components/common/Field";
import { getErrorMessage } from "@/services/auth.service";
import { jobService } from "@/services/job.service";
import type { Job, JobCategory } from "@/types/api";

export function JobForm({ job, categories }: { job?: Job; categories: JobCategory[] }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(formData: FormData) {
    setError("");
    setLoading(true);
    const deadline = String(formData.get("applicationDeadline") ?? "");
    const body = {
      title: formData.get("title"),
      description: formData.get("description"),
      location: formData.get("location"),
      employmentType: formData.get("employmentType"),
      experienceLevel: formData.get("experienceLevel"),
      categoryId: Number(formData.get("categoryId")),
      salaryMin: formData.get("salaryMin") ? Number(formData.get("salaryMin")) : undefined,
      salaryMax: formData.get("salaryMax") ? Number(formData.get("salaryMax")) : undefined,
      applicationDeadline: deadline ? new Date(deadline).toISOString() : undefined,
      status: formData.get("status"),
    };
    try {
      if (job) {
        const updateBody = {
          title: body.title,
          description: body.description,
          location: body.location,
          employmentType: body.employmentType,
          experienceLevel: body.experienceLevel,
          categoryId: body.categoryId,
          salaryMin: body.salaryMin,
          salaryMax: body.salaryMax,
          applicationDeadline: body.applicationDeadline,
        };
        await jobService.update(job.id, updateBody);
        if (body.status) {
          await jobService.changeStatus(job.id, body.status as Job["status"]);
        }
      } else {
        await jobService.create(body);
      }
      router.push("/employer/jobs");
      router.refresh();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  const deadlineValue = job?.applicationDeadline
    ? new Date(job.applicationDeadline).toISOString().slice(0, 16)
    : "";

  return (
    <form action={(formData) => void onSubmit(formData)} className="space-y-4 rounded-2xl border border-stone-200 bg-card p-6">
      {error ? <Alert>{error}</Alert> : null}
      <Field label="Title">
        <input name="title" defaultValue={job?.title ?? ""} className={inputClass} required />
      </Field>
      <Field label="Description">
        <textarea name="description" defaultValue={job?.description ?? ""} rows={6} className={inputClass} required />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Location">
          <input name="location" defaultValue={job?.location ?? ""} className={inputClass} required />
        </Field>
        <Field label="Category">
          <select name="categoryId" defaultValue={job?.categoryId ?? ""} className={inputClass} required>
            <option value="">Select</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Employment type">
          <select name="employmentType" defaultValue={job?.employmentType ?? "FULL_TIME"} className={inputClass}>
            <option value="FULL_TIME">Full-time</option>
            <option value="PART_TIME">Part-time</option>
            <option value="CONTRACT">Contract</option>
            <option value="INTERNSHIP">Internship</option>
            <option value="REMOTE">Remote</option>
          </select>
        </Field>
        <Field label="Experience">
          <select name="experienceLevel" defaultValue={job?.experienceLevel ?? "ENTRY_LEVEL"} className={inputClass}>
            <option value="ENTRY_LEVEL">Entry</option>
            <option value="MID_LEVEL">Mid</option>
            <option value="SENIOR">Senior</option>
            <option value="LEAD">Lead</option>
          </select>
        </Field>
        <Field label="Salary min">
          <input name="salaryMin" type="number" defaultValue={job?.salaryMin ?? ""} className={inputClass} />
        </Field>
        <Field label="Salary max">
          <input name="salaryMax" type="number" defaultValue={job?.salaryMax ?? ""} className={inputClass} />
        </Field>
        <Field label="Deadline">
          <input name="applicationDeadline" type="datetime-local" defaultValue={deadlineValue} className={inputClass} />
        </Field>
        <Field label="Status">
          <select
            name="status"
            defaultValue={job?.status ?? "PUBLISHED"}
            className={`${dashSelectClass} h-[42px] text-sm`}
            style={dashSelectStyle}
          >
            <option value="DRAFT">Draft</option>
            <option value="PUBLISHED">Published</option>
            <option value="CLOSED">Closed</option>
          </select>
        </Field>
      </div>
      <button type="submit" disabled={loading} className="rounded-lg bg-stone-900 px-4 py-2.5 text-sm font-medium text-white">
        {job ? "Save job" : "Create job"}
      </button>
    </form>
  );
}
