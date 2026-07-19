import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { PartnerForm } from "@/components/partners/partner-form";
import { prisma } from "@/lib/prisma";
import { updateCustomer } from "../../actions";

export const dynamic = "force-dynamic";

const currency = (value: number) =>
  value.toLocaleString("tr-TR", { style: "currency", currency: "TRY" });

export default async function EditCustomerPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const { error } = await searchParams;

  const customer = await prisma.customer.findUnique({ where: { id } });
  if (!customer) notFound();

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
        <h1 className="text-2xl font-semibold text-slate-900">
          Müşteriyi Düzenle
        </h1>
        <p className="text-sm text-slate-500">{customer.name}</p>
      </div>

      <PartnerForm
        action={updateCustomer.bind(null, customer.id)}
        defaults={customer}
        submitLabel="Değişiklikleri Kaydet"
        error={error}
        extra={
          <div className="rounded-md bg-slate-50 px-3 py-2 text-sm text-slate-600">
            Cari Bakiye:{" "}
            <span className="font-medium text-slate-900">
              {currency(Number(customer.creditBalance))}
            </span>
          </div>
        }
      />
    </div>
  );
}
