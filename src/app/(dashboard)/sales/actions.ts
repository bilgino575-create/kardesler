"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentAppUser } from "@/lib/current-user";
import { logAudit } from "@/lib/audit-log";
import {
  completeSaleSchema,
  type CompleteSaleInput,
  type CompleteSaleResult,
} from "@/lib/validation/sale";

const round2 = (value: number) => Math.round(value * 100) / 100;

export async function completeSale(
  input: CompleteSaleInput,
): Promise<CompleteSaleResult> {
  const parsed = completeSaleSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Geçersiz veri." };
  }
  const data = parsed.data;

  const user = await getCurrentAppUser();
  if (!user) {
    return {
      success: false,
      error: "Satışı kaydedecek bir kullanıcı bulunamadı. Önce seed'i çalıştırın.",
    };
  }

  try {
    const saleNumber = await prisma.$transaction(async (tx) => {
      const productIds = data.items.map((item) => item.productId);
      const products = await tx.product.findMany({
        where: { id: { in: productIds } },
      });

      const productMap = new Map(products.map((product) => [product.id, product]));

      let subtotal = 0;
      let vatTotal = 0;
      const itemsToCreate: {
        productId: string;
        quantity: number;
        unitPrice: number;
        vat: number;
        total: number;
      }[] = [];

      for (const item of data.items) {
        const product = productMap.get(item.productId);
        if (!product) {
          throw new Error(`Ürün bulunamadı: ${item.productId}`);
        }
        if (product.stock < item.quantity) {
          throw new Error(
            `"${product.name}" için yeterli stok yok (mevcut: ${product.stock}).`,
          );
        }

        const unitPrice = Number(product.salePrice);
        const vat = Number(product.vat);
        const lineTotal = round2(unitPrice * item.quantity);

        subtotal = round2(subtotal + lineTotal);
        vatTotal = round2(vatTotal + round2((lineTotal * vat) / (100 + vat)));

        itemsToCreate.push({
          productId: product.id,
          quantity: item.quantity,
          unitPrice,
          vat,
          total: lineTotal,
        });
      }

      const discount = round2(Math.min(data.discount, subtotal));
      const total = round2(subtotal - discount);

      const sequence = (await tx.sale.count()) + 1;
      const saleNumber = `SAT-${String(sequence).padStart(6, "0")}`;

      const sale = await tx.sale.create({
        data: {
          saleNumber,
          userId: user.id,
          customerId: data.customerId || undefined,
          subtotal,
          discount,
          vatTotal,
          total,
          paymentMethod: data.paymentMethod,
          status: "COMPLETED",
          items: {
            create: itemsToCreate,
          },
        },
      });

      const lowStockProductIds: string[] = [];

      for (const item of itemsToCreate) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
        await tx.stockMovement.create({
          data: {
            productId: item.productId,
            type: "SALE_OUT",
            quantity: -item.quantity,
            note: `Satış #${sale.saleNumber}`,
          },
        });

        const product = productMap.get(item.productId)!;
        const newStock = product.stock - item.quantity;
        if (newStock <= product.minimumStock) {
          lowStockProductIds.push(item.productId);
        }
      }

      if (lowStockProductIds.length > 0) {
        const admins = await tx.user.findMany({
          where: { role: { name: "Super Admin" } },
        });
        const lowStockProducts = await tx.product.findMany({
          where: { id: { in: lowStockProductIds } },
        });
        for (const admin of admins) {
          for (const product of lowStockProducts) {
            await tx.notification.create({
              data: {
                userId: admin.id,
                title: "Kritik Stok Uyarısı",
                message: `"${product.name}" ürününün stoğu ${product.stock} adete düştü (min: ${product.minimumStock}).`,
              },
            });
          }
        }
      }

      return sale.saleNumber;
    });

    revalidatePath("/sales");
    revalidatePath("/inventory");
    await logAudit("complete", "Sale", undefined, { saleNumber });

    return { success: true, saleNumber };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Satış tamamlanamadı.";
    return { success: false, error: message };
  }
}
