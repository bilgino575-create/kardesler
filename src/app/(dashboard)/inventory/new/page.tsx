import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ProductForm } from "@/components/inventory/product-form";
import { createProduct } from "../actions";
import { getProductFormOptions } from "../data";

export const dynamic = "force-dynamic";

export default async function NewProductPage() {
  const { categories, warehouses, brandNames } = await getProductFormOptions();

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
        <h1 className="text-2xl font-semibold text-slate-900">Yeni Ürün</h1>
      </div>

      <ProductForm
        action={createProduct}
        categories={categories}
        warehouses={warehouses}
        brandNames={brandNames}
        submitLabel="Ürünü Kaydet"
      />
    </div>
  );
}
