"use client";

import { useActionState } from "react";
import Link from "next/link";
import {
  productUnits,
  productUnitLabels,
  productStatuses,
  productStatusLabels,
  type ProductFormState,
  type ProductFormValues,
} from "@/lib/validation/product";

type CategoryOption = {
  id: string;
  name: string;
  parentName: string;
};

type WarehouseOption = {
  id: string;
  name: string;
};

type ProductFormAction = (
  prevState: ProductFormState,
  formData: FormData,
) => Promise<ProductFormState>;

export type ProductFormDefaults = {
  name?: string;
  categoryId?: string;
  brand?: string;
  barcode?: string | null;
  sku?: string;
  productCode?: string;
  purchasePrice?: number | string;
  salePrice?: number | string;
  wholesalePrice?: number | string;
  vat?: number | string;
  stock?: number | string;
  minimumStock?: number | string;
  unit?: string;
  warehouseId?: string | null;
  status?: string;
  description?: string | null;
};

export function ProductForm({
  action,
  categories,
  brandNames,
  warehouses,
  defaults,
  isEdit = false,
  submitLabel,
}: {
  action: ProductFormAction;
  categories: CategoryOption[];
  brandNames: string[];
  warehouses: WarehouseOption[];
  defaults?: ProductFormDefaults;
  isEdit?: boolean;
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState<
    ProductFormState,
    FormData
  >(action, {});

  const fieldError = (name: keyof ProductFormValues) =>
    state.fieldErrors?.[name];

  const groupedCategories = categories.reduce<Record<string, CategoryOption[]>>(
    (acc, category) => {
      acc[category.parentName] ??= [];
      acc[category.parentName].push(category);
      return acc;
    },
    {},
  );

  return (
    <form action={formAction} className="space-y-6">
      {state.error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {state.error}
        </div>
      )}

      <div className="rounded-lg border border-slate-200 bg-white p-6">
        <h2 className="mb-4 text-sm font-semibold text-slate-900">
          Temel Bilgiler
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Ürün Adı" error={fieldError("name")} className="sm:col-span-2">
            <input
              name="name"
              defaultValue={defaults?.name}
              required
              className="input"
            />
          </Field>

          <Field label="Kategori" error={fieldError("categoryId")}>
            <select
              name="categoryId"
              defaultValue={defaults?.categoryId ?? ""}
              required
              className="input"
            >
              <option value="" disabled>
                Kategori seçin
              </option>
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
          </Field>

          <Field label="Marka" error={fieldError("brand")}>
            <input
              name="brand"
              list="brand-options"
              defaultValue={defaults?.brand}
              placeholder="Örn. Winston"
              className="input"
            />
            <datalist id="brand-options">
              {brandNames.map((brand) => (
                <option key={brand} value={brand} />
              ))}
            </datalist>
          </Field>
        </div>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-6">
        <h2 className="mb-4 text-sm font-semibold text-slate-900">
          Tanımlayıcılar
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Field label="Barkod" error={fieldError("barcode")}>
            <input
              name="barcode"
              defaultValue={defaults?.barcode ?? ""}
              placeholder="Otomatik oluşturulacak"
              className="input"
            />
          </Field>

          {isEdit ? (
            <>
              <Field label="SKU">
                <input
                  defaultValue={defaults?.sku}
                  disabled
                  className="input bg-slate-50 text-slate-500"
                />
              </Field>
              <Field label="Ürün Kodu">
                <input
                  defaultValue={defaults?.productCode}
                  disabled
                  className="input bg-slate-50 text-slate-500"
                />
              </Field>
            </>
          ) : (
            <>
              <Field label="SKU" error={fieldError("sku")}>
                <input
                  name="sku"
                  placeholder="Otomatik oluşturulacak"
                  className="input"
                />
              </Field>
              <Field label="Ürün Kodu" error={fieldError("productCode")}>
                <input
                  name="productCode"
                  placeholder="Otomatik oluşturulacak"
                  className="input"
                />
              </Field>
            </>
          )}
        </div>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-6">
        <h2 className="mb-4 text-sm font-semibold text-slate-900">
          Fiyatlandırma
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
          <Field label="Alış Fiyatı (₺)" error={fieldError("purchasePrice")}>
            <input
              type="number"
              step="0.01"
              min="0"
              name="purchasePrice"
              defaultValue={defaults?.purchasePrice ?? 0}
              required
              className="input"
            />
          </Field>
          <Field label="Satış Fiyatı (₺)" error={fieldError("salePrice")}>
            <input
              type="number"
              step="0.01"
              min="0"
              name="salePrice"
              defaultValue={defaults?.salePrice ?? 0}
              required
              className="input"
            />
          </Field>
          <Field label="Toptan Fiyatı (₺)" error={fieldError("wholesalePrice")}>
            <input
              type="number"
              step="0.01"
              min="0"
              name="wholesalePrice"
              defaultValue={defaults?.wholesalePrice ?? 0}
              required
              className="input"
            />
          </Field>
          <Field label="KDV (%)" error={fieldError("vat")}>
            <input
              type="number"
              step="0.01"
              min="0"
              max="100"
              name="vat"
              defaultValue={defaults?.vat ?? 20}
              required
              className="input"
            />
          </Field>
        </div>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-6">
        <h2 className="mb-4 text-sm font-semibold text-slate-900">
          Stok ve Depo
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
          <Field label="Stok" error={fieldError("stock")}>
            <input
              type="number"
              step="1"
              min="0"
              name="stock"
              defaultValue={defaults?.stock ?? 0}
              required
              className="input"
            />
          </Field>
          <Field label="Minimum Stok" error={fieldError("minimumStock")}>
            <input
              type="number"
              step="1"
              min="0"
              name="minimumStock"
              defaultValue={defaults?.minimumStock ?? 5}
              required
              className="input"
            />
          </Field>
          <Field label="Birim" error={fieldError("unit")}>
            <select
              name="unit"
              defaultValue={defaults?.unit ?? "PIECE"}
              className="input"
            >
              {productUnits.map((unit) => (
                <option key={unit} value={unit}>
                  {productUnitLabels[unit]}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Depo" error={fieldError("warehouseId")}>
            <select
              name="warehouseId"
              defaultValue={defaults?.warehouseId ?? ""}
              className="input"
            >
              <option value="">Depo seçilmedi</option>
              {warehouses.map((warehouse) => (
                <option key={warehouse.id} value={warehouse.id}>
                  {warehouse.name}
                </option>
              ))}
            </select>
          </Field>
        </div>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-6">
        <h2 className="mb-4 text-sm font-semibold text-slate-900">Diğer</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Field label="Durum" error={fieldError("status")}>
            <select
              name="status"
              defaultValue={defaults?.status ?? "ACTIVE"}
              className="input"
            >
              {productStatuses.map((status) => (
                <option key={status} value={status}>
                  {productStatusLabels[status]}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Açıklama" className="sm:col-span-2">
            <textarea
              name="description"
              defaultValue={defaults?.description ?? ""}
              rows={2}
              className="input resize-none"
            />
          </Field>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-60"
        >
          {pending ? "Kaydediliyor..." : submitLabel}
        </button>
        <Link
          href="/inventory"
          className="rounded-md border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
        >
          Vazgeç
        </Link>
      </div>
    </form>
  );
}

function Field({
  label,
  error,
  className,
  children,
}: {
  label: string;
  error?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <label className={`block text-sm ${className ?? ""}`}>
      <span className="mb-1 block font-medium text-slate-700">{label}</span>
      {children}
      {error && <span className="mt-1 block text-xs text-red-600">{error}</span>}
    </label>
  );
}
