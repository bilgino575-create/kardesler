import { prisma } from "@/lib/prisma";

export async function getPurchaseFormData() {
  const [products, suppliers] = await Promise.all([
    prisma.product.findMany({
      where: { status: "ACTIVE" },
      select: {
        id: true,
        name: true,
        sku: true,
        barcode: true,
        purchasePrice: true,
      },
      orderBy: { name: "asc" },
    }),
    prisma.supplier.findMany({ orderBy: { name: "asc" } }),
  ]);

  return {
    products: products.map((product) => ({
      id: product.id,
      name: product.name,
      sku: product.sku,
      barcode: product.barcode,
      purchasePrice: Number(product.purchasePrice),
    })),
    suppliers: suppliers.map((supplier) => ({
      id: supplier.id,
      name: supplier.name,
    })),
  };
}
