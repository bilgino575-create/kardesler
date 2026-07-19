"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentAppUser } from "@/lib/current-user";

export async function markNotificationRead(notificationId: string) {
  await prisma.notification.update({
    where: { id: notificationId },
    data: { read: true },
  });
  revalidatePath("/notifications");
}

export async function markAllNotificationsRead() {
  const user = await getCurrentAppUser();
  if (!user) return;
  await prisma.notification.updateMany({
    where: { userId: user.id, read: false },
    data: { read: true },
  });
  revalidatePath("/notifications");
}
