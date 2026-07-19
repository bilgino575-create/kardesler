"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentAppUser } from "@/lib/current-user";

export async function openCashSession(formData: FormData) {
  const openingCash = Number(formData.get("openingCash") ?? 0);
  if (!Number.isFinite(openingCash) || openingCash < 0) {
    redirect(`/cash-register?error=${encodeURIComponent("Geçerli bir açılış tutarı girin.")}`);
  }

  const user = await getCurrentAppUser();
  if (!user) {
    redirect(`/cash-register?error=${encodeURIComponent("Kullanıcı bulunamadı.")}`);
  }

  const existingOpen = await prisma.cashSession.findFirst({
    where: { status: "OPEN" },
  });
  if (existingOpen) {
    redirect(`/cash-register?error=${encodeURIComponent("Zaten açık bir kasa oturumu var.")}`);
  }

  await prisma.cashSession.create({
    data: { userId: user.id, openingCash, status: "OPEN" },
  });

  revalidatePath("/cash-register");
  redirect("/cash-register");
}

export async function closeCashSession(sessionId: string, formData: FormData) {
  const closingCash = Number(formData.get("closingCash") ?? 0);
  if (!Number.isFinite(closingCash) || closingCash < 0) {
    redirect(`/cash-register?error=${encodeURIComponent("Geçerli bir kapanış tutarı girin.")}`);
  }

  await prisma.cashSession.update({
    where: { id: sessionId },
    data: { closingCash, status: "CLOSED", closedAt: new Date() },
  });

  revalidatePath("/cash-register");
  redirect("/cash-register");
}
