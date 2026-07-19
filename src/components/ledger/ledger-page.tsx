const currency = (value: number) =>
  value.toLocaleString("tr-TR", { style: "currency", currency: "TRY" });

const dateFormatter = new Intl.DateTimeFormat("tr-TR", { dateStyle: "medium" });

export type LedgerEntry = {
  id: string;
  category: string;
  amount: number;
  description: string | null;
  createdAt: Date;
};

export function LedgerPage({
  title,
  entries,
  total,
  categories,
  createAction,
  deleteAction,
  error,
  amountTone,
}: {
  title: string;
  entries: LedgerEntry[];
  total: number;
  categories: string[];
  createAction: (formData: FormData) => void;
  deleteAction: (id: string) => void;
  error?: string;
  amountTone: "text-red-600" | "text-emerald-600";
}) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">{title}</h1>
          <p className="text-sm text-slate-500">Toplam: {currency(total)}</p>
        </div>
      </div>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <form
        action={createAction}
        className="flex flex-wrap items-end gap-3 rounded-lg border border-slate-200 bg-white p-4"
      >
        <label className="text-sm">
          <span className="mb-1 block font-medium text-slate-700">
            Kategori
          </span>
          <input
            name="category"
            list="ledger-categories"
            required
            className="input w-48"
          />
          <datalist id="ledger-categories">
            {categories.map((category) => (
              <option key={category} value={category} />
            ))}
          </datalist>
        </label>
        <label className="text-sm">
          <span className="mb-1 block font-medium text-slate-700">
            Tutar (₺)
          </span>
          <input
            type="number"
            name="amount"
            step="0.01"
            min="0.01"
            required
            className="input w-36"
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
              <th className="px-4 py-3 font-medium">Tarih</th>
              <th className="px-4 py-3 font-medium">Kategori</th>
              <th className="px-4 py-3 font-medium">Açıklama</th>
              <th className="px-4 py-3 font-medium">Tutar</th>
              <th className="px-4 py-3 font-medium text-right">Aksiyon</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {entries.map((entry) => (
              <tr key={entry.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 text-slate-600">
                  {dateFormatter.format(entry.createdAt)}
                </td>
                <td className="px-4 py-3 font-medium text-slate-900">
                  {entry.category}
                </td>
                <td className="px-4 py-3 text-slate-600">
                  {entry.description ?? "—"}
                </td>
                <td className={`px-4 py-3 font-medium ${amountTone}`}>
                  {currency(entry.amount)}
                </td>
                <td className="px-4 py-3 text-right">
                  <form action={deleteAction.bind(null, entry.id)}>
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
            {entries.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-sm text-slate-400">
                  Kayıt yok.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
