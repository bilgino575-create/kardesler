"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

export async function saveCompanySettings(formData: FormData) {
  const value = {
    companyName: String(formData.get("companyName") ?? "").trim(),
    phone: String(formData.get("phone") ?? "").trim(),
    address: String(formData.get("address") ?? "").trim(),
    taxNumber: String(formData.get("taxNumber") ?? "").trim(),
    defaultVat: Number(formData.get("defaultVat") ?? 20),
  };

  await prisma.setting.upsert({
    where: { key: "company" },
    update: { value },
    create: { key: "company", value },
  });

  revalidatePath("/settings");
  redirect("/settings?success=1");
}
