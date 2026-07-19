import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { BarcodeSvg } from "@/components/barcode/barcode-svg";
import { QrCode } from "@/components/barcode/qr-code";
import { PrintButton } from "@/components/barcode/print-button";

export const dynamic = "force-dynamic";

const currency = (value: number) =>
  value.toLocaleString("tr-TR", { style: "currency", currency: "TRY" });

export default async function BarcodeLabelPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between print:hidden">
        <div>
          <Link
            href="/barcode"
            className="mb-2 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Barkoda dön
          </Link>
          <h1 className="text-2xl font-semibold text-slate-900">
            Ürün Etiketi
          </h1>
        </div>
        <PrintButton />
      </div>

      <div className="flex justify-center">
        <div className="w-72 rounded-lg border border-slate-300 bg-white p-5 text-center shadow-sm print:shadow-none">
          <p className="line-clamp-2 text-sm font-semibold text-slate-900">
            {product.name}
          </p>
          <p className="mt-1 text-lg font-bold text-slate-900">
            {currency(Number(product.salePrice))}
          </p>

          <div className="my-4 flex justify-center">
            {product.barcode ? (
              <BarcodeSvg value={product.barcode} barWidth={2} height={55} />
            ) : (
              <p className="text-xs text-slate-400">Barkod tanımlı değil</p>
            )}
          </div>

          <div className="flex items-center justify-center gap-4">
            <QrCode value={product.sku} size={90} />
            <div className="text-left text-xs text-slate-500">
              <p>SKU: {product.sku}</p>
              <p>Kod: {product.productCode}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
