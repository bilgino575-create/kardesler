"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

export async function createExpense(formData: FormData) {
  const category = String(formData.get("category") ?? "").trim();
  const amount = Number(formData.get("amount") ?? 0);
  const description = String(formData.get("description") ?? "").trim();

  if (!category || !Number.isFinite(amount) || amount <= 0) {
    redirect(`/expenses?error=${encodeURIComponent("Kategori ve geçerli bir tutar girin.")}`);
  }

  await prisma.expense.create({
    data: { category, amount, description: description || undefined },
  });

  revalidatePath("/expenses");
  redirect("/expenses");
}

export async function deleteExpense(id: string) {
  await prisma.expense.delete({ where: { id } });
  revalidatePath("/expenses");
}
