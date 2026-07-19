import Link from "next/link";
import { ArrowLeft, TrendingUp } from "lucide-react";
import { getProductFormOptions } from "../data";
import { applyBulkPriceChange } from "./actions";

export const dynamic = "force-dynamic";

export default async function BulkPricePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; success?: string }>;
}) {
  const { error, success } = await searchParams;
  const { categories } = await getProductFormOptions();

  const groupedCategories = categories.reduce<
    Record<string, typeof categories>
  >((acc, category) => {
    acc[category.parentName] ??= [];
    acc[category.parentName].push(category);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/inventory"
          className="mb-2 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Envantere dön
        </Link>
        <h1 className="text-2xl font-semibold text-slate-900">
          Toplu Zam / İndirim
        </h1>
        <p className="text-sm text-slate-500">
          Sigara ve tütün fiyatları toptan değiştiğinde, tek tek ürün açmadan
          tüm kategoriye aynı anda zam uygulayın.
        </p>
      </div>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}
      {success && (
        <div className="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {success} üründe fiyat güncellendi.
        </div>
      )}

      <form
        action={applyBulkPriceChange}
        className="max-w-lg space-y-4 rounded-lg border border-slate-200 bg-white p-6"
      >
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
          <TrendingUp className="h-4 w-4" />
          Fiyat Güncelleme
        </div>

        <label className="block text-sm">
          <span className="mb-1 block font-medium text-slate-700">
            Hangi ürünler?
          </span>
          <select name="categoryId" required className="input">
            <option value="ALL">Tüm Ürünler</option>
            {Object.entries(groupedCategories).map(([parentName, items]) => (
              <optgroup key={parentName} label={parentName}>
                {items.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </label>

        <label className="block text-sm">
          <span className="mb-1 block font-medium text-slate-700">
            Yüzde Değişim (%)
          </span>
          <input
            type="number"
            name="percent"
            step="0.1"
            placeholder="Örn. zam için 10, indirim için -10"
            required
            className="input"
          />
          <span className="mt-1 block text-xs text-slate-400">
            Zam için pozitif (10), indirim için negatif (-10) girin.
          </span>
        </label>

        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input type="checkbox" name="roundToWhole" className="h-4 w-4 rounded border-slate-300" />
          Fiyatları tam liraya yuvarla
        </label>

        <button
          type="submit"
          className="w-full rounded-md bg-slate-900 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
        >
          Uygula
        </button>
      </form>
    </div>
  );
}
