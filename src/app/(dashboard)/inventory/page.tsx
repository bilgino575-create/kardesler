import Link from "next/link";
import { Plus, Search } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { productStatusLabels } from "@/lib/validation/product";
import { getProductFormOptions } from "./data";
import { setProductStatus } from "./actions";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 25;

type SearchParams = {
  q?: string;
  categoryId?: string;
  status?: string;
  page?: string;
};

function buildQuery(params: SearchParams, overrides: Partial<SearchParams>) {
  const merged = { ...params, ...overrides };
  const query = new URLSearchParams();
  if (merged.q) query.set("q", merged.q);
  if (merged.categoryId) query.set("categoryId", merged.categoryId);
  if (merged.status) query.set("status", merged.status);
  if (merged.page) query.set("page", merged.page);
  return query.toString();
}

export default async function InventoryPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page ?? "1") || 1);

  let products: Awaited<ReturnType<typeof loadProducts>>["products"] = [];
  let total = 0;
  let dbConnected = true;

  async function loadProducts() {
    const where = {
      AND: [
        params.q
          ? {
              OR: [
                { name: { contains: params.q, mode: "insensitive" as const } },
                { barcode: { contains: params.q, mode: "insensitive" as const } },
                { sku: { contains: params.q, mode: "insensitive" as const } },
                {
                  productCode: {
                    contains: params.q,
                    mode: "insensitive" as const,
                  },
                },
              ],
            }
          : {},
        params.categoryId ? { categoryId: params.categoryId } : {},
        params.status ? { status: params.status as never } : {},
      ],
    };

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: { category: true, brand: true },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * PAGE_SIZE,
        take: PAGE_SIZE,
      }),
      prisma.product.count({ where }),
    ]);

    return { products, total };
  }

  let categories: Awaited<ReturnType<typeof getProductFormOptions>>["categories"] =
    [];

  try {
    const [result, options] = await Promise.all([
      loadProducts(),
      getProductFormOptions(),
    ]);
    products = result.products;
    total = result.total;
    categories = options.categories;
  } catch {
    dbConnected = false;
  }

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Envanter</h1>
          <p className="text-sm text-slate-500">
            {dbConnected ? `${total} ürün` : "Veritabanına bağlanılamadı"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/inventory/bulk-price"
            className="inline-flex items-center gap-2 rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Toplu Zam
          </Link>
          <Link
            href="/inventory/stock-entry"
            className="inline-flex items-center gap-2 rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Hızlı Stok Girişi
          </Link>
          <Link
            href="/inventory/new"
            className="inline-flex items-center gap-2 rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
          >
            <Plus className="h-4 w-4" />
            Yeni Ürün
          </Link>
        </div>
      </div>

      {!dbConnected && (
        <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Veritabanına bağlanılamadı. <code>.env</code> dosyasındaki{" "}
          <code>DATABASE_URL</code> değerini kontrol edin.
        </div>
      )}

      <form
        method="get"
        className="flex flex-wrap items-end gap-3 rounded-lg border border-slate-200 bg-white p-4"
      >
        <div className="min-w-48 flex-1">
          <label className="mb-1 block text-xs font-medium text-slate-500">
            Ara
          </label>
          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              name="q"
              defaultValue={params.q}
              placeholder="Ürün adı, barkod, SKU..."
              className="w-full rounded-md border border-slate-300 py-2 pl-8 pr-3 text-sm focus:border-slate-500 focus:outline-none"
            />
          </div>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-500">
            Kategori
          </label>
          <select
            name="categoryId"
            defaultValue={params.categoryId ?? ""}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
          >
            <option value="">Tümü</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.parentName} / {category.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-500">
            Durum
          </label>
          <select
            name="status"
            defaultValue={params.status ?? ""}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
          >
            <option value="">Tümü</option>
            {Object.entries(productStatusLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Filtrele
        </button>
      </form>

      <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3 font-medium">Ürün</th>
              <th className="px-4 py-3 font-medium">Kategori</th>
              <th className="px-4 py-3 font-medium">Marka</th>
              <th className="px-4 py-3 font-medium">Stok</th>
              <th className="px-4 py-3 font-medium">Satış Fiyatı</th>
              <th className="px-4 py-3 font-medium">Durum</th>
              <th className="px-4 py-3 font-medium text-right">Aksiyon</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {products.map((product) => {
              const lowStock = product.stock <= product.minimumStock;
              return (
                <tr key={product.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <p className="font-medium text-slate-900">
                      {product.name}
                    </p>
                    <p className="text-xs text-slate-400">
                      {product.barcode ?? product.sku}
                    </p>
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {product.category.name}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {product.brand?.name ?? "—"}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={
                        lowStock
                          ? "font-medium text-red-600"
                          : "text-slate-700"
                      }
                    >
                      {product.stock}
                    </span>
                    <span className="text-slate-400"> / min {product.minimumStock}</span>
                  </td>
                  <td className="px-4 py-3 text-slate-700">
                    {Number(product.salePrice).toLocaleString("tr-TR", {
                      style: "currency",
                      currency: "TRY",
                    })}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={product.status} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/inventory/${product.id}/edit`}
                        className="text-sm font-medium text-slate-600 hover:text-slate-900"
                      >
                        Düzenle
                      </Link>
                      <form
                        action={setProductStatus.bind(
                          null,
                          product.id,
                          product.status === "ACTIVE" ? "INACTIVE" : "ACTIVE",
                        )}
                      >
                        <button
                          type="submit"
                          className="text-sm font-medium text-slate-500 hover:text-slate-900"
                        >
                          {product.status === "ACTIVE"
                            ? "Pasifleştir"
                            : "Aktifleştir"}
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              );
            })}
            {products.length === 0 && dbConnected && (
              <tr>
                <td
                  colSpan={7}
                  className="px-4 py-10 text-center text-sm text-slate-400"
                >
                  Ürün bulunamadı.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-slate-500">
          <span>
            Sayfa {page} / {totalPages}
          </span>
          <div className="flex gap-2">
            <Link
              href={`/inventory?${buildQuery(params, { page: String(Math.max(1, page - 1)) })}`}
              aria-disabled={page <= 1}
              className={`rounded-md border border-slate-300 px-3 py-1.5 ${
                page <= 1
                  ? "pointer-events-none opacity-40"
                  : "hover:bg-slate-50"
              }`}
            >
              Önceki
            </Link>
            <Link
              href={`/inventory?${buildQuery(params, { page: String(Math.min(totalPages, page + 1)) })}`}
              aria-disabled={page >= totalPages}
              className={`rounded-md border border-slate-300 px-3 py-1.5 ${
                page >= totalPages
                  ? "pointer-events-none opacity-40"
                  : "hover:bg-slate-50"
              }`}
            >
              Sonraki
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: keyof typeof productStatusLabels }) {
  const styles: Record<string, string> = {
    ACTIVE: "bg-emerald-100 text-emerald-800",
    INACTIVE: "bg-slate-100 text-slate-600",
    DISCONTINUED: "bg-red-100 text-red-700",
  };
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${styles[status]}`}
    >
      {productStatusLabels[status]}
    </span>
  );
}
