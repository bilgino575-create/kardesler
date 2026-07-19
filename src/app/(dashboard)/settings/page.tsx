import { prisma } from "@/lib/prisma";
import { saveCompanySettings } from "./actions";

export const dynamic = "force-dynamic";

type CompanySettings = {
  companyName?: string;
  phone?: string;
  address?: string;
  taxNumber?: string;
  defaultVat?: number;
};

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string }>;
}) {
  const { success } = await searchParams;

  const setting = await prisma.setting.findUnique({ where: { key: "company" } });
  const company = (setting?.value as CompanySettings | undefined) ?? {};

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Ayarlar</h1>
        <p className="text-sm text-slate-500">Firma bilgileri ve genel tercihler</p>
      </div>

      {success && (
        <div className="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          Ayarlar kaydedildi.
        </div>
      )}

      <form
        action={saveCompanySettings}
        className="max-w-xl space-y-4 rounded-lg border border-slate-200 bg-white p-6"
      >
        <h2 className="text-sm font-semibold text-slate-900">Firma Bilgileri</h2>
        <label className="block text-sm">
          <span className="mb-1 block font-medium text-slate-700">Firma Adı</span>
          <input
            name="companyName"
            defaultValue={company.companyName}
            className="input"
          />
        </label>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="block text-sm">
            <span className="mb-1 block font-medium text-slate-700">Telefon</span>
            <input name="phone" defaultValue={company.phone} className="input" />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block font-medium text-slate-700">Vergi No</span>
            <input
              name="taxNumber"
              defaultValue={company.taxNumber}
              className="input"
            />
          </label>
        </div>
        <label className="block text-sm">
          <span className="mb-1 block font-medium text-slate-700">Adres</span>
          <textarea
            name="address"
            rows={2}
            defaultValue={company.address}
            className="input resize-none"
          />
        </label>
        <label className="block max-w-xs text-sm">
          <span className="mb-1 block font-medium text-slate-700">
            Varsayılan KDV (%)
          </span>
          <input
            type="number"
            name="defaultVat"
            step="0.01"
            min="0"
            max="100"
            defaultValue={company.defaultVat ?? 20}
            className="input"
          />
        </label>
        <button
          type="submit"
          className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
        >
          Kaydet
        </button>
      </form>

      <div className="max-w-xl rounded-lg border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-500">
        <p className="font-medium text-slate-700">Sonraki aşamada eklenecek:</p>
        <p className="mt-1">
          SMTP/SMS/WhatsApp ayarları, logo/favicon yönetimi, SEO araçları
          (robots.txt, sitemap, Google entegrasyonları), yedekleme/geri yükleme
          ve API anahtarları.
        </p>
      </div>
    </div>
  );
}
