export function EmptyState({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-stone-200 px-6 py-14 text-center">
      <p className="text-sm font-medium text-stone-900">{title}</p>
      <p className="mt-1 text-sm text-stone-500">{text}</p>
    </div>
  );
}
