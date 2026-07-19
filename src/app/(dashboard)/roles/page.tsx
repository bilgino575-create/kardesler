import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { createRole, deleteRole } from "./actions";

export const dynamic = "force-dynamic";

export default async function RolesPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  const roles = await prisma.role.findMany({
    include: { _count: { select: { users: true, permissions: true } } },
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Roller</h1>
        <p className="text-sm text-slate-500">
          Rol tanımları ve izin matrisi
        </p>
      </div>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <form
        action={createRole}
        className="flex flex-wrap items-end gap-3 rounded-lg border border-slate-200 bg-white p-4"
      >
        <label className="text-sm">
          <span className="mb-1 block font-medium text-slate-700">
            Rol Adı
          </span>
          <input name="name" required className="input w-48" />
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
          Rol Ekle
        </button>
      </form>

      <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3 font-medium">Rol</th>
              <th className="px-4 py-3 font-medium">Açıklama</th>
              <th className="px-4 py-3 font-medium">Kullanıcı</th>
              <th className="px-4 py-3 font-medium">İzin</th>
              <th className="px-4 py-3 font-medium text-right">Aksiyon</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {roles.map((role) => (
              <tr key={role.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 font-medium text-slate-900">
                  {role.name}
                </td>
                <td className="px-4 py-3 text-slate-600">
                  {role.description ?? "—"}
                </td>
                <td className="px-4 py-3 text-slate-600">
                  {role._count.users}
                </td>
                <td className="px-4 py-3 text-slate-600">
                  {role._count.permissions}
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-3">
                    <Link
                      href={`/roles/${role.id}`}
                      className="text-sm font-medium text-slate-600 hover:text-slate-900"
                    >
                      İzin Matrisi
                    </Link>
                    <form action={deleteRole.bind(null, role.id)}>
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
          </tbody>
        </table>
      </div>
    </div>
  );
}
