import { cn } from "@/lib/cn";

export function Alert({
  children,
  tone = "error",
}: {
  children: React.ReactNode;
  tone?: "error" | "success" | "muted";
}) {
  return (
    <p
      className={cn(
        "rounded-lg border px-3 py-2 text-sm",
        tone === "error" && "border-red-200 bg-red-50 text-red-800",
        tone === "success" && "border-emerald-200 bg-emerald-50 text-emerald-800",
        tone === "muted" && "border-stone-200 bg-stone-50 text-stone-600",
      )}
    >
      {children}
    </p>
  );
}
