import { prisma } from "@/lib/prisma";
import { LedgerPage } from "@/components/ledger/ledger-page";
import { createIncome, deleteIncome } from "./actions";

export const dynamic = "force-dynamic";

const INCOME_CATEGORIES = ["Kira Geliri", "Hizmet Geliri", "Diğer"];

export default async function IncomePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  const entries = await prisma.income.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  const total = entries.reduce((sum, entry) => sum + Number(entry.amount), 0);

  return (
    <LedgerPage
      title="Gelirler"
      entries={entries.map((entry) => ({ ...entry, amount: Number(entry.amount) }))}
      total={total}
      categories={INCOME_CATEGORIES}
      createAction={createIncome}
      deleteAction={deleteIncome}
      error={error}
      amountTone="text-emerald-600"
    />
  );
}
