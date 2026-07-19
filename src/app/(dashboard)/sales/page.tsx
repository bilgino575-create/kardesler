import { PosScreen } from "@/components/sales/pos-screen";
import { getPosData } from "./data";

export const dynamic = "force-dynamic";

export default async function SalesPage() {
  let products: Awaited<ReturnType<typeof getPosData>>["products"] = [];
  let customers: Awaited<ReturnType<typeof getPosData>>["customers"] = [];
  let favoriteProductIds: Awaited<ReturnType<typeof getPosData>>["favoriteProductIds"] = [];
  let dbConnected = true;

  try {
    const data = await getPosData();
    products = data.products;
    customers = data.customers;
    favoriteProductIds = data.favoriteProductIds;
  } catch {
    dbConnected = false;
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Satış / POS</h1>
        <p className="text-sm text-slate-500">
          {dbConnected
            ? `${products.length} aktif ürün`
            : "Veritabanına bağlanılamadı"}
        </p>
      </div>

      {!dbConnected ? (
        <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Veritabanına bağlanılamadı. <code>.env</code> dosyasındaki{" "}
          <code>DATABASE_URL</code> değerini kontrol edin.
        </div>
      ) : (
        <PosScreen
          products={products}
          customers={customers}
          favoriteProductIds={favoriteProductIds}
        />
      )}
    </div>
  );
}
