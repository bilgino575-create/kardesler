"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { logAudit } from "@/lib/audit-log";

export async function returnSale(saleId: string) {
  await prisma.$transaction(async (tx) => {
    const sale = await tx.sale.findUnique({
      where: { id: saleId },
      include: { items: true },
    });
    if (!sale || sale.status !== "COMPLETED") return;

    for (const item of sale.items) {
      await tx.product.update({
        where: { id: item.productId },
        data: { stock: { increment: item.quantity } },
      });
      await tx.stockMovement.create({
        data: {
          productId: item.productId,
          type: "RETURN_IN",
          quantity: item.quantity,
          note: `İade — Satış #${sale.saleNumber}`,
        },
      });
    }

    await tx.sale.update({
      where: { id: saleId },
      data: { status: "RETURNED" },
    });
  });

  revalidatePath("/sales/history");
  revalidatePath("/inventory");
  await logAudit("return", "Sale", saleId);
}
