import { prisma } from "@/lib/prisma";
import { createPermission, deletePermission } from "./actions";

export const dynamic = "force-dynamic";

export default async function PermissionsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  const permissions = await prisma.permission.findMany({
    include: { _count: { select: { roles: true } } },
    orderBy: { key: "asc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">İzinler</h1>
        <p className="text-sm text-slate-500">
          Sistemdeki izin anahtarları — rollere Roller sayfasından atanır
        </p>
      </div>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <form
        action={createPermission}
        className="flex flex-wrap items-end gap-3 rounded-lg border border-slate-200 bg-white p-4"
      >
        <label className="text-sm">
          <span className="mb-1 block font-medium text-slate-700">
            İzin Anahtarı
          </span>
          <input
            name="key"
            placeholder="orn. reports.export"
            required
            className="input w-56"
          />
        </label>
        <label className="flex-1 text-sm">
          <span className="mb-1 block font-medium text-slate-700">
            Açıklama
          </span>
          <input name="description" className="input" />
        </label>
        <button
          type="submit"
          className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
        >
          Ekle
        </button>
      </form>

      <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3 font-medium">Anahtar</th>
              <th className="px-4 py-3 font-medium">Açıklama</th>
              <th className="px-4 py-3 font-medium">Kullanan Rol Sayısı</th>
              <th className="px-4 py-3 font-medium text-right">Aksiyon</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {permissions.map((permission) => (
              <tr key={permission.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 font-mono text-xs text-slate-900">
                  {permission.key}
                </td>
                <td className="px-4 py-3 text-slate-600">
                  {permission.description ?? "—"}
                </td>
                <td className="px-4 py-3 text-slate-600">
                  {permission._count.roles}
                </td>
                <td className="px-4 py-3 text-right">
                  <form action={deletePermission.bind(null, permission.id)}>
                    <button
                      type="submit"
                      className="text-sm font-medium text-red-500 hover:text-red-700"
                    >
                      Sil
                    </button>
                  </form>
                </td>
              </tr>
            ))}
            {permissions.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-10 text-center text-sm text-slate-400">
                  İzin tanımı yok.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
