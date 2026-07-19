import { prisma } from "@/lib/prisma";

export async function getPosData() {
  const [products, customers, topSellers] = await Promise.all([
    prisma.product.findMany({
      where: { status: "ACTIVE" },
      select: {
        id: true,
        name: true,
        barcode: true,
        sku: true,
        salePrice: true,
        vat: true,
        stock: true,
        unit: true,
        category: { select: { name: true } },
      },
      orderBy: { name: "asc" },
    }),
    prisma.customer.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    prisma.saleItem.groupBy({
      by: ["productId"],
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: "desc" } },
      take: 10,
    }),
  ]);

  return {
    products: products.map((product) => ({
      id: product.id,
      name: product.name,
      barcode: product.barcode,
      sku: product.sku,
      salePrice: Number(product.salePrice),
      vat: Number(product.vat),
      stock: product.stock,
      unit: product.unit,
      categoryName: product.category.name,
    })),
    customers,
    favoriteProductIds: topSellers.map((row) => row.productId),
  };
}
