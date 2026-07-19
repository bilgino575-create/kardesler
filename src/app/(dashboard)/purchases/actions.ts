"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentAppUser } from "@/lib/current-user";
import { logAudit } from "@/lib/audit-log";
import {
  createPurchaseSchema,
  type CreatePurchaseInput,
  type CreatePurchaseResult,
} from "@/lib/validation/purchase";

const round2 = (value: number) => Math.round(value * 100) / 100;

export async function createPurchase(
  input: CreatePurchaseInput,
): Promise<CreatePurchaseResult> {
  const parsed = createPurchaseSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Geçersiz veri." };
  }
  const data = parsed.data;

  const user = await getCurrentAppUser();
  if (!user) {
    return { success: false, error: "İşlemi kaydedecek bir kullanıcı bulunamadı." };
  }

  const products = await prisma.product.findMany({
    where: { id: { in: data.items.map((item) => item.productId) } },
  });
  const productMap = new Map(products.map((product) => [product.id, product]));

  let subtotal = 0;
  let vatTotal = 0;
  const itemsToCreate = data.items.map((item) => {
    const product = productMap.get(item.productId);
    if (!product) throw new Error(`Ürün bulunamadı: ${item.productId}`);
    const total = round2(item.unitCost * item.quantity);
    subtotal = round2(subtotal + total);
    vatTotal = round2(vatTotal + round2((total * Number(product.vat)) / (100 + Number(product.vat))));
    return {
      productId: item.productId,
      quantity: item.quantity,
      unitCost: item.unitCost,
      total,
    };
  });

  const sequence = (await prisma.purchase.count()) + 1;
  const purchaseNumber = `SA-${String(sequence).padStart(6, "0")}`;

  await prisma.purchase.create({
    data: {
      purchaseNumber,
      supplierId: data.supplierId,
      userId: user.id,
      subtotal,
      vatTotal,
      total: round2(subtotal),
      status: "PENDING",
      items: { create: itemsToCreate },
    },
  });

  revalidatePath("/purchases");
  return { success: true, purchaseNumber };
}

export async function receivePurchase(purchaseId: string) {
  await prisma.$transaction(async (tx) => {
    const purchase = await tx.purchase.findUnique({
      where: { id: purchaseId },
      include: { items: true },
    });
    if (!purchase || purchase.status !== "PENDING") return;

    for (const item of purchase.items) {
      await tx.product.update({
        where: { id: item.productId },
        data: { stock: { increment: item.quantity } },
      });
      await tx.stockMovement.create({
        data: {
          productId: item.productId,
          type: "PURCHASE_IN",
          quantity: item.quantity,
          note: `Satın alma #${purchase.purchaseNumber}`,
        },
      });
    }

    await tx.purchase.update({
      where: { id: purchaseId },
      data: { status: "RECEIVED" },
    });
  });

  revalidatePath("/purchases");
  revalidatePath("/inventory");
  await logAudit("receive", "Purchase", purchaseId);
}

export async function cancelPurchase(purchaseId: string) {
  await prisma.purchase.updateMany({
    where: { id: purchaseId, status: "PENDING" },
    data: { status: "CANCELLED" },
  });
  revalidatePath("/purchases");
}
