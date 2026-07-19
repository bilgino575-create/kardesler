import Link from "next/link";
import { Search, Tag } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { BarcodeSvg } from "@/components/barcode/barcode-svg";

export const dynamic = "force-dynamic";

export default async function BarcodePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;

  const products = await prisma.product.findMany({
    where: q
      ? {
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { sku: { contains: q, mode: "insensitive" } },
            { barcode: { contains: q, mode: "insensitive" } },
          ],
        }
      : {},
    orderBy: { name: "asc" },
    take: 30,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Barkod</h1>
        <p className="text-sm text-slate-500">
          Ürün için barkod (EAN-13) ve QR etiketi oluşturun
        </p>
      </div>

      <form method="get" className="max-w-md">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            name="q"
            defaultValue={q}
            placeholder="Ürün adı, SKU veya barkod ile ara..."
            className="w-full rounded-md border border-slate-300 bg-white py-2 pl-9 pr-3 text-sm focus:border-slate-500 focus:outline-none"
          />
        </div>
      </form>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((product) => (
          <div
            key={product.id}
            className="flex flex-col items-center gap-3 rounded-lg border border-slate-200 bg-white p-4"
          >
            <p className="line-clamp-2 text-center text-sm font-medium text-slate-900">
              {product.name}
            </p>
            {product.barcode ? (
              <BarcodeSvg value={product.barcode} barWidth={1.5} height={45} />
            ) : (
              <p className="text-xs text-slate-400">Barkod yok</p>
            )}
            <Link
              href={`/barcode/${product.id}`}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900"
            >
              <Tag className="h-3.5 w-3.5" />
              Etiketi Görüntüle
            </Link>
          </div>
        ))}
        {products.length === 0 && (
          <p className="col-span-full py-10 text-center text-sm text-slate-400">
            Ürün bulunamadı.
          </p>
        )}
      </div>
    </div>
  );
}
