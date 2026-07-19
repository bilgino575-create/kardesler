import Link from "next/link";
import { Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { deleteCustomer } from "./actions";

export const dynamic = "force-dynamic";

const currency = (value: number) =>
  value.toLocaleString("tr-TR", { style: "currency", currency: "TRY" });

export default async function CustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  let customers: Awaited<ReturnType<typeof prisma.customer.findMany>> = [];
  let dbConnected = true;
  try {
    customers = await prisma.customer.findMany({ orderBy: { name: "asc" } });
  } catch {
    dbConnected = false;
  }

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

      <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3 font-medium">Ad</th>
              <th className="px-4 py-3 font-medium">Telefon</th>
              <th className="px-4 py-3 font-medium">E-posta</th>
              <th className="px-4 py-3 font-medium">Cari Bakiye</th>
              <th className="px-4 py-3 font-medium text-right">Aksiyon</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {customers.map((customer) => (
              <tr key={customer.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 font-medium text-slate-900">
                  {customer.name}
                </td>
                <td className="px-4 py-3 text-slate-600">
                  {customer.phone ?? "—"}
                </td>
                <td className="px-4 py-3 text-slate-600">
                  {customer.email ?? "—"}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={
                      Number(customer.creditBalance) > 0
                        ? "font-medium text-red-600"
                        : "text-slate-600"
                    }
                  >
                    {currency(Number(customer.creditBalance))}
                  </span>
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
            ))}
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
