"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Cigarette, ChevronDown } from "lucide-react";
import { primaryNavSections, advancedNavSection } from "@/lib/nav-config";
import { cn } from "@/lib/utils";

export function Sidebar() {
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  const advancedActive = advancedNavSection.items.some((item) =>
    isActive(item.href),
  );

  return (
    <aside className="hidden w-64 shrink-0 border-r border-slate-200 bg-white lg:flex lg:flex-col print:hidden">
      <div className="flex h-16 items-center gap-2 border-b border-slate-200 px-5">
        <Cigarette className="h-6 w-6 text-slate-900" />
        <div className="leading-tight">
          <p className="text-sm font-semibold text-slate-900">İkizler</p>
          <p className="text-xs text-slate-500">Tobacco ERP</p>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        {primaryNavSections.map((section) => (
          <div key={section.title} className="mb-5">
            <p className="mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
              {section.title}
            </p>
            <ul className="space-y-0.5">
              {section.items.map((item) => {
                const active = isActive(item.href);
                const Icon = item.icon;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 rounded-md px-2.5 py-2 text-sm font-medium transition-colors",
                        active
                          ? "bg-slate-900 text-white"
                          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
                      )}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}

        <details className="group" open={advancedActive}>
          <summary className="mb-2 flex cursor-pointer list-none items-center gap-1 px-2 text-xs font-semibold uppercase tracking-wider text-slate-400 hover:text-slate-600">
            <ChevronDown className="h-3 w-3 transition-transform group-open:rotate-0 -rotate-90" />
            {advancedNavSection.title}
          </summary>
          <ul className="space-y-0.5">
            {advancedNavSection.items.map((item) => {
              const active = isActive(item.href);
              const Icon = item.icon;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-md px-2.5 py-2 text-sm font-medium transition-colors",
                      active
                        ? "bg-slate-900 text-white"
                        : "text-slate-500 hover:bg-slate-100 hover:text-slate-900",
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </details>
      </nav>
    </aside>
  );
}
