import { z } from "zod";

export const paymentMethods = ["CASH", "CARD", "CREDIT", "PARTIAL"] as const;

export const paymentMethodLabels: Record<(typeof paymentMethods)[number], string> = {
  CASH: "Nakit",
  CARD: "Kart",
  CREDIT: "Veresiye",
  PARTIAL: "Kısmi Ödeme",
};

export const completeSaleSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        quantity: z.number().int().min(1),
      }),
    )
    .min(1, "Sepet boş olamaz."),
  discount: z.number().min(0).default(0),
  paymentMethod: z.enum(paymentMethods),
  customerId: z.string().optional(),
});

export type CompleteSaleInput = z.infer<typeof completeSaleSchema>;

export type CompleteSaleResult =
  | { success: true; saleNumber: string }
  | { success: false; error: string };
