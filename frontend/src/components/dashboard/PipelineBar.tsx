const colors: Record<string, string> = {
  Pending: "bg-amber-400",
  Reviewing: "bg-sky-500",
  Shortlisted: "bg-teal-500",
  Interview: "bg-indigo-500",
  Rejected: "bg-rose-400",
  Accepted: "bg-emerald-500",
};

export function PipelineBar({
  segments,
}: {
  segments: { label: string; value: number }[];
}) {
  const total = segments.reduce((sum, item) => sum + item.value, 0) || 1;

  return (
    <div className="space-y-3 p-4">
      <div className="flex h-3 overflow-hidden rounded-full bg-line">
        {segments.map((item) => (
          <span
            key={item.label}
            className={colors[item.label] ?? "bg-muted"}
            style={{ width: `${(item.value / total) * 100}%` }}
          />
        ))}
      </div>
      <div className="grid grid-cols-2 gap-2 text-xs text-muted sm:grid-cols-3">
        {segments.map((item) => (
          <div key={item.label} className="flex items-center justify-between gap-2">
            <span>{item.label}</span>
            <span className="tabular-nums font-medium text-ink">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
