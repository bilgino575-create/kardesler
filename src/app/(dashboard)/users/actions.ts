"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth/password";
import { logAudit } from "@/lib/audit-log";
import { Prisma } from "@/generated/prisma/client";

export async function inviteUser(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const roleId = String(formData.get("roleId") ?? "").trim();

  if (!name || !email) {
    redirect(`/users?error=${encodeURIComponent("Ad ve e-posta zorunlu.")}`);
  }
  if (password.length < 8) {
    redirect(`/users?error=${encodeURIComponent("Şifre en az 8 karakter olmalı.")}`);
  }

  const passwordHash = await hashPassword(password);

  try {
    await prisma.user.create({
      data: { name, email, roleId: roleId || undefined, passwordHash },
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      redirect(`/users?error=${encodeURIComponent("Bu e-posta zaten kayıtlı.")}`);
    }
    throw error;
  }

  revalidatePath("/users");
  redirect("/users?success=1");
}

export async function resetUserPassword(userId: string, formData: FormData) {
  const password = String(formData.get("password") ?? "");
  if (password.length < 8) {
    redirect(`/users?error=${encodeURIComponent("Şifre en az 8 karakter olmalı.")}`);
  }

  const passwordHash = await hashPassword(password);
  await prisma.user.update({ where: { id: userId }, data: { passwordHash } });
  await logAudit("password-reset", "User", userId);
  revalidatePath("/users");
  redirect("/users?success=1");
}

export async function setUserStatus(
  userId: string,
  status: "ACTIVE" | "INACTIVE" | "SUSPENDED",
) {
  await prisma.user.update({ where: { id: userId }, data: { status } });
  await logAudit("status-change", "User", userId, { status });
  revalidatePath("/users");
}

export async function updateUserRole(userId: string, formData: FormData) {
  const roleId = String(formData.get("roleId") ?? "").trim();
  await prisma.user.update({
    where: { id: userId },
    data: { roleId: roleId || null },
  });
  revalidatePath("/users");
}
