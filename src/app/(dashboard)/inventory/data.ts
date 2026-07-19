import { prisma } from "@/lib/prisma";

export async function getProductFormOptions() {
  const [categories, warehouses, brands] = await Promise.all([
    prisma.category.findMany({
      where: { parentId: { not: null } },
      include: { parent: true },
      orderBy: [{ parent: { name: "asc" } }, { name: "asc" }],
    }),
    prisma.warehouse.findMany({ orderBy: { name: "asc" } }),
    prisma.brand.findMany({ orderBy: { name: "asc" }, select: { name: true } }),
  ]);

  return {
    categories: categories.map((category) => ({
      id: category.id,
      name: category.name,
      parentName: category.parent?.name ?? "Diğer",
    })),
    warehouses: warehouses.map((warehouse) => ({
      id: warehouse.id,
      name: warehouse.name,
    })),
    brandNames: brands.map((brand) => brand.name),
  };
}
