import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { ProductForm } from "@/components/inventory/product-form";
import { prisma } from "@/lib/prisma";
import { updateProduct } from "../../actions";
import { getProductFormOptions } from "../../data";

export const dynamic = "force-dynamic";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [product, { categories, warehouses, brandNames }] = await Promise.all(
    [
      prisma.product.findUnique({
        where: { id },
        include: { brand: true },
      }),
      getProductFormOptions(),
    ],
  );

  if (!product) {
    notFound();
  }

  const boundUpdateProduct = updateProduct.bind(null, product.id);

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
          Ürünü Düzenle
        </h1>
        <p className="text-sm text-slate-500">{product.name}</p>
      </div>

      <ProductForm
        action={boundUpdateProduct}
        categories={categories}
        warehouses={warehouses}
        brandNames={brandNames}
        isEdit
        submitLabel="Değişiklikleri Kaydet"
        defaults={{
          name: product.name,
          categoryId: product.categoryId,
          brand: product.brand?.name,
          barcode: product.barcode,
          sku: product.sku,
          productCode: product.productCode,
          purchasePrice: product.purchasePrice.toString(),
          salePrice: product.salePrice.toString(),
          wholesalePrice: product.wholesalePrice.toString(),
          vat: product.vat.toString(),
          stock: product.stock,
          minimumStock: product.minimumStock,
          unit: product.unit,
          warehouseId: product.warehouseId,
          status: product.status,
          description: product.description,
        }}
      />
    </div>
  );
}
