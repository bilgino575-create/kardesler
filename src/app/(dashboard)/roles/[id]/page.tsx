import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { toggleRolePermission } from "../actions";

export const dynamic = "force-dynamic";

export default async function RoleDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [role, allPermissions] = await Promise.all([
    prisma.role.findUnique({
      where: { id },
      include: { permissions: { select: { permissionId: true } } },
    }),
    prisma.permission.findMany({ orderBy: { key: "asc" } }),
  ]);

  if (!role) notFound();

  const grantedIds = new Set(role.permissions.map((p) => p.permissionId));

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/roles"
          className="mb-2 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Rollere dön
        </Link>
        <h1 className="text-2xl font-semibold text-slate-900">{role.name}</h1>
        <p className="text-sm text-slate-500">{role.description ?? "İzin Matrisi"}</p>
      </div>

      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3 font-medium">Anahtar</th>
              <th className="px-4 py-3 font-medium">Açıklama</th>
              <th className="px-4 py-3 font-medium text-right">Durum</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {allPermissions.map((permission) => {
              const granted = grantedIds.has(permission.id);
              return (
                <tr key={permission.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-mono text-xs text-slate-900">
                    {permission.key}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {permission.description ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <form
                      action={toggleRolePermission.bind(
                        null,
                        role.id,
                        permission.id,
                        !granted,
                      )}
                    >
                      <button
                        type="submit"
                        className={`rounded-full px-3 py-1 text-xs font-medium ${
                          granted
                            ? "bg-emerald-100 text-emerald-800 hover:bg-red-100 hover:text-red-700"
                            : "bg-slate-100 text-slate-500 hover:bg-emerald-100 hover:text-emerald-800"
                        }`}
                      >
                        {granted ? "Verildi" : "Verilmedi"}
                      </button>
                    </form>
                  </td>
                </tr>
              );
            })}
            {allPermissions.length === 0 && (
              <tr>
                <td colSpan={3} className="px-4 py-10 text-center text-sm text-slate-400">
                  Henüz izin tanımı yok.{" "}
                  <Link href="/permissions" className="underline">
                    İzinler sayfasından
                  </Link>{" "}
                  ekleyin.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
