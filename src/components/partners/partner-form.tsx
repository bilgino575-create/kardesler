export type PartnerFormDefaults = {
  name?: string;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  taxNumber?: string | null;
};

export function PartnerForm({
  action,
  defaults,
  submitLabel,
  error,
  extra,
}: {
  action: (formData: FormData) => void;
  defaults?: PartnerFormDefaults;
  submitLabel: string;
  error?: string;
  extra?: React.ReactNode;
}) {
  return (
    <form
      action={action}
      className="max-w-xl space-y-4 rounded-lg border border-slate-200 bg-white p-6"
    >
      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <label className="block text-sm">
        <span className="mb-1 block font-medium text-slate-700">Ad / Unvan</span>
        <input name="name" defaultValue={defaults?.name} required className="input" />
      </label>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className="block text-sm">
          <span className="mb-1 block font-medium text-slate-700">Telefon</span>
          <input name="phone" defaultValue={defaults?.phone ?? ""} className="input" />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block font-medium text-slate-700">E-posta</span>
          <input
            type="email"
            name="email"
            defaultValue={defaults?.email ?? ""}
            className="input"
          />
        </label>
      </div>

      <label className="block text-sm">
        <span className="mb-1 block font-medium text-slate-700">Adres</span>
        <textarea
          name="address"
          rows={2}
          defaultValue={defaults?.address ?? ""}
          className="input resize-none"
        />
      </label>

      <label className="block text-sm">
        <span className="mb-1 block font-medium text-slate-700">Vergi No</span>
        <input
          name="taxNumber"
          defaultValue={defaults?.taxNumber ?? ""}
          className="input"
        />
      </label>

      {extra}

      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
        >
          {submitLabel}
        </button>
      </div>
    </form>
  );
}
