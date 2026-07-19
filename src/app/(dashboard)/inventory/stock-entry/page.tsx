import { CheckCircle2 } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { bulkUpdateStock } from "./actions";

export const dynamic = "force-dynamic";

export default async function StockEntryPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string }>;
}) {
  const { saved } = await searchParams;

  const products = await prisma.product.findMany({
    include: { category: { include: { parent: true } } },
    orderBy: [{ category: { name: "asc" } }, { name: "asc" }],
  });

  const groups = new Map<
    string,
    { categoryId: string; name: string; products: typeof products }
  >();

  for (const product of products) {
    const groupCategory = product.category.parent ?? product.category;
    const existing = groups.get(groupCategory.id);
    if (existing) {
      existing.products.push(product);
    } else {
      groups.set(groupCategory.id, {
        categoryId: groupCategory.id,
        name: groupCategory.name,
        products: [product],
      });
    }
  }

  const missingCount = products.filter(
    (p) => p.stock === 0 && Number(p.salePrice) === 0,
  ).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">
          Hızlı Stok ve Fiyat Girişi
        </h1>
        <p className="text-sm text-slate-500">
          Her ürünün karşısına elinizdeki adedi ve satış fiyatını yazın,
          kategorinin altındaki &quot;Kaydet&quot; butonuna basın. Tek tek
          ürün açmanıza gerek yok.
        </p>
        {missingCount > 0 && (
          <p className="mt-2 inline-flex rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-800">
            {missingCount} üründe henüz stok/fiyat girilmemiş
          </p>
        )}
      </div>

      <div className="space-y-6">
        {Array.from(groups.values()).map((group) => (
          <div
            key={group.categoryId}
            className="rounded-lg border border-slate-200 bg-white"
          >
            <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
              <h2 className="text-sm font-semibold text-slate-900">
                {group.name}
              </h2>
              {saved === group.categoryId && (
                <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600">
                  <CheckCircle2 className="h-4 w-4" />
                  Kaydedildi
                </span>
              )}
            </div>

            <form action={bulkUpdateStock.bind(null, group.categoryId)}>
              <div className="divide-y divide-slate-100">
                {group.products.map((product) => (
                  <div
                    key={product.id}
                    className="flex flex-wrap items-center gap-3 px-4 py-3"
                  >
                    <input type="hidden" name="productId" value={product.id} />
                    <span className="min-w-48 flex-1 text-sm text-slate-900">
                      {product.name}
                    </span>
                    <label className="flex items-center gap-2 text-sm">
                      <span className="text-slate-500">Stok</span>
                      <input
                        type="number"
                        inputMode="numeric"
                        min="0"
                        step="1"
                        name={`stock__${product.id}`}
                        defaultValue={product.stock}
                        className="w-20 rounded-md border border-slate-300 px-2 py-1.5 text-right text-sm"
                      />
                    </label>
                    <label className="flex items-center gap-2 text-sm">
                      <span className="text-slate-500">Fiyat (₺)</span>
                      <input
                        type="number"
                        inputMode="decimal"
                        min="0"
                        step="0.01"
                        name={`price__${product.id}`}
                        defaultValue={Number(product.salePrice)}
                        className="w-24 rounded-md border border-slate-300 px-2 py-1.5 text-right text-sm"
                      />
                    </label>
                  </div>
                ))}
              </div>
              <div className="border-t border-slate-200 px-4 py-3">
                <button
                  type="submit"
                  className="rounded-md bg-slate-900 px-5 py-2 text-sm font-semibold text-white hover:bg-slate-800"
                >
                  {group.name} — Kaydet
                </button>
              </div>
            </form>
          </div>
        ))}
      </div>
    </div>
  );
}
