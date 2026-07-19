"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

export async function createIncome(formData: FormData) {
  const category = String(formData.get("category") ?? "").trim();
  const amount = Number(formData.get("amount") ?? 0);
  const description = String(formData.get("description") ?? "").trim();

  if (!category || !Number.isFinite(amount) || amount <= 0) {
    redirect(`/income?error=${encodeURIComponent("Kategori ve geçerli bir tutar girin.")}`);
  }

  await prisma.income.create({
    data: { category, amount, description: description || undefined },
  });

  revalidatePath("/income");
  redirect("/income");
}

export async function deleteIncome(id: string) {
  await prisma.income.delete({ where: { id } });
  revalidatePath("/income");
}
