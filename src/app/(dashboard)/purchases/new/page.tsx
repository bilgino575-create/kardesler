import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PurchaseForm } from "@/components/purchases/purchase-form";
import { getPurchaseFormData } from "../data";

export const dynamic = "force-dynamic";

export default async function NewPurchasePage() {
  const { products, suppliers } = await getPurchaseFormData();

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/purchases"
          className="mb-2 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Satın almalara dön
        </Link>
        <h1 className="text-2xl font-semibold text-slate-900">
          Yeni Satın Alma
        </h1>
      </div>

      <PurchaseForm products={products} suppliers={suppliers} />
    </div>
  );
}
