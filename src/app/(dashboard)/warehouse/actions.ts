"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

export async function createWarehouse(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const location = String(formData.get("location") ?? "").trim();

  if (!name) {
    redirect(`/warehouse?error=${encodeURIComponent("Depo adı zorunlu.")}`);
  }

  await prisma.warehouse.create({ data: { name, location: location || undefined } });
  revalidatePath("/warehouse");
  redirect("/warehouse");
}

export async function createShelf(formData: FormData) {
  const warehouseId = String(formData.get("warehouseId") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  const number = String(formData.get("number") ?? "").trim();

  if (!warehouseId || !name) {
    redirect(`/warehouse?error=${encodeURIComponent("Depo ve raf adı zorunlu.")}`);
  }

  await prisma.shelf.create({
    data: { warehouseId, name, number: number || undefined },
  });
  revalidatePath("/warehouse");
  redirect("/warehouse");
}

export async function transferProduct(formData: FormData) {
  const productId = String(formData.get("productId") ?? "").trim();
  const warehouseId = String(formData.get("warehouseId") ?? "").trim();
  const shelfId = String(formData.get("shelfId") ?? "").trim();

  if (!productId || !warehouseId) {
    redirect(`/warehouse?error=${encodeURIComponent("Ürün ve hedef depo seçin.")}`);
  }

  await prisma.$transaction(async (tx) => {
    const product = await tx.product.findUniqueOrThrow({ where: { id: productId } });

    await tx.product.update({
      where: { id: productId },
      data: { warehouseId, shelfId: shelfId || null },
    });

    await tx.stockMovement.create({
      data: {
        productId,
        type: "TRANSFER",
        quantity: product.stock,
        note: `Depo transferi (${product.warehouseId ?? "—"} → ${warehouseId})`,
      },
    });
  });

  revalidatePath("/warehouse");
  revalidatePath("/inventory");
  redirect("/warehouse");
}
