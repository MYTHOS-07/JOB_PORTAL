import Link from "next/link";

export function Panel({
  title,
  actionHref,
  actionLabel,
  children,
}: {
  title: string;
  actionHref?: string;
  actionLabel?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-xl border border-line bg-card shadow-[0_8px_30px_rgba(18,38,58,0.04)]">
      <div className="flex h-12 items-center justify-between border-b border-line px-4">
        <h2 className="text-sm font-semibold text-ink">{title}</h2>
        {actionHref ? (
          <Link href={actionHref} className="text-xs font-medium text-accent hover:underline">
            {actionLabel ?? "View all"}
          </Link>
        ) : null}
      </div>
      {children}
    </section>
  );
}
