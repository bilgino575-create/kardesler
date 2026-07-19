import Link from "next/link";
import { Bell, LogOut, Search } from "lucide-react";
import { logout } from "@/app/(dashboard)/actions";
import { prisma } from "@/lib/prisma";
import { getCurrentAppUser } from "@/lib/current-user";
import { MobileSidebar } from "@/components/layout/mobile-sidebar";

async function getUnreadCount() {
  try {
    const user = await getCurrentAppUser();
    if (!user) return 0;
    return prisma.notification.count({ where: { userId: user.id, read: false } });
  } catch {
    return 0;
  }
}

export async function Topbar() {
  const unreadCount = await getUnreadCount();

  return (
    <header className="flex h-16 shrink-0 items-center gap-3 border-b border-slate-200 bg-white px-4 sm:gap-4 sm:px-6 print:hidden">
      <MobileSidebar />

      <div className="relative min-w-0 flex-1 sm:max-w-md">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          type="search"
          placeholder="Ürün, barkod, müşteri ara..."
          className="w-full rounded-md border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:outline-none"
        />
      </div>

      <div className="ml-auto flex items-center gap-2 sm:gap-4">
        <Link
          href="/notifications"
          aria-label="Bildirimler"
          className="relative rounded-md p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold text-white">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Link>
        <div className="flex items-center gap-2 border-l border-slate-200 pl-2 sm:gap-3 sm:pl-4">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-900 text-sm font-semibold text-white">
            SA
          </div>
          <div className="hidden leading-tight sm:block">
            <p className="text-sm font-medium text-slate-900">Super Admin</p>
            <p className="text-xs text-slate-500">Yönetici</p>
          </div>
          <form action={logout}>
            <button
              type="submit"
              aria-label="Çıkış Yap"
              className="rounded-md p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
