import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const dateFormatter = new Intl.DateTimeFormat("tr-TR", {
  dateStyle: "short",
  timeStyle: "medium",
});

const actionLabels: Record<string, string> = {
  create: "Oluşturuldu",
  update: "Güncellendi",
  complete: "Tamamlandı",
  receive: "Teslim Alındı",
  "status-change": "Durum Değişti",
  "grant-permission": "İzin Verildi",
  "revoke-permission": "İzin Kaldırıldı",
};

export default async function AuditLogsPage() {
  let logs: Awaited<ReturnType<typeof loadLogs>> = [];
  let dbConnected = true;

  async function loadLogs() {
    return prisma.auditLog.findMany({
      include: { user: true },
      orderBy: { createdAt: "desc" },
      take: 100,
    });
  }

  try {
    logs = await loadLogs();
  } catch {
    dbConnected = false;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">
          Denetim Kayıtları
        </h1>
        <p className="text-sm text-slate-500">
          {dbConnected
            ? `Son ${logs.length} işlem`
            : "Veritabanına bağlanılamadı"}
        </p>
      </div>

      <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3 font-medium">Tarih</th>
              <th className="px-4 py-3 font-medium">Kullanıcı</th>
              <th className="px-4 py-3 font-medium">İşlem</th>
              <th className="px-4 py-3 font-medium">Varlık</th>
              <th className="px-4 py-3 font-medium">Detay</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {logs.map((log) => (
              <tr key={log.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 text-slate-500">
                  {dateFormatter.format(log.createdAt)}
                </td>
                <td className="px-4 py-3 text-slate-700">
                  {log.user?.name ?? "Sistem"}
                </td>
                <td className="px-4 py-3 font-medium text-slate-900">
                  {actionLabels[log.action] ?? log.action}
                </td>
                <td className="px-4 py-3 text-slate-600">{log.entityType}</td>
                <td className="px-4 py-3 font-mono text-xs text-slate-500">
                  {log.metadata ? JSON.stringify(log.metadata) : "—"}
                </td>
              </tr>
            ))}
            {logs.length === 0 && dbConnected && (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-sm text-slate-400">
                  Henüz kayıt yok.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
