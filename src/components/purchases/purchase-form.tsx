"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { createPurchase } from "@/app/(dashboard)/purchases/actions";

type PurchaseProduct = {
  id: string;
  name: string;
  sku: string;
  barcode: string | null;
  purchasePrice: number;
};

type Supplier = { id: string; name: string };

type Line = {
  productId: string;
  name: string;
  quantity: number;
  unitCost: number;
};

const currency = (value: number) =>
  value.toLocaleString("tr-TR", { style: "currency", currency: "TRY" });

export function PurchaseForm({
  products,
  suppliers,
  initialProductId,
}: {
  products: PurchaseProduct[];
  suppliers: Supplier[];
  initialProductId?: string;
}) {
  const router = useRouter();
  const [supplierId, setSupplierId] = useState("");
  const [search, setSearch] = useState("");
  const [lines, setLines] = useState<Line[]>(() => {
    const product = products.find((p) => p.id === initialProductId);
    if (!product) return [];
    return [
      {
        productId: product.id,
        name: product.name,
        quantity: 1,
        unitCost: product.purchasePrice,
      },
    ];
  });
  const [isPending, startTransition] = useTransition();

  const filteredProducts = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return products.slice(0, 20);
    return products
      .filter(
        (product) =>
          product.name.toLowerCase().includes(q) ||
          product.sku.toLowerCase().includes(q) ||
          (product.barcode ?? "").toLowerCase().includes(q),
      )
      .slice(0, 20);
  }, [products, search]);

  const total = lines.reduce((sum, line) => sum + line.quantity * line.unitCost, 0);

  function addLine(product: PurchaseProduct) {
    setLines((prev) => {
      if (prev.some((line) => line.productId === product.id)) return prev;
      return [
        ...prev,
        {
          productId: product.id,
          name: product.name,
          quantity: 1,
          unitCost: product.purchasePrice,
        },
      ];
    });
  }

  function updateLine(productId: string, patch: Partial<Line>) {
    setLines((prev) =>
      prev.map((line) =>
        line.productId === productId ? { ...line, ...patch } : line,
      ),
    );
  }

  function removeLine(productId: string) {
    setLines((prev) => prev.filter((line) => line.productId !== productId));
  }

  function handleSubmit() {
    if (!supplierId) {
      toast.error("Tedarikçi seçin.");
      return;
    }
    if (lines.length === 0) {
      toast.error("En az bir ürün ekleyin.");
      return;
    }

    startTransition(async () => {
      const result = await createPurchase({
        supplierId,
        items: lines.map((line) => ({
          productId: line.productId,
          quantity: line.quantity,
          unitCost: line.unitCost,
        })),
      });

      if (result.success) {
        toast.success(`Satın alma oluşturuldu: ${result.purchaseNumber}`);
        router.push("/purchases");
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_420px]">
      <div className="space-y-4">
        <label className="block max-w-sm text-sm">
          <span className="mb-1 block font-medium text-slate-700">
            Tedarikçi
          </span>
          <select
            value={supplierId}
            onChange={(event) => setSupplierId(event.target.value)}
            className="input"
          >
            <option value="">Tedarikçi seçin</option>
            {suppliers.map((supplier) => (
              <option key={supplier.id} value={supplier.id}>
                {supplier.name}
              </option>
            ))}
          </select>
        </label>

        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Ürün ara..."
            className="w-full rounded-md border border-slate-300 bg-white py-2.5 pl-9 pr-3 text-sm focus:border-slate-500 focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {filteredProducts.map((product) => (
            <button
              key={product.id}
              type="button"
              onClick={() => addLine(product)}
              className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2 text-left text-sm hover:border-slate-400"
            >
              <span className="truncate">{product.name}</span>
              <span className="ml-2 shrink-0 text-slate-400">
                {currency(product.purchasePrice)}
              </span>
            </button>
          ))}
          {filteredProducts.length === 0 && (
            <p className="col-span-full py-6 text-center text-sm text-slate-400">
              Ürün bulunamadı.
            </p>
          )}
        </div>
      </div>

      <div className="flex h-fit flex-col rounded-lg border border-slate-200 bg-white">
        <div className="border-b border-slate-200 px-4 py-3">
          <h2 className="text-sm font-semibold text-slate-900">
            Sipariş Kalemleri
          </h2>
        </div>
        <div className="max-h-96 divide-y divide-slate-100 overflow-y-auto">
          {lines.map((line) => (
            <div key={line.productId} className="space-y-2 px-4 py-3">
              <div className="flex items-center justify-between gap-2">
                <p className="truncate text-sm font-medium text-slate-900">
                  {line.name}
                </p>
                <button
                  type="button"
                  onClick={() => removeLine(line.productId)}
                  className="text-red-500 hover:text-red-700"
                  aria-label="Kaldır"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <label className="flex items-center gap-1">
                  <span className="text-xs text-slate-500">Adet</span>
                  <input
                    type="number"
                    min={1}
                    value={line.quantity}
                    onChange={(event) =>
                      updateLine(line.productId, {
                        quantity: Math.max(1, Number(event.target.value) || 1),
                      })
                    }
                    className="w-16 rounded border border-slate-300 px-2 py-1 text-sm"
                  />
                </label>
                <label className="flex items-center gap-1">
                  <span className="text-xs text-slate-500">Birim Maliyet</span>
                  <input
                    type="number"
                    min={0}
                    step="0.01"
                    value={line.unitCost}
                    onChange={(event) =>
                      updateLine(line.productId, {
                        unitCost: Math.max(0, Number(event.target.value) || 0),
                      })
                    }
                    className="w-24 rounded border border-slate-300 px-2 py-1 text-sm"
                  />
                </label>
                <span className="ml-auto font-medium text-slate-900">
                  {currency(line.quantity * line.unitCost)}
                </span>
              </div>
            </div>
          ))}
          {lines.length === 0 && (
            <p className="px-4 py-10 text-center text-sm text-slate-400">
              Henüz ürün eklenmedi.
            </p>
          )}
        </div>

        <div className="space-y-3 border-t border-slate-200 px-4 py-3">
          <div className="flex items-center justify-between text-base font-semibold">
            <span className="text-slate-900">Toplam</span>
            <span className="text-slate-900">{currency(total)}</span>
          </div>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isPending || lines.length === 0}
            className="w-full rounded-md bg-slate-900 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50"
          >
            {isPending ? "Kaydediliyor..." : "Siparişi Oluştur"}
          </button>
        </div>
      </div>
    </div>
  );
}
