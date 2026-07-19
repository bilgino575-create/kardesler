import { prisma } from "@/lib/prisma";
import { createWarehouse, createShelf, transferProduct } from "./actions";

export const dynamic = "force-dynamic";

export default async function WarehousePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  const [warehouses, products] = await Promise.all([
    prisma.warehouse.findMany({
      include: { _count: { select: { shelves: true, products: true } }, shelves: true },
      orderBy: { name: "asc" },
    }),
    prisma.product.findMany({
      select: { id: true, name: true, sku: true, warehouseId: true },
      orderBy: { name: "asc" },
      take: 200,
    }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Depo Yönetimi</h1>
        <p className="text-sm text-slate-500">Depolar, raflar ve stok transferi</p>
      </div>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          <form
            action={createWarehouse}
            className="flex flex-wrap items-end gap-3 rounded-lg border border-slate-200 bg-white p-4"
          >
            <label className="text-sm">
              <span className="mb-1 block font-medium text-slate-700">Depo Adı</span>
              <input name="name" required className="input w-40" />
            </label>
            <label className="text-sm">
              <span className="mb-1 block font-medium text-slate-700">Konum</span>
              <input name="location" className="input w-40" />
            </label>
            <button
              type="submit"
              className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
            >
              Depo Ekle
            </button>
          </form>

          <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-medium">Depo</th>
                  <th className="px-4 py-3 font-medium">Konum</th>
                  <th className="px-4 py-3 font-medium">Raf</th>
                  <th className="px-4 py-3 font-medium">Ürün</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {warehouses.map((warehouse) => (
                  <tr key={warehouse.id}>
                    <td className="px-4 py-3 font-medium text-slate-900">
                      {warehouse.name}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {warehouse.location ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {warehouse._count.shelves}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {warehouse._count.products}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <form
            action={createShelf}
            className="flex flex-wrap items-end gap-3 rounded-lg border border-slate-200 bg-white p-4"
          >
            <label className="text-sm">
              <span className="mb-1 block font-medium text-slate-700">Depo</span>
              <select name="warehouseId" required className="input w-40">
                <option value="">Seçin</option>
                {warehouses.map((warehouse) => (
                  <option key={warehouse.id} value={warehouse.id}>
                    {warehouse.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-sm">
              <span className="mb-1 block font-medium text-slate-700">Raf Adı</span>
              <input name="name" required className="input w-32" />
            </label>
            <label className="text-sm">
              <span className="mb-1 block font-medium text-slate-700">Raf No</span>
              <input name="number" className="input w-24" />
            </label>
            <button
              type="submit"
              className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Raf Ekle
            </button>
          </form>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <h2 className="mb-3 text-sm font-semibold text-slate-900">
            Stok Transferi
          </h2>
          <form action={transferProduct} className="space-y-3">
            <label className="block text-sm">
              <span className="mb-1 block font-medium text-slate-700">Ürün</span>
              <select name="productId" required className="input">
                <option value="">Ürün seçin</option>
                {products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name} ({product.sku})
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-sm">
              <span className="mb-1 block font-medium text-slate-700">
                Hedef Depo
              </span>
              <select name="warehouseId" required className="input">
                <option value="">Depo seçin</option>
                {warehouses.map((warehouse) => (
                  <option key={warehouse.id} value={warehouse.id}>
                    {warehouse.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-sm">
              <span className="mb-1 block font-medium text-slate-700">
                Hedef Raf (opsiyonel)
              </span>
              <select name="shelfId" className="input">
                <option value="">Raf seçilmedi</option>
                {warehouses.flatMap((warehouse) =>
                  warehouse.shelves.map((shelf) => (
                    <option key={shelf.id} value={shelf.id}>
                      {warehouse.name} / {shelf.name}
                    </option>
                  )),
                )}
              </select>
            </label>
            <button
              type="submit"
              className="w-full rounded-md bg-slate-900 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
            >
              Transfer Et
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
