import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PartnerForm } from "@/components/partners/partner-form";
import { createCustomer } from "../actions";

export default async function NewCustomerPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/customers"
          className="mb-2 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Müşterilere dön
        </Link>
        <h1 className="text-2xl font-semibold text-slate-900">Yeni Müşteri</h1>
      </div>

      <PartnerForm
        action={createCustomer}
        submitLabel="Müşteriyi Kaydet"
        error={error}
      />
    </div>
  );
}
