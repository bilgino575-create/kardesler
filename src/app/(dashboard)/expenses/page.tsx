import { prisma } from "@/lib/prisma";
import { LedgerPage } from "@/components/ledger/ledger-page";
import { createExpense, deleteExpense } from "./actions";

export const dynamic = "force-dynamic";

const EXPENSE_CATEGORIES = [
  "Kira",
  "Elektrik/Su/Doğalgaz",
  "Personel Maaşı",
  "Nakliye",
  "Vergi",
  "Diğer",
];

export default async function ExpensesPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  const entries = await prisma.expense.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  const total = entries.reduce((sum, entry) => sum + Number(entry.amount), 0);

  return (
    <LedgerPage
      title="Giderler"
      entries={entries.map((entry) => ({ ...entry, amount: Number(entry.amount) }))}
      total={total}
      categories={EXPENSE_CATEGORIES}
      createAction={createExpense}
      deleteAction={deleteExpense}
      error={error}
      amountTone="text-red-600"
    />
  );
}
