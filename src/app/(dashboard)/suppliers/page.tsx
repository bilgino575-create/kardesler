import Link from "next/link";
import { Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { deleteSupplier } from "./actions";

export const dynamic = "force-dynamic";

export default async function SuppliersPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  let suppliers: Awaited<ReturnType<typeof prisma.supplier.findMany>> = [];
  let dbConnected = true;
  try {
    suppliers = await prisma.supplier.findMany({ orderBy: { name: "asc" } });
  } catch {
    dbConnected = false;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">
            Tedarikçiler
          </h1>
          <p className="text-sm text-slate-500">
            {dbConnected ? `${suppliers.length} tedarikçi` : "Veritabanına bağlanılamadı"}
          </p>
        </div>
        <Link
          href="/suppliers/new"
          className="inline-flex items-center gap-2 rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
        >
          <Plus className="h-4 w-4" />
          Yeni Tedarikçi
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
              <th className="px-4 py-3 font-medium">Ad / Unvan</th>
              <th className="px-4 py-3 font-medium">Telefon</th>
              <th className="px-4 py-3 font-medium">E-posta</th>
              <th className="px-4 py-3 font-medium">Vergi No</th>
              <th className="px-4 py-3 font-medium text-right">Aksiyon</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {suppliers.map((supplier) => (
              <tr key={supplier.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 font-medium text-slate-900">
                  {supplier.name}
                </td>
                <td className="px-4 py-3 text-slate-600">
                  {supplier.phone ?? "—"}
                </td>
                <td className="px-4 py-3 text-slate-600">
                  {supplier.email ?? "—"}
                </td>
                <td className="px-4 py-3 text-slate-600">
                  {supplier.taxNumber ?? "—"}
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-3">
                    <Link
                      href={`/suppliers/${supplier.id}/edit`}
                      className="text-sm font-medium text-slate-600 hover:text-slate-900"
                    >
                      Düzenle
                    </Link>
                    <form action={deleteSupplier.bind(null, supplier.id)}>
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
            {suppliers.length === 0 && dbConnected && (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-sm text-slate-400">
                  Kayıtlı tedarikçi yok.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
