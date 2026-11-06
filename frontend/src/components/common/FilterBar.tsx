import { dashSelectClass, dashSelectStyle, inputClass } from "@/components/common/Field";

export function FilterBar({
  action,
  children,
  columns = 4,
}: {
  action: string;
  children: React.ReactNode;
  columns?: 3 | 4 | 5;
}) {
  const grid =
    columns === 5 ? "sm:grid-cols-5" : columns === 3 ? "sm:grid-cols-3" : "sm:grid-cols-4";

  return (
    <form
      action={action}
      method="get"
      className={`mb-6 grid gap-3 rounded-xl border border-line bg-card p-4 ${grid}`}
    >
      {children}
      <div className="flex items-end">
        <button type="submit" className="h-[42px] w-full rounded-lg bg-zinc-800 text-sm font-medium text-white hover:bg-zinc-700">
          Search
        </button>
      </div>
    </form>
  );
}

export function FilterInput({
  label,
  name,
  defaultValue,
  placeholder,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  placeholder?: string;
}) {
  return (
    <label className="block space-y-1.5">
      <span className="text-sm font-medium text-ink">{label}</span>
      <input name={name} defaultValue={defaultValue} placeholder={placeholder} className={inputClass} />
    </label>
  );
}

export function FilterSelect({
  label,
  name,
  defaultValue,
  options,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  options: { value: string; label: string }[];
}) {
  return (
    <label className="block space-y-1.5">
      <span className="text-sm font-medium text-ink">{label}</span>
      <select
        name={name}
        defaultValue={defaultValue ?? ""}
        className={`${dashSelectClass} h-[42px] text-sm`}
        style={dashSelectStyle}
      >
        {options.map((option) => (
          <option key={option.value || "all"} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
