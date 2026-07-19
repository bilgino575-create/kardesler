import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PartnerForm } from "@/components/partners/partner-form";
import { createSupplier } from "../actions";

export default async function NewSupplierPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/suppliers"
          className="mb-2 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Tedarikçilere dön
        </Link>
        <h1 className="text-2xl font-semibold text-slate-900">
          Yeni Tedarikçi
        </h1>
      </div>

      <PartnerForm
        action={createSupplier}
        submitLabel="Tedarikçiyi Kaydet"
        error={error}
      />
    </div>
  );
}
