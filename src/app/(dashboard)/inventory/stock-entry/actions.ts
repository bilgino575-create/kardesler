"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

export async function bulkUpdateStock(categoryId: string, formData: FormData) {
  const productIds = formData.getAll("productId").map(String);

  const updates = productIds.map((id) => {
    const stock = Number(formData.get(`stock__${id}`) ?? 0);
    const price = Number(formData.get(`price__${id}`) ?? 0);
    return {
      id,
      stock: Number.isFinite(stock) && stock >= 0 ? Math.round(stock) : 0,
      salePrice: Number.isFinite(price) && price >= 0 ? price : 0,
    };
  });

  await prisma.$transaction(
    updates.map((update) =>
      prisma.product.update({
        where: { id: update.id },
        data: { stock: update.stock, salePrice: update.salePrice },
      }),
    ),
  );

  revalidatePath("/inventory/stock-entry");
  revalidatePath("/inventory");
  revalidatePath("/");
  redirect(`/inventory/stock-entry?saved=${categoryId}`);
}
