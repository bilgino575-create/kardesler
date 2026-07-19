import { z } from "zod";

export const createPurchaseSchema = z.object({
  supplierId: z.string().min(1, "Tedarikçi seçiniz."),
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        quantity: z.number().int().min(1),
        unitCost: z.number().min(0),
      }),
    )
    .min(1, "En az bir ürün ekleyin."),
});

export type CreatePurchaseInput = z.infer<typeof createPurchaseSchema>;

export type CreatePurchaseResult =
  | { success: true; purchaseNumber: string }
  | { success: false; error: string };
