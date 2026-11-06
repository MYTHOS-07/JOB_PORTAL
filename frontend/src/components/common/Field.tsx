import { cn } from "@/lib/cn";

export function Field({
  label,
  children,
  error,
}: {
  label: string;
  children: React.ReactNode;
  error?: string;
}) {
  return (
    <label className="block space-y-1.5">
      <span className="text-sm font-medium text-ink">{label}</span>
      {children}
      {error ? <span className="text-xs text-red-600">{error}</span> : null}
    </label>
  );
}

export const inputClass = cn(
  "w-full rounded-lg border border-line bg-card px-3 py-2.5 text-sm text-ink",
  "outline-none transition placeholder:text-muted/70 focus:border-accent",
);

const chevron =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%235c6b7a' stroke-width='2.4' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E\")";

export const dashSelectClass = cn(
  "h-8 w-full appearance-none rounded-md border border-line bg-card py-1 pl-2.5 pr-9 text-xs text-ink",
  "bg-no-repeat outline-none focus:border-accent",
);

export const dashSelectStyle = {
  backgroundImage: chevron,
  backgroundPosition: "right 12px center",
  backgroundSize: "12px",
};
