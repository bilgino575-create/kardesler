import Link from "next/link";
import { Plus, Wallet } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { deleteCustomer, collectPayment } from "./actions";

export const dynamic = "force-dynamic";

const currency = (value: number) =>
  value.toLocaleString("tr-TR", { style: "currency", currency: "TRY" });

export default async function CustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; success?: string }>;
}) {
  const { error, success } = await searchParams;

  let customers: Awaited<ReturnType<typeof prisma.customer.findMany>> = [];
  let dbConnected = true;
  try {
    customers = await prisma.customer.findMany({
      orderBy: [{ creditBalance: "desc" }, { name: "asc" }],
    });
  } catch {
    dbConnected = false;
  }

  const totalDebt = customers.reduce(
    (sum, customer) => sum + Number(customer.creditBalance),
    0,
  );
  const debtorCount = customers.filter(
    (customer) => Number(customer.creditBalance) > 0,
  ).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Müşteriler</h1>
          <p className="text-sm text-slate-500">
            {dbConnected ? `${customers.length} müşteri` : "Veritabanına bağlanılamadı"}
          </p>
        </div>
        <Link
          href="/customers/new"
          className="inline-flex items-center gap-2 rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
        >
          <Plus className="h-4 w-4" />
          Yeni Müşteri
        </Link>
      </div>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}
      {success && (
        <div className="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          Tahsilat kaydedildi.
        </div>
      )}

      {totalDebt > 0 && (
        <div className="flex items-center gap-4 rounded-lg border border-amber-200 bg-amber-50 p-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-amber-100">
            <Wallet className="h-5 w-5 text-amber-700" />
          </div>
          <div>
            <p className="text-lg font-semibold text-amber-900">
              {currency(totalDebt)} veresiye alacağınız var
            </p>
            <p className="text-sm text-amber-700">
              {debtorCount} müşteride borç bulunuyor
            </p>
          </div>
        </div>
      )}

      <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3 font-medium">Ad</th>
              <th className="px-4 py-3 font-medium">Telefon</th>
              <th className="px-4 py-3 font-medium">Veresiye Bakiyesi</th>
              <th className="px-4 py-3 font-medium">Tahsilat Al</th>
              <th className="px-4 py-3 font-medium text-right">Aksiyon</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {customers.map((customer) => {
              const balance = Number(customer.creditBalance);
              return (
                <tr key={customer.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-900">
                    {customer.name}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {customer.phone ?? "—"}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={
                        balance > 0 ? "font-semibold text-red-600" : "text-slate-400"
                      }
                    >
                      {currency(balance)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {balance > 0 && (
                      <form
                        action={collectPayment.bind(null, customer.id)}
                        className="flex items-center gap-2"
                      >
                        <input
                          type="number"
                          name="amount"
                          min="0.01"
                          step="0.01"
                          max={balance}
                          placeholder={balance.toFixed(2)}
                          className="w-24 rounded-md border border-slate-300 px-2 py-1 text-xs"
                        />
                        <button
                          type="submit"
                          className="rounded-md bg-emerald-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-emerald-700"
                        >
                          Al
                        </button>
                      </form>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <Link
                        href={`/customers/${customer.id}/edit`}
                        className="text-sm font-medium text-slate-600 hover:text-slate-900"
                      >
                        Düzenle
                      </Link>
                      <form action={deleteCustomer.bind(null, customer.id)}>
                        <button
                          type="submit"
                          className="text-sm font-medium text-red-500 hover:text-red-700"
                        >
                          Sil
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              );
            })}
            {customers.length === 0 && dbConnected && (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-sm text-slate-400">
                  Kayıtlı müşteri yok.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
