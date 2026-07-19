import { prisma } from "@/lib/prisma";
import { paymentMethodLabels } from "@/lib/validation/sale";
import { openCashSession, closeCashSession } from "./actions";

export const dynamic = "force-dynamic";

const currency = (value: number) =>
  value.toLocaleString("tr-TR", { style: "currency", currency: "TRY" });

const dateFormatter = new Intl.DateTimeFormat("tr-TR", {
  dateStyle: "short",
  timeStyle: "short",
});

export default async function CashRegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  const openSession = await prisma.cashSession.findFirst({
    where: { status: "OPEN" },
    include: { user: true },
  });

  const salesDuringSession = openSession
    ? await prisma.sale.groupBy({
        by: ["paymentMethod"],
        where: { createdAt: { gte: openSession.openedAt } },
        _sum: { total: true },
      })
    : [];

  const cashSales =
    salesDuringSession.find((row) => row.paymentMethod === "CASH")?._sum
      .total ?? 0;
  const expectedCash = Number(openSession?.openingCash ?? 0) + Number(cashSales);

  const closedSessions = await prisma.cashSession.findMany({
    where: { status: "CLOSED" },
    include: { user: true },
    orderBy: { closedAt: "desc" },
    take: 20,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Kasa</h1>
        <p className="text-sm text-slate-500">Gün açma / kapama ve nakit hareketleri</p>
      </div>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {openSession ? (
        <div className="max-w-xl space-y-4 rounded-lg border border-slate-200 bg-white p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-900">
              Açık Kasa Oturumu
            </h2>
            <span className="inline-flex rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-medium text-emerald-800">
              Açık
            </span>
          </div>
          <dl className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <dt className="text-slate-500">Açılış Saati</dt>
              <dd className="text-slate-900">
                {dateFormatter.format(openSession.openedAt)}
              </dd>
            </div>
            <div>
              <dt className="text-slate-500">Açan Kullanıcı</dt>
              <dd className="text-slate-900">{openSession.user.name}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Açılış Tutarı</dt>
              <dd className="text-slate-900">
                {currency(Number(openSession.openingCash))}
              </dd>
            </div>
            <div>
              <dt className="text-slate-500">Beklenen Nakit</dt>
              <dd className="font-medium text-slate-900">
                {currency(expectedCash)}
              </dd>
            </div>
          </dl>

          {salesDuringSession.length > 0 && (
            <div className="rounded-md bg-slate-50 p-3 text-sm">
              <p className="mb-2 font-medium text-slate-700">
                Oturum Boyunca Satışlar
              </p>
              <ul className="space-y-1">
                {salesDuringSession.map((row) => (
                  <li
                    key={row.paymentMethod}
                    className="flex justify-between text-slate-600"
                  >
                    <span>{paymentMethodLabels[row.paymentMethod]}</span>
                    <span>{currency(Number(row._sum.total ?? 0))}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <form
            action={closeCashSession.bind(null, openSession.id)}
            className="flex items-end gap-3"
          >
            <label className="flex-1 text-sm">
              <span className="mb-1 block font-medium text-slate-700">
                Kapanış Tutarı (Sayılan Nakit)
              </span>
              <input
                type="number"
                name="closingCash"
                step="0.01"
                min="0"
                defaultValue={expectedCash.toFixed(2)}
                required
                className="input"
              />
            </label>
            <button
              type="submit"
              className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
            >
              Kasayı Kapat
            </button>
          </form>
        </div>
      ) : (
        <form
          action={openCashSession}
          className="max-w-xl space-y-4 rounded-lg border border-slate-200 bg-white p-6"
        >
          <h2 className="text-sm font-semibold text-slate-900">
            Kasayı Aç
          </h2>
          <label className="block text-sm">
            <span className="mb-1 block font-medium text-slate-700">
              Açılış Tutarı
            </span>
            <input
              type="number"
              name="openingCash"
              step="0.01"
              min="0"
              defaultValue={0}
              required
              className="input"
            />
          </label>
          <button
            type="submit"
            className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
          >
            Kasayı Aç
          </button>
        </form>
      )}

      <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3 font-medium">Açılış</th>
              <th className="px-4 py-3 font-medium">Kapanış</th>
              <th className="px-4 py-3 font-medium">Kullanıcı</th>
              <th className="px-4 py-3 font-medium">Açılış Tutarı</th>
              <th className="px-4 py-3 font-medium">Kapanış Tutarı</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {closedSessions.map((session) => (
              <tr key={session.id}>
                <td className="px-4 py-3 text-slate-600">
                  {dateFormatter.format(session.openedAt)}
                </td>
                <td className="px-4 py-3 text-slate-600">
                  {session.closedAt ? dateFormatter.format(session.closedAt) : "—"}
                </td>
                <td className="px-4 py-3 text-slate-600">{session.user.name}</td>
                <td className="px-4 py-3 text-slate-700">
                  {currency(Number(session.openingCash))}
                </td>
                <td className="px-4 py-3 text-slate-700">
                  {session.closingCash != null
                    ? currency(Number(session.closingCash))
                    : "—"}
                </td>
              </tr>
            ))}
            {closedSessions.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-sm text-slate-400">
                  Kapatılmış kasa oturumu yok.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
