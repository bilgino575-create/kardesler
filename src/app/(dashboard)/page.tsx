import { Package, Tags, Boxes, AlertTriangle } from "lucide-react";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type Stat = {
  label: string;
  value: number;
  icon: typeof Package;
};

async function getStats(): Promise<{ stats: Stat[]; dbConnected: boolean }> {
  try {
    const [productCount, categoryCount, brandCount, lowStockRows] =
      await Promise.all([
        prisma.product.count(),
        prisma.category.count({ where: { parentId: null } }),
        prisma.brand.count(),
        prisma.$queryRaw<
          { count: bigint }[]
        >`SELECT COUNT(*)::bigint AS count FROM "Product" WHERE "stock" <= "minimumStock"`,
      ]);
    const lowStockCount = Number(lowStockRows[0]?.count ?? 0);

    return {
      dbConnected: true,
      stats: [
        { label: "Toplam Ürün", value: productCount, icon: Package },
        { label: "Ana Kategori", value: categoryCount, icon: Tags },
        { label: "Marka", value: brandCount, icon: Boxes },
        { label: "Kritik Stok", value: lowStockCount, icon: AlertTriangle },
      ],
    };
  } catch {
    return {
      dbConnected: false,
      stats: [
        { label: "Toplam Ürün", value: 0, icon: Package },
        { label: "Ana Kategori", value: 0, icon: Tags },
        { label: "Marka", value: 0, icon: Boxes },
        { label: "Kritik Stok", value: 0, icon: AlertTriangle },
      ],
    };
  }
}

export default async function DashboardPage() {
  const { stats, dbConnected } = await getStats();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Dashboard</h1>
        <p className="text-sm text-slate-500">
          Kardeşler Tobacco ERP sistemine hoş geldiniz.
        </p>
      </div>

      {!dbConnected && (
        <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Veritabanına bağlanılamadı. <code>.env</code> dosyasındaki{" "}
          <code>DATABASE_URL</code> değerini Supabase Postgres bağlantı
          bilgilerinizle güncelleyip <code>npm run db:migrate</code> ve{" "}
          <code>npm run db:seed</code> komutlarını çalıştırın.
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="rounded-lg border border-slate-200 bg-white p-5"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-slate-500">
                  {stat.label}
                </p>
                <div className="flex h-9 w-9 items-center justify-center rounded-md bg-slate-100">
                  <Icon className="h-4.5 w-4.5 text-slate-600" />
                </div>
              </div>
              <p className="mt-3 text-3xl font-semibold text-slate-900">
                {stat.value}
              </p>
            </div>
          );
        })}
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-6">
        <h2 className="text-sm font-semibold text-slate-900">
          Kurulum Adımları
        </h2>
        <ol className="mt-3 list-decimal space-y-1.5 pl-5 text-sm text-slate-600">
          <li>Supabase projenizi oluşturun ve bağlantı bilgilerini alın.</li>
          <li>
            <code>.env</code> dosyasındaki <code>DATABASE_URL</code>,{" "}
            <code>DIRECT_URL</code> ve Supabase değişkenlerini doldurun.
          </li>
          <li>
            <code>npm run db:migrate</code> ile tabloları oluşturun.
          </li>
          <li>
            <code>npm run db:seed</code> ile başlangıç ürün kataloğunu
            yükleyin.
          </li>
        </ol>
      </div>
    </div>
  );
}
