import Link from "next/link";
import { Package, Tags, AlertTriangle, ClipboardEdit, ShoppingCart } from "lucide-react";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type Stat = {
  label: string;
  value: number;
  icon: typeof Package;
};

async function getStats(): Promise<{
  stats: Stat[];
  dbConnected: boolean;
  notPricedCount: number;
}> {
  try {
    const [productCount, categoryCount, lowStockRows, notPricedCount] =
      await Promise.all([
        prisma.product.count(),
        prisma.category.count({ where: { parentId: null } }),
        prisma.$queryRaw<
          { count: bigint }[]
        >`SELECT COUNT(*)::bigint AS count FROM "Product" WHERE "stock" <= "minimumStock"`,
        prisma.product.count({ where: { stock: 0, salePrice: 0 } }),
      ]);
    const lowStockCount = Number(lowStockRows[0]?.count ?? 0);

    return {
      dbConnected: true,
      notPricedCount,
      stats: [
        { label: "Toplam Ürün", value: productCount, icon: Package },
        { label: "Ana Kategori", value: categoryCount, icon: Tags },
        { label: "Kritik Stok", value: lowStockCount, icon: AlertTriangle },
      ],
    };
  } catch {
    return {
      dbConnected: false,
      notPricedCount: 0,
      stats: [
        { label: "Toplam Ürün", value: 0, icon: Package },
        { label: "Ana Kategori", value: 0, icon: Tags },
        { label: "Kritik Stok", value: 0, icon: AlertTriangle },
      ],
    };
  }
}

export default async function DashboardPage() {
  const { stats, dbConnected, notPricedCount } = await getStats();

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
          <code>DATABASE_URL</code> ve <code>DIRECT_URL</code> değerlerini
          kontrol edin.
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Link
          href="/sales"
          className="flex items-center gap-4 rounded-lg border border-slate-200 bg-slate-900 p-5 text-white hover:bg-slate-800"
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10">
            <ShoppingCart className="h-5 w-5" />
          </div>
          <div>
            <p className="text-base font-semibold">Satış Yap</p>
            <p className="text-sm text-slate-300">Kasaya git, ürün sat</p>
          </div>
        </Link>
        <Link
          href="/inventory/stock-entry"
          className="flex items-center gap-4 rounded-lg border border-slate-200 bg-white p-5 hover:border-slate-400"
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-100">
            <ClipboardEdit className="h-5 w-5 text-slate-700" />
          </div>
          <div>
            <p className="text-base font-semibold text-slate-900">
              Stok / Fiyat Girişi
            </p>
            <p className="text-sm text-slate-500">
              {notPricedCount > 0
                ? `${notPricedCount} üründe stok/fiyat eksik`
                : "Tüm ürünler güncel"}
            </p>
          </div>
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
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
    </div>
  );
}
