import { z } from "zod";

export const productUnits = [
  "PIECE",
  "BOX",
  "PACK",
  "KG",
  "GRAM",
  "LITER",
  "METER",
] as const;

export const productUnitLabels: Record<(typeof productUnits)[number], string> = {
  PIECE: "Adet",
  BOX: "Kutu",
  PACK: "Paket",
  KG: "Kilogram",
  GRAM: "Gram",
  LITER: "Litre",
  METER: "Metre",
};

export const productStatuses = ["ACTIVE", "INACTIVE", "DISCONTINUED"] as const;

export const productStatusLabels: Record<(typeof productStatuses)[number], string> = {
  ACTIVE: "Aktif",
  INACTIVE: "Pasif",
  DISCONTINUED: "Kaldırıldı",
};

const optionalString = z
  .string()
  .trim()
  .optional()
  .transform((value) => (value ? value : undefined));

export const productSchema = z.object({
  name: z.string().trim().min(2, "Ürün adı en az 2 karakter olmalı."),
  categoryId: z.string().min(1, "Kategori seçiniz."),
  brand: optionalString,
  barcode: optionalString,
  sku: optionalString,
  productCode: optionalString,
  purchasePrice: z.coerce.number().min(0, "0 veya üzeri olmalı."),
  salePrice: z.coerce.number().min(0, "0 veya üzeri olmalı."),
  wholesalePrice: z.coerce.number().min(0, "0 veya üzeri olmalı."),
  vat: z.coerce.number().min(0).max(100),
  stock: z.coerce.number().int().min(0),
  minimumStock: z.coerce.number().int().min(0),
  unit: z.enum(productUnits),
  warehouseId: optionalString,
  status: z.enum(productStatuses),
  description: optionalString,
});

export type ProductFormValues = z.infer<typeof productSchema>;

export type ProductFormState = {
  error?: string;
  fieldErrors?: Partial<Record<keyof ProductFormValues, string>>;
};
