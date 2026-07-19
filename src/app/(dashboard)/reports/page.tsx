import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const currency = (value: number) =>
  value.toLocaleString("tr-TR", { style: "currency", currency: "TRY" });

async function getReportData() {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfWeek = new Date(startOfToday);
  startOfWeek.setDate(startOfToday.getDate() - startOfToday.getDay());
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [salesToday, salesWeek, salesMonth, expensesMonth, incomeMonth] =
    await Promise.all([
      prisma.sale.aggregate({ _sum: { total: true }, where: { createdAt: { gte: startOfToday } } }),
      prisma.sale.aggregate({ _sum: { total: true }, where: { createdAt: { gte: startOfWeek } } }),
      prisma.sale.aggregate({ _sum: { total: true }, where: { createdAt: { gte: startOfMonth } } }),
      prisma.expense.aggregate({ _sum: { amount: true }, where: { createdAt: { gte: startOfMonth } } }),
      prisma.income.aggregate({ _sum: { amount: true }, where: { createdAt: { gte: startOfMonth } } }),
    ]);

  const bestSellerRows = await prisma.saleItem.groupBy({
    by: ["productId"],
    _sum: { quantity: true, total: true },
    where: { sale: { createdAt: { gte: startOfMonth } } },
    orderBy: { _sum: { quantity: "desc" } },
    take: 10,
  });

  const bestSellerProducts = await prisma.product.findMany({
    where: { id: { in: bestSellerRows.map((row) => row.productId) } },
    select: { id: true, name: true },
  });
  const productNameMap = new Map(bestSellerProducts.map((p) => [p.id, p.name]));

  const lowStockProducts = await prisma.$queryRaw<
    { id: string; name: string; stock: number; minimumStock: number }[]
  >`SELECT id, name, stock, "minimumStock" FROM "Product" WHERE stock <= "minimumStock" AND status = 'ACTIVE' ORDER BY stock ASC LIMIT 20`;

  const monthSaleItems = await prisma.saleItem.findMany({
    where: { sale: { createdAt: { gte: startOfMonth } } },
    select: { quantity: true, product: { select: { purchasePrice: true } } },
  });
  const cogs = monthSaleItems.reduce(
    (sum, item) => sum + item.quantity * Number(item.product.purchasePrice),
    0,
  );

  const revenueMonth = Number(salesMonth._sum.total ?? 0);
  const grossProfit = revenueMonth - cogs;
  const netProfit =
    grossProfit + Number(incomeMonth._sum.amount ?? 0) - Number(expensesMonth._sum.amount ?? 0);

  return {
    salesToday: Number(salesToday._sum.total ?? 0),
    salesWeek: Number(salesWeek._sum.total ?? 0),
    salesMonth: revenueMonth,
    bestSellers: bestSellerRows.map((row) => ({
      productId: row.productId,
      name: productNameMap.get(row.productId) ?? "Bilinmeyen Ürün",
      quantity: row._sum.quantity ?? 0,
      total: Number(row._sum.total ?? 0),
    })),
    lowStockProducts,
    cogs,
    grossProfit,
    netProfit,
    expensesMonth: Number(expensesMonth._sum.amount ?? 0),
    incomeMonth: Number(incomeMonth._sum.amount ?? 0),
  };
}

export default async function ReportsPage() {
  let data: Awaited<ReturnType<typeof getReportData>> | null = null;
  try {
    data = await getReportData();
  } catch {
    data = null;
  }

  if (!data) {
    return (
      <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
        Veritabanına bağlanılamadı. <code>.env</code> dosyasındaki{" "}
        <code>DATABASE_URL</code> değerini kontrol edin.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Raporlar</h1>
        <p className="text-sm text-slate-500">Bu ayki özet göstergeler</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Bugünkü Satış" value={currency(data.salesToday)} />
        <StatCard label="Bu Haftaki Satış" value={currency(data.salesWeek)} />
        <StatCard label="Bu Ayki Satış" value={currency(data.salesMonth)} />
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-6">
        <h2 className="mb-4 text-sm font-semibold text-slate-900">
          Bu Ay Kâr / Zarar Özeti
        </h2>
        <dl className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-5">
          <SummaryItem label="Satış Geliri" value={currency(data.salesMonth)} />
          <SummaryItem label="Satılan Malın Maliyeti" value={currency(data.cogs)} />
          <SummaryItem label="Brüt Kâr" value={currency(data.grossProfit)} />
          <SummaryItem label="Diğer Gelir/Gider" value={currency(data.incomeMonth - data.expensesMonth)} />
          <SummaryItem
            label="Net Kâr"
            value={currency(data.netProfit)}
            tone={data.netProfit >= 0 ? "text-emerald-600" : "text-red-600"}
          />
        </dl>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-slate-200 bg-white">
          <h2 className="border-b border-slate-200 px-4 py-3 text-sm font-semibold text-slate-900">
            En Çok Satan Ürünler (Bu Ay)
          </h2>
          <ul className="divide-y divide-slate-100">
            {data.bestSellers.map((item, index) => (
              <li key={item.productId} className="flex items-center gap-3 px-4 py-3 text-sm">
                <span className="text-slate-400">{index + 1}.</span>
                <span className="flex-1 truncate text-slate-900">{item.name}</span>
                <span className="text-slate-500">{item.quantity} adet</span>
                <span className="font-medium text-slate-900">{currency(item.total)}</span>
              </li>
            ))}
            {data.bestSellers.length === 0 && (
              <li className="px-4 py-10 text-center text-sm text-slate-400">
                Bu ay henüz satış yok.
              </li>
            )}
          </ul>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white">
          <h2 className="border-b border-slate-200 px-4 py-3 text-sm font-semibold text-slate-900">
            Kritik Stok
          </h2>
          <ul className="divide-y divide-slate-100">
            {data.lowStockProducts.map((product) => (
              <li key={product.id} className="flex items-center gap-3 px-4 py-3 text-sm">
                <span className="flex-1 truncate text-slate-900">{product.name}</span>
                <span className="font-medium text-red-600">
                  {product.stock} / min {product.minimumStock}
                </span>
                <Link
                  href={`/purchases/new?add=${product.id}`}
                  className="shrink-0 rounded-md border border-slate-200 px-2 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50"
                >
                  Satın Al
                </Link>
              </li>
            ))}
            {data.lowStockProducts.length === 0 && (
              <li className="px-4 py-10 text-center text-sm text-slate-400">
                Kritik stokta ürün yok.
              </li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5">
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-slate-900">{value}</p>
    </div>
  );
}

function SummaryItem({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: string;
}) {
  return (
    <div>
      <dt className="text-slate-500">{label}</dt>
      <dd className={`mt-1 font-semibold ${tone ?? "text-slate-900"}`}>{value}</dd>
    </div>
  );
}
