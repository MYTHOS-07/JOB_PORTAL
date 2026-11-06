"use client";

import { useState } from "react";
import { Alert } from "@/components/common/Alert";
import { Field, inputClass } from "@/components/common/Field";
import { useToast } from "@/context/ToastContext";
import { assetUrl } from "@/lib/format";
import { getErrorMessage } from "@/services/auth.service";
import { companyService } from "@/services/company.service";
import type { Company } from "@/types/api";

export function CompanyForm({ company: initial }: { company: Company | null }) {
  const { flash } = useToast();
  const [company, setCompany] = useState(initial);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function onSubmit(formData: FormData) {
    setError("");
    setMessage("");
    const body = {
      companyName: formData.get("companyName"),
      description: formData.get("description"),
      industry: formData.get("industry"),
      website: formData.get("website") || undefined,
      location: formData.get("location"),
      phone: formData.get("phone"),
    };
    try {
      const response = company ? await companyService.update(body) : await companyService.create(body);
      setCompany(response.data);
      setMessage("Company profile saved.");
      flash("Company profile saved.");
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  async function onLogo(file?: File) {
    if (!file) return;
    try {
      const response = await companyService.uploadLogo(file);
      setCompany(response.data);
      flash("Logo updated.");
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  async function onDelete() {
    if (!company || !window.confirm("Delete this company profile?")) return;
    try {
      await companyService.remove();
      setCompany(null);
      flash("Company profile removed.");
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  return (
    <div className="space-y-6">
      <form action={(formData) => void onSubmit(formData)} className="space-y-4 rounded-xl border border-line bg-card p-6 shadow-sm">
        {error ? <Alert>{error}</Alert> : null}
        {message ? <Alert tone="success">{message}</Alert> : null}
        {company ? (
          <div className="flex items-center gap-4">
            <div className="grid h-16 w-16 place-items-center overflow-hidden rounded-lg bg-line text-xs font-semibold">
              {company.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={assetUrl(company.logoUrl) ?? ""} alt="" className="h-full w-full object-cover" />
              ) : (
                company.companyName.slice(0, 2)
              )}
            </div>
            <label className="text-sm text-accent">
              Change logo
              <input type="file" accept="image/*" className="hidden" onChange={(event) => void onLogo(event.target.files?.[0])} />
            </label>
          </div>
        ) : null}
        <Field label="Company name">
          <input name="companyName" defaultValue={company?.companyName ?? ""} className={inputClass} required />
        </Field>
        <Field label="Industry">
          <input name="industry" defaultValue={company?.industry ?? ""} className={inputClass} />
        </Field>
        <Field label="Location">
          <input name="location" defaultValue={company?.location ?? ""} className={inputClass} />
        </Field>
        <Field label="Website">
          <input name="website" defaultValue={company?.website ?? ""} className={inputClass} />
        </Field>
        <Field label="Phone">
          <input name="phone" defaultValue={company?.phone ?? ""} className={inputClass} />
        </Field>
        <Field label="Description">
          <textarea name="description" defaultValue={company?.description ?? ""} rows={4} className={inputClass} />
        </Field>
        <button type="submit" className="rounded-md bg-ink px-4 py-2.5 text-sm font-medium text-white">
          {company ? "Update" : "Create"}
        </button>
      </form>
      {company ? (
        <button type="button" onClick={() => void onDelete()} className="text-sm text-rose-700 hover:underline">
          Delete company profile
        </button>
      ) : null}
    </div>
  );
}
