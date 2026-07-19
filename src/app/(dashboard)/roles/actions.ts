"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { logAudit } from "@/lib/audit-log";
import { Prisma } from "@/generated/prisma/client";

export async function createRole(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();

  if (!name) {
    redirect(`/roles?error=${encodeURIComponent("Rol adı zorunlu.")}`);
  }

  try {
    await prisma.role.create({ data: { name, description: description || undefined } });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      redirect(`/roles?error=${encodeURIComponent("Bu rol adı zaten mevcut.")}`);
    }
    throw error;
  }

  revalidatePath("/roles");
  redirect("/roles");
}

export async function deleteRole(id: string) {
  try {
    await prisma.role.delete({ where: { id } });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2003"
    ) {
      redirect(`/roles?error=${encodeURIComponent("Bu role atanmış kullanıcılar var, önce onları başka bir role taşıyın.")}`);
    }
    throw error;
  }
  revalidatePath("/roles");
}

export async function toggleRolePermission(
  roleId: string,
  permissionId: string,
  shouldGrant: boolean,
) {
  if (shouldGrant) {
    await prisma.rolePermission.upsert({
      where: { roleId_permissionId: { roleId, permissionId } },
      update: {},
      create: { roleId, permissionId },
    });
  } else {
    await prisma.rolePermission.delete({
      where: { roleId_permissionId: { roleId, permissionId } },
    });
  }
  await logAudit(shouldGrant ? "grant-permission" : "revoke-permission", "Role", roleId, {
    permissionId,
  });
  revalidatePath(`/roles/${roleId}`);
}
