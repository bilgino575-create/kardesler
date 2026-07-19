"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";
import { logAudit } from "@/lib/audit-log";
import {
  generateBarcode,
  generateProductCode,
  generateSku,
} from "@/lib/product-codes";
import {
  productSchema,
  type ProductFormState,
} from "@/lib/validation/product";

function parseFormData(formData: FormData) {
  return productSchema.safeParse({
    name: formData.get("name"),
    categoryId: formData.get("categoryId"),
    brand: formData.get("brand"),
    barcode: formData.get("barcode"),
    sku: formData.get("sku"),
    productCode: formData.get("productCode"),
    purchasePrice: formData.get("purchasePrice"),
    salePrice: formData.get("salePrice"),
    wholesalePrice: formData.get("wholesalePrice"),
    vat: formData.get("vat"),
    stock: formData.get("stock"),
    minimumStock: formData.get("minimumStock"),
    unit: formData.get("unit"),
    warehouseId: formData.get("warehouseId"),
    status: formData.get("status"),
    description: formData.get("description"),
  });
}

async function resolveBrandId(brandName?: string) {
  if (!brandName) return undefined;
  const brand = await prisma.brand.upsert({
    where: { name: brandName },
    update: {},
    create: { name: brandName },
  });
  return brand.id;
}

function uniqueFieldErrorMessage(error: unknown): ProductFormState | null {
  if (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002"
  ) {
    const target = (error.meta?.target as string[] | undefined) ?? [];
    const field = target[0] ?? "alan";
    return {
      error: `Bu ${field} değeri zaten kullanılıyor. Lütfen farklı bir değer girin.`,
    };
  }
  return null;
}

export async function createProduct(
  _prevState: ProductFormState,
  formData: FormData,
): Promise<ProductFormState> {
  const parsed = parseFormData(formData);
  if (!parsed.success) {
    return {
      error: "Formda hatalar var, lütfen kontrol edin.",
      fieldErrors: parsed.error.flatten().fieldErrors as ProductFormState["fieldErrors"],
    };
  }

  const data = parsed.data;

  try {
    const brandId = await resolveBrandId(data.brand);
    const sequence = (await prisma.product.count()) + 1;

    const product = await prisma.product.create({
      data: {
        name: data.name,
        categoryId: data.categoryId,
        brandId,
        barcode: data.barcode ?? generateBarcode(sequence),
        sku: data.sku ?? generateSku(sequence),
        productCode: data.productCode ?? generateProductCode(sequence),
        purchasePrice: data.purchasePrice,
        salePrice: data.salePrice,
        wholesalePrice: data.wholesalePrice,
        vat: data.vat,
        stock: data.stock,
        minimumStock: data.minimumStock,
        unit: data.unit,
        warehouseId: data.warehouseId,
        status: data.status,
        description: data.description,
      },
    });
    await logAudit("create", "Product", product.id, { name: product.name });
  } catch (error) {
    const uniqueError = uniqueFieldErrorMessage(error);
    if (uniqueError) return uniqueError;
    throw error;
  }

  revalidatePath("/inventory");
  redirect("/inventory");
}

export async function updateProduct(
  productId: string,
  _prevState: ProductFormState,
  formData: FormData,
): Promise<ProductFormState> {
  const parsed = parseFormData(formData);
  if (!parsed.success) {
    return {
      error: "Formda hatalar var, lütfen kontrol edin.",
      fieldErrors: parsed.error.flatten().fieldErrors as ProductFormState["fieldErrors"],
    };
  }

  const data = parsed.data;

  try {
    const brandId = await resolveBrandId(data.brand);

    await prisma.product.update({
      where: { id: productId },
      data: {
        name: data.name,
        categoryId: data.categoryId,
        brandId,
        barcode: data.barcode ?? null,
        purchasePrice: data.purchasePrice,
        salePrice: data.salePrice,
        wholesalePrice: data.wholesalePrice,
        vat: data.vat,
        stock: data.stock,
        minimumStock: data.minimumStock,
        unit: data.unit,
        warehouseId: data.warehouseId ?? null,
        status: data.status,
        description: data.description,
      },
    });
    await logAudit("update", "Product", productId, { name: data.name });
  } catch (error) {
    const uniqueError = uniqueFieldErrorMessage(error);
    if (uniqueError) return uniqueError;
    throw error;
  }

  revalidatePath("/inventory");
  revalidatePath(`/inventory/${productId}/edit`);
  redirect("/inventory");
}

export async function setProductStatus(
  productId: string,
  status: "ACTIVE" | "INACTIVE" | "DISCONTINUED",
) {
  await prisma.product.update({
    where: { id: productId },
    data: { status },
  });
  revalidatePath("/inventory");
}
