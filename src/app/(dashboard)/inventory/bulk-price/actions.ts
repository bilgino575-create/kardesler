"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { logAudit } from "@/lib/audit-log";

export async function applyBulkPriceChange(formData: FormData) {
  const categoryId = String(formData.get("categoryId") ?? "");
  const percent = Number(formData.get("percent") ?? 0);
  const roundToWhole = formData.get("roundToWhole") === "on";

  if (!Number.isFinite(percent) || percent === 0) {
    redirect(`/inventory/bulk-price?error=${encodeURIComponent("Geçerli bir yüzde girin.")}`);
  }
  if (percent < -90 || percent > 500) {
    redirect(`/inventory/bulk-price?error=${encodeURIComponent("Yüzde -90 ile 500 arasında olmalı.")}`);
  }

  const products = await prisma.product.findMany({
    where: categoryId === "ALL" ? {} : { categoryId },
    select: { id: true, salePrice: true },
  });

  if (products.length === 0) {
    redirect(`/inventory/bulk-price?error=${encodeURIComponent("Bu kategoride ürün bulunamadı.")}`);
  }

  const multiplier = 1 + percent / 100;

  await prisma.$transaction(
    products.map((product) => {
      let newPrice = Number(product.salePrice) * multiplier;
      if (roundToWhole) newPrice = Math.round(newPrice);
      newPrice = Math.max(0, Math.round(newPrice * 100) / 100);
      return prisma.product.update({
        where: { id: product.id },
        data: { salePrice: newPrice },
      });
    }),
  );

  await logAudit("bulk-price-change", "Product", undefined, {
    categoryId,
    percent,
    affected: products.length,
  });

  revalidatePath("/inventory");
  revalidatePath("/inventory/stock-entry");
  redirect(`/inventory/bulk-price?success=${products.length}`);
}
