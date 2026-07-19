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

export async function createCustomer(formData: FormData) {
  const parsed = parse(formData);
  if (!parsed.success) {
    redirect(
      `/customers/new?error=${encodeURIComponent(parsed.error.issues[0].message)}`,
    );
  }

  await prisma.customer.create({ data: parsed.data });
  revalidatePath("/customers");
  redirect("/customers");
}

export async function updateCustomer(id: string, formData: FormData) {
  const parsed = parse(formData);
  if (!parsed.success) {
    redirect(
      `/customers/${id}/edit?error=${encodeURIComponent(parsed.error.issues[0].message)}`,
    );
  }

  await prisma.customer.update({ where: { id }, data: parsed.data });
  revalidatePath("/customers");
  redirect("/customers");
}

export async function deleteCustomer(id: string) {
  try {
    await prisma.customer.delete({ where: { id } });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2003"
    ) {
      redirect(
        `/customers?error=${encodeURIComponent("Bu müşteriye bağlı satış/fatura kayıtları var, silinemez.")}`,
      );
    }
    throw error;
  }
  revalidatePath("/customers");
}
