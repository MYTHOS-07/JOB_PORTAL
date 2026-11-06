import { cn } from "@/lib/cn";

export function Badge({ children, muted }: { children: React.ReactNode; muted?: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium",
        muted ? "bg-[#f3efe6] text-ink" : "bg-accent text-white",
      )}
    >
      {children}
    </span>
  );
}
