export function DashHeader({
  title,
  text,
  action,
}: {
  title: string;
  text?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex min-h-[52px] items-start justify-between gap-4">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-ink">{title}</h1>
        <p className="mt-1 min-h-5 text-sm text-muted">{text || " "}</p>
      </div>
      {action}
    </div>
  );
}
