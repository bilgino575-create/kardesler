import { Bell } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getCurrentAppUser } from "@/lib/current-user";
import { markNotificationRead, markAllNotificationsRead } from "./actions";

export const dynamic = "force-dynamic";

const dateFormatter = new Intl.DateTimeFormat("tr-TR", {
  dateStyle: "short",
  timeStyle: "short",
});

export default async function NotificationsPage() {
  const user = await getCurrentAppUser();
  const notifications = user
    ? await prisma.notification.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
        take: 100,
      })
    : [];

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">
            Bildirimler
          </h1>
          <p className="text-sm text-slate-500">
            {unreadCount > 0 ? `${unreadCount} okunmamış` : "Tümü okundu"}
          </p>
        </div>
        {unreadCount > 0 && (
          <form action={markAllNotificationsRead}>
            <button
              type="submit"
              className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Tümünü Okundu İşaretle
            </button>
          </form>
        )}
      </div>

      <div className="divide-y divide-slate-100 rounded-lg border border-slate-200 bg-white">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={`flex items-start gap-3 px-4 py-3 ${
              notification.read ? "" : "bg-slate-50"
            }`}
          >
            <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-100">
              <Bell className="h-4 w-4 text-amber-700" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-slate-900">
                {notification.title}
              </p>
              <p className="text-sm text-slate-600">{notification.message}</p>
              <p className="mt-1 text-xs text-slate-400">
                {dateFormatter.format(notification.createdAt)}
              </p>
            </div>
            {!notification.read && (
              <form action={markNotificationRead.bind(null, notification.id)}>
                <button
                  type="submit"
                  className="text-xs font-medium text-slate-500 hover:text-slate-900"
                >
                  Okundu İşaretle
                </button>
              </form>
            )}
          </div>
        ))}
        {notifications.length === 0 && (
          <p className="px-4 py-10 text-center text-sm text-slate-400">
            Bildirim yok.
          </p>
        )}
      </div>
    </div>
  );
}
