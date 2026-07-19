"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

export async function createInvoiceForSale(saleId: string) {
  const sale = await prisma.sale.findUnique({ where: { id: saleId } });
  if (!sale) return;

  const existing = await prisma.invoice.findUnique({ where: { saleId } });
  if (existing) return;

  const sequence = (await prisma.invoice.count()) + 1;
  const invoiceNumber = `FTR-${String(sequence).padStart(6, "0")}`;

  await prisma.invoice.create({
    data: {
      invoiceNumber,
      saleId: sale.id,
      customerId: sale.customerId,
      total: sale.total,
      status: "ISSUED",
    },
  });

  revalidatePath("/invoices");
}
