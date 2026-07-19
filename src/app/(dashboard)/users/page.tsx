import { prisma } from "@/lib/prisma";
import { inviteUser, setUserStatus, updateUserRole, resetUserPassword } from "./actions";

export const dynamic = "force-dynamic";

const statusLabels: Record<string, string> = {
  ACTIVE: "Aktif",
  INACTIVE: "Pasif",
  SUSPENDED: "Askıya Alındı",
};

export default async function UsersPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; success?: string }>;
}) {
  const { error, success } = await searchParams;

  const [users, roles] = await Promise.all([
    prisma.user.findMany({
      include: { role: true },
      orderBy: { createdAt: "asc" },
    }),
    prisma.role.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Kullanıcılar</h1>
        <p className="text-sm text-slate-500">
          Hesaplar, rol atamaları ve şifre yönetimi
        </p>
      </div>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}
      {success && (
        <div className="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          İşlem başarılı.
        </div>
      )}

      <form
        action={inviteUser}
        className="flex flex-wrap items-end gap-3 rounded-lg border border-slate-200 bg-white p-4"
      >
        <label className="text-sm">
          <span className="mb-1 block font-medium text-slate-700">Ad Soyad</span>
          <input name="name" required className="input w-40" />
        </label>
        <label className="text-sm">
          <span className="mb-1 block font-medium text-slate-700">E-posta</span>
          <input type="email" name="email" required className="input w-52" />
        </label>
        <label className="text-sm">
          <span className="mb-1 block font-medium text-slate-700">Şifre</span>
          <input
            type="text"
            name="password"
            required
            minLength={8}
            placeholder="En az 8 karakter"
            className="input w-40"
          />
        </label>
        <label className="text-sm">
          <span className="mb-1 block font-medium text-slate-700">Rol</span>
          <select name="roleId" className="input w-36">
            <option value="">Rol yok</option>
            {roles.map((role) => (
              <option key={role.id} value={role.id}>
                {role.name}
              </option>
            ))}
          </select>
        </label>
        <button
          type="submit"
          className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
        >
          Kullanıcı Ekle
        </button>
      </form>

      <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3 font-medium">Ad</th>
              <th className="px-4 py-3 font-medium">E-posta</th>
              <th className="px-4 py-3 font-medium">Rol</th>
              <th className="px-4 py-3 font-medium">Şifre Sıfırla</th>
              <th className="px-4 py-3 font-medium">Durum</th>
              <th className="px-4 py-3 font-medium text-right">Aksiyon</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 font-medium text-slate-900">
                  {user.name}
                </td>
                <td className="px-4 py-3 text-slate-600">{user.email}</td>
                <td className="px-4 py-3">
                  <form
                    action={updateUserRole.bind(null, user.id)}
                    className="flex items-center gap-2"
                  >
                    <select
                      name="roleId"
                      defaultValue={user.roleId ?? ""}
                      className="rounded-md border border-slate-300 px-2 py-1 text-xs"
                    >
                      <option value="">Rol yok</option>
                      {roles.map((role) => (
                        <option key={role.id} value={role.id}>
                          {role.name}
                        </option>
                      ))}
                    </select>
                    <button
                      type="submit"
                      className="text-xs font-medium text-slate-500 hover:text-slate-900"
                    >
                      Kaydet
                    </button>
                  </form>
                </td>
                <td className="px-4 py-3">
                  <form
                    action={resetUserPassword.bind(null, user.id)}
                    className="flex items-center gap-2"
                  >
                    <input
                      type="text"
                      name="password"
                      minLength={8}
                      placeholder="Yeni şifre"
                      className="w-28 rounded-md border border-slate-300 px-2 py-1 text-xs"
                    />
                    <button
                      type="submit"
                      className="text-xs font-medium text-slate-500 hover:text-slate-900"
                    >
                      Sıfırla
                    </button>
                  </form>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                      user.status === "ACTIVE"
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {statusLabels[user.status]}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <form
                    action={setUserStatus.bind(
                      null,
                      user.id,
                      user.status === "ACTIVE" ? "INACTIVE" : "ACTIVE",
                    )}
                  >
                    <button
                      type="submit"
                      className="text-sm font-medium text-slate-500 hover:text-slate-900"
                    >
                      {user.status === "ACTIVE" ? "Pasifleştir" : "Aktifleştir"}
                    </button>
                  </form>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-sm text-slate-400">
                  Kayıtlı kullanıcı yok.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
