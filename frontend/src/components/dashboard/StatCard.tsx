export function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: number | string;
  hint?: string;
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-line bg-card p-5 shadow-[0_8px_30px_rgba(18,38,58,0.04)]">
      <div className="absolute inset-x-0 top-0 h-1 bg-accent" />
      <p className="text-sm text-muted">{label}</p>
      <p className="mt-2 text-3xl font-semibold tracking-tight text-ink">{value}</p>
      {hint ? <p className="mt-1 text-xs text-muted">{hint}</p> : null}
    </div>
  );
}
