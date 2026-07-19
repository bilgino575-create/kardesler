"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";

export async function createPermission(formData: FormData) {
  const key = String(formData.get("key") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();

  if (!key) {
    redirect(`/permissions?error=${encodeURIComponent("İzin anahtarı zorunlu.")}`);
  }

  try {
    await prisma.permission.create({
      data: { key, description: description || undefined },
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      redirect(`/permissions?error=${encodeURIComponent("Bu izin anahtarı zaten mevcut.")}`);
    }
    throw error;
  }

  revalidatePath("/permissions");
  redirect("/permissions");
}

export async function deletePermission(id: string) {
  // RolePermission rows cascade-delete automatically (see schema onDelete: Cascade).
  await prisma.permission.delete({ where: { id } });
  revalidatePath("/permissions");
}
