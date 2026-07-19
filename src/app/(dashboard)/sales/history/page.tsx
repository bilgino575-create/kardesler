import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { paymentMethodLabels } from "@/lib/validation/sale";
import { returnSale } from "./actions";

export const dynamic = "force-dynamic";

const currency = (value: number) =>
  value.toLocaleString("tr-TR", { style: "currency", currency: "TRY" });

const dateFormatter = new Intl.DateTimeFormat("tr-TR", {
  dateStyle: "short",
  timeStyle: "short",
});

const statusLabels: Record<string, string> = {
  COMPLETED: "Tamamlandı",
  RETURNED: "İade Edildi",
  PARTIALLY_RETURNED: "Kısmi İade",
  CANCELLED: "İptal Edildi",
};

const statusStyles: Record<string, string> = {
  COMPLETED: "bg-emerald-100 text-emerald-800",
  RETURNED: "bg-red-100 text-red-700",
  PARTIALLY_RETURNED: "bg-amber-100 text-amber-800",
  CANCELLED: "bg-slate-100 text-slate-600",
};

export default async function SalesHistoryPage() {
  const sales = await prisma.sale.findMany({
    include: { customer: true, items: true },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/sales"
          className="mb-2 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Kasaya dön
        </Link>
        <h1 className="text-2xl font-semibold text-slate-900">
          Geçmiş Satışlar
        </h1>
        <p className="text-sm text-slate-500">
          Yanlış satılan ürünü &quot;İade Et&quot; ile geri alabilirsiniz —
          stok otomatik geri yüklenir.
        </p>
      </div>

      <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3 font-medium">Satış No</th>
              <th className="px-4 py-3 font-medium">Tarih</th>
              <th className="px-4 py-3 font-medium">Müşteri</th>
              <th className="px-4 py-3 font-medium">Kalem</th>
              <th className="px-4 py-3 font-medium">Ödeme</th>
              <th className="px-4 py-3 font-medium">Toplam</th>
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
                <td className="px-4 py-3 text-slate-600">
                  {sale.items.length}
                </td>
                <td className="px-4 py-3 text-slate-600">
                  {paymentMethodLabels[sale.paymentMethod]}
                </td>
                <td className="px-4 py-3 text-slate-700">
                  {currency(Number(sale.total))}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${statusStyles[sale.status]}`}
                  >
                    {statusLabels[sale.status]}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  {sale.status === "COMPLETED" && (
                    <form action={returnSale.bind(null, sale.id)}>
                      <button
                        type="submit"
                        className="text-sm font-medium text-red-500 hover:text-red-700"
                      >
                        İade Et
                      </button>
                    </form>
                  )}
                </td>
              </tr>
            ))}
            {sales.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-10 text-center text-sm text-slate-400">
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
