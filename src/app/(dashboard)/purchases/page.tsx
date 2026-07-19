import Link from "next/link";
import { Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { receivePurchase, cancelPurchase } from "./actions";

export const dynamic = "force-dynamic";

const currency = (value: number) =>
  value.toLocaleString("tr-TR", { style: "currency", currency: "TRY" });

const statusLabels: Record<string, string> = {
  PENDING: "Beklemede",
  RECEIVED: "Teslim Alındı",
  CANCELLED: "İptal Edildi",
};

const statusStyles: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-800",
  RECEIVED: "bg-emerald-100 text-emerald-800",
  CANCELLED: "bg-red-100 text-red-700",
};

export default async function PurchasesPage() {
  let purchases: Awaited<ReturnType<typeof loadPurchases>> = [];
  let dbConnected = true;

  async function loadPurchases() {
    return prisma.purchase.findMany({
      include: { supplier: true, items: true },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
  }

  try {
    purchases = await loadPurchases();
  } catch {
    dbConnected = false;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">
            Satın Alma
          </h1>
          <p className="text-sm text-slate-500">
            {dbConnected ? `${purchases.length} sipariş` : "Veritabanına bağlanılamadı"}
          </p>
        </div>
        <Link
          href="/purchases/new"
          className="inline-flex items-center gap-2 rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
        >
          <Plus className="h-4 w-4" />
          Yeni Satın Alma
        </Link>
      </div>

      <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3 font-medium">Sipariş No</th>
              <th className="px-4 py-3 font-medium">Tedarikçi</th>
              <th className="px-4 py-3 font-medium">Kalem</th>
              <th className="px-4 py-3 font-medium">Toplam</th>
              <th className="px-4 py-3 font-medium">Durum</th>
              <th className="px-4 py-3 font-medium text-right">Aksiyon</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {purchases.map((purchase) => (
              <tr key={purchase.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 font-medium text-slate-900">
                  {purchase.purchaseNumber}
                </td>
                <td className="px-4 py-3 text-slate-600">
                  {purchase.supplier.name}
                </td>
                <td className="px-4 py-3 text-slate-600">
                  {purchase.items.length}
                </td>
                <td className="px-4 py-3 text-slate-700">
                  {currency(Number(purchase.total))}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${statusStyles[purchase.status]}`}
                  >
                    {statusLabels[purchase.status]}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  {purchase.status === "PENDING" && (
                    <div className="flex items-center justify-end gap-3">
                      <form action={receivePurchase.bind(null, purchase.id)}>
                        <button
                          type="submit"
                          className="text-sm font-medium text-emerald-600 hover:text-emerald-800"
                        >
                          Teslim Al
                        </button>
                      </form>
                      <form action={cancelPurchase.bind(null, purchase.id)}>
                        <button
                          type="submit"
                          className="text-sm font-medium text-red-500 hover:text-red-700"
                        >
                          İptal Et
                        </button>
                      </form>
                    </div>
                  )}
                </td>
              </tr>
            ))}
            {purchases.length === 0 && dbConnected && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-sm text-slate-400">
                  Kayıtlı satın alma yok.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
