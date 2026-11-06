"use client";

import { Link } from "next-view-transitions";
import { motion } from "framer-motion";
import { Badge } from "@/components/common/Badge";
import { employmentLabels, formatSalary } from "@/lib/format";
import type { Job } from "@/types/api";

export function JobCard({ job }: { job: Job }) {
  return (
    <motion.div whileHover={{ y: -4 }} whileTap={{ scale: 0.995 }} transition={{ type: "spring", stiffness: 360, damping: 26 }}>
    <Link
      href={`/jobs/${job.id}`}
      className="group block rounded-2xl border border-line bg-card p-5 shadow-[0_8px_30px_rgba(18,38,58,0.04)] transition hover:border-accent/40"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-accent">
            {job.company?.companyName ?? "Company"}
          </p>
          <h3 className="mt-1 text-lg font-semibold text-ink group-hover:text-accent">{job.title}</h3>
        </div>
        <Badge muted>{employmentLabels[job.employmentType] ?? job.employmentType}</Badge>
      </div>
      <p className="mt-3 line-clamp-2 text-sm leading-6 text-muted">{job.description}</p>
      <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-sm text-ink/70">
        <span>{job.location}</span>
        <span>{formatSalary(job.salaryMin, job.salaryMax)}</span>
        {job.category ? <span>{job.category.name}</span> : null}
        {job._count ? <span>{job._count.applications} applicants</span> : null}
      </div>
    </Link>
    </motion.div>
  );
}
