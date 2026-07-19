import type { LucideIcon } from "lucide-react";

export function ModulePlaceholder({
  title,
  description,
  icon: Icon,
}: {
  title: string;
  description: string;
  icon: LucideIcon;
}) {
  return (
    <div className="flex h-full flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 bg-white p-12 text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
        <Icon className="h-6 w-6 text-slate-500" />
      </div>
      <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
      <p className="mt-1 max-w-sm text-sm text-slate-500">{description}</p>
      <span className="mt-4 inline-flex items-center rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-800">
        Bu modül sonraki aşamada eklenecek
      </span>
    </div>
  );
}
