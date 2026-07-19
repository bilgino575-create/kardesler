import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { PartnerForm } from "@/components/partners/partner-form";
import { prisma } from "@/lib/prisma";
import { updateSupplier } from "../../actions";

export const dynamic = "force-dynamic";

export default async function EditSupplierPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const { error } = await searchParams;

  const supplier = await prisma.supplier.findUnique({ where: { id } });
  if (!supplier) notFound();

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
          Tedarikçiyi Düzenle
        </h1>
        <p className="text-sm text-slate-500">{supplier.name}</p>
      </div>

      <PartnerForm
        action={updateSupplier.bind(null, supplier.id)}
        defaults={supplier}
        submitLabel="Değişiklikleri Kaydet"
        error={error}
      />
    </div>
  );
}
