"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Cigarette, ChevronDown } from "lucide-react";
import { primaryNavSections, advancedNavSection } from "@/lib/nav-config";
import { cn } from "@/lib/utils";

export function MobileSidebar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Close the drawer when navigation changes the route. Adjusted during
  // render (not an effect) per https://react.dev/learn/you-might-not-need-an-effect
  const [lastPathname, setLastPathname] = useState(pathname);
  if (pathname !== lastPathname) {
    setLastPathname(pathname);
    setOpen(false);
  }

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  const advancedActive = advancedNavSection.items.some((item) =>
    isActive(item.href),
  );

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Menüyü aç"
        className="rounded-md p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
      >
        <Menu className="h-5 w-5" />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setOpen(false)}
          />
          <aside className="absolute inset-y-0 left-0 flex w-72 max-w-[85vw] flex-col bg-white shadow-xl">
            <div className="flex h-16 items-center justify-between gap-2 border-b border-slate-200 px-5">
              <div className="flex items-center gap-2">
                <Cigarette className="h-6 w-6 text-slate-900" />
                <div className="leading-tight">
                  <p className="text-sm font-semibold text-slate-900">
                    İkizler
                  </p>
                  <p className="text-xs text-slate-500">Tobacco ERP</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Menüyü kapat"
                className="rounded-md p-2 text-slate-500 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
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
                              "flex items-center gap-3 rounded-md px-2.5 py-2.5 text-sm font-medium transition-colors",
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
                <summary className="mb-2 flex cursor-pointer list-none items-center gap-1 px-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
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
                            "flex items-center gap-3 rounded-md px-2.5 py-2.5 text-sm font-medium transition-colors",
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
        </div>
      )}
    </>
  );
}
