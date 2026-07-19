import { prisma } from "@/lib/prisma";
import { createInvoiceForSale } from "./actions";

export const dynamic = "force-dynamic";

const currency = (value: number) =>
  value.toLocaleString("tr-TR", { style: "currency", currency: "TRY" });

const dateFormatter = new Intl.DateTimeFormat("tr-TR", { dateStyle: "medium" });

const invoiceStatusLabels: Record<string, string> = {
  DRAFT: "Taslak",
  ISSUED: "Kesildi",
  PAID: "Ödendi",
  CANCELLED: "İptal",
};

export default async function InvoicesPage() {
  const sales = await prisma.sale.findMany({
    include: { customer: true, invoice: true },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Faturalar</h1>
        <p className="text-sm text-slate-500">
          Satışlardan fatura kesin ve takip edin
        </p>
      </div>

      <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3 font-medium">Satış No</th>
              <th className="px-4 py-3 font-medium">Tarih</th>
              <th className="px-4 py-3 font-medium">Müşteri</th>
              <th className="px-4 py-3 font-medium">Toplam</th>
              <th className="px-4 py-3 font-medium">Fatura No</th>
              <th className="px-4 py-3 font-medium">Durum</th>
              <th className="px-4 py-3 font-medium text-right">Aksiyon</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {sales.map((sale) => (
              <tr key={sale.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 font-medium text-slate-900">
                  {sale.saleNumber}
                </td>
                <td className="px-4 py-3 text-slate-600">
                  {dateFormatter.format(sale.createdAt)}
                </td>
                <td className="px-4 py-3 text-slate-600">
                  {sale.customer?.name ?? "Perakende"}
                </td>
                <td className="px-4 py-3 text-slate-700">
                  {currency(Number(sale.total))}
                </td>
                <td className="px-4 py-3 text-slate-600">
                  {sale.invoice?.invoiceNumber ?? "—"}
                </td>
                <td className="px-4 py-3 text-slate-600">
                  {sale.invoice
                    ? invoiceStatusLabels[sale.invoice.status]
                    : "—"}
                </td>
                <td className="px-4 py-3 text-right">
                  {!sale.invoice && (
                    <form action={createInvoiceForSale.bind(null, sale.id)}>
                      <button
                        type="submit"
                        className="text-sm font-medium text-slate-600 hover:text-slate-900"
                      >
                        Fatura Oluştur
                      </button>
                    </form>
                  )}
                </td>
              </tr>
            ))}
            {sales.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-sm text-slate-400">
                  Henüz satış yok.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
