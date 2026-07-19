"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { partnerSchema } from "@/lib/validation/partner";
import { Prisma } from "@/generated/prisma/client";

function parse(formData: FormData) {
  return partnerSchema.safeParse({
    name: formData.get("name"),
    phone: formData.get("phone"),
    email: formData.get("email"),
    address: formData.get("address"),
    taxNumber: formData.get("taxNumber"),
  });
}

export async function createSupplier(formData: FormData) {
  const parsed = parse(formData);
  if (!parsed.success) {
    redirect(
      `/suppliers/new?error=${encodeURIComponent(parsed.error.issues[0].message)}`,
    );
  }

  await prisma.supplier.create({ data: parsed.data });
  revalidatePath("/suppliers");
  redirect("/suppliers");
}

export async function updateSupplier(id: string, formData: FormData) {
  const parsed = parse(formData);
  if (!parsed.success) {
    redirect(
      `/suppliers/${id}/edit?error=${encodeURIComponent(parsed.error.issues[0].message)}`,
    );
  }

  await prisma.supplier.update({ where: { id }, data: parsed.data });
  revalidatePath("/suppliers");
  redirect("/suppliers");
}

export async function deleteSupplier(id: string) {
  try {
    await prisma.supplier.delete({ where: { id } });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2003"
    ) {
      redirect(
        `/suppliers?error=${encodeURIComponent("Bu tedarikçiye bağlı satın alma kayıtları var, silinemez.")}`,
      );
    }
    throw error;
  }
  revalidatePath("/suppliers");
}
