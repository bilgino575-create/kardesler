"use client";

import { useMemo, useState, useTransition } from "react";
import { Search, Plus, Minus, Trash2, ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import { completeSale } from "@/app/(dashboard)/sales/actions";
import { paymentMethods, paymentMethodLabels } from "@/lib/validation/sale";

type PosProduct = {
  id: string;
  name: string;
  barcode: string | null;
  sku: string;
  salePrice: number;
  vat: number;
  stock: number;
  unit: string;
  categoryName: string;
};

type Customer = { id: string; name: string };

type CartItem = {
  productId: string;
  name: string;
  unitPrice: number;
  vat: number;
  quantity: number;
  stock: number;
};

const currency = (value: number) =>
  value.toLocaleString("tr-TR", { style: "currency", currency: "TRY" });

const round2 = (value: number) => Math.round(value * 100) / 100;

export function PosScreen({
  products,
  customers,
}: {
  products: PosProduct[];
  customers: Customer[];
}) {
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [discount, setDiscount] = useState(0);
  const [paymentMethod, setPaymentMethod] =
    useState<(typeof paymentMethods)[number]>("CASH");
  const [customerId, setCustomerId] = useState("");
  const [isPending, startTransition] = useTransition();

  const filteredProducts = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return products.slice(0, 40);
    return products
      .filter(
        (product) =>
          product.name.toLowerCase().includes(q) ||
          product.sku.toLowerCase().includes(q) ||
          (product.barcode ?? "").toLowerCase().includes(q),
      )
      .slice(0, 40);
  }, [products, search]);

  const subtotal = round2(
    cart.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0),
  );
  const vatTotal = round2(
    cart.reduce((sum, item) => {
      const lineTotal = item.unitPrice * item.quantity;
      return sum + round2((lineTotal * item.vat) / (100 + item.vat));
    }, 0),
  );
  const safeDiscount = Math.min(discount, subtotal);
  const total = round2(subtotal - safeDiscount);

  function addToCart(product: PosProduct) {
    if (product.stock <= 0) {
      toast.error(`"${product.name}" stokta yok.`);
      return;
    }
    setCart((prev) => {
      const existing = prev.find((item) => item.productId === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) {
          toast.error("Stok limitine ulaşıldı.");
          return prev;
        }
        return prev.map((item) =>
          item.productId === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        );
      }
      return [
        ...prev,
        {
          productId: product.id,
          name: product.name,
          unitPrice: product.salePrice,
          vat: product.vat,
          quantity: 1,
          stock: product.stock,
        },
      ];
    });
  }

  function updateQuantity(productId: string, delta: number) {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.productId !== productId) return item;
          const nextQuantity = item.quantity + delta;
          if (nextQuantity > item.stock) {
            toast.error("Stok limitine ulaşıldı.");
            return item;
          }
          return { ...item, quantity: nextQuantity };
        })
        .filter((item) => item.quantity > 0),
    );
  }

  function removeItem(productId: string) {
    setCart((prev) => prev.filter((item) => item.productId !== productId));
  }

  function resetCart() {
    setCart([]);
    setDiscount(0);
    setCustomerId("");
    setPaymentMethod("CASH");
  }

  function handleCheckout() {
    if (cart.length === 0) {
      toast.error("Sepet boş.");
      return;
    }
    if (paymentMethod === "CREDIT" && !customerId) {
      toast.error("Veresiye satış için müşteri seçin.");
      return;
    }

    startTransition(async () => {
      const result = await completeSale({
        items: cart.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
        discount: safeDiscount,
        paymentMethod,
        customerId: customerId || undefined,
      });

      if (result.success) {
        toast.success(`Satış tamamlandı: ${result.saleNumber}`);
        resetCart();
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_380px]">
      <div className="space-y-4">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            autoFocus
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Ürün adı, barkod veya SKU ile ara..."
            className="w-full rounded-md border border-slate-300 bg-white py-2.5 pl-9 pr-3 text-sm focus:border-slate-500 focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
          {filteredProducts.map((product) => (
            <button
              key={product.id}
              type="button"
              onClick={() => addToCart(product)}
              disabled={product.stock <= 0}
              className="flex flex-col rounded-lg border border-slate-200 bg-white p-3 text-left hover:border-slate-400 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <span className="text-xs text-slate-400">
                {product.categoryName}
              </span>
              <span className="mt-1 line-clamp-2 text-sm font-medium text-slate-900">
                {product.name}
              </span>
              <span className="mt-2 text-sm font-semibold text-slate-900">
                {currency(product.salePrice)}
              </span>
              <span className="text-xs text-slate-400">
                Stok: {product.stock}
              </span>
            </button>
          ))}
          {filteredProducts.length === 0 && (
            <p className="col-span-full py-10 text-center text-sm text-slate-400">
              Ürün bulunamadı.
            </p>
          )}
        </div>
      </div>

      <div className="flex h-fit flex-col rounded-lg border border-slate-200 bg-white">
        <div className="flex items-center gap-2 border-b border-slate-200 px-4 py-3">
          <ShoppingCart className="h-4 w-4 text-slate-500" />
          <h2 className="text-sm font-semibold text-slate-900">Sepet</h2>
          <span className="ml-auto text-xs text-slate-400">
            {cart.length} kalem
          </span>
        </div>

        <div className="max-h-96 divide-y divide-slate-100 overflow-y-auto">
          {cart.map((item) => (
            <div key={item.productId} className="flex items-center gap-2 px-4 py-3">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-slate-900">
                  {item.name}
                </p>
                <p className="text-xs text-slate-400">
                  {currency(item.unitPrice)} x {item.quantity}
                </p>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => updateQuantity(item.productId, -1)}
                  className="rounded border border-slate-200 p-1 hover:bg-slate-50"
                  aria-label="Azalt"
                >
                  <Minus className="h-3 w-3" />
                </button>
                <span className="w-6 text-center text-sm">{item.quantity}</span>
                <button
                  type="button"
                  onClick={() => updateQuantity(item.productId, 1)}
                  className="rounded border border-slate-200 p-1 hover:bg-slate-50"
                  aria-label="Artır"
                >
                  <Plus className="h-3 w-3" />
                </button>
                <button
                  type="button"
                  onClick={() => removeItem(item.productId)}
                  className="ml-1 rounded p-1 text-red-500 hover:bg-red-50"
                  aria-label="Kaldır"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
          {cart.length === 0 && (
            <p className="px-4 py-10 text-center text-sm text-slate-400">
              Sepet boş. Ürüne tıklayarak ekleyin.
            </p>
          )}
        </div>

        <div className="space-y-3 border-t border-slate-200 px-4 py-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-500">Ara Toplam</span>
            <span className="text-slate-900">{currency(subtotal)}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-500">KDV (dahil)</span>
            <span className="text-slate-900">{currency(vatTotal)}</span>
          </div>
          <label className="flex items-center justify-between text-sm">
            <span className="text-slate-500">İndirim (₺)</span>
            <input
              type="number"
              min="0"
              step="0.01"
              value={discount}
              onChange={(event) => setDiscount(Number(event.target.value) || 0)}
              className="w-24 rounded-md border border-slate-300 px-2 py-1 text-right text-sm focus:border-slate-500 focus:outline-none"
            />
          </label>
          <div className="flex items-center justify-between border-t border-slate-100 pt-3 text-base font-semibold">
            <span className="text-slate-900">Toplam</span>
            <span className="text-slate-900">{currency(total)}</span>
          </div>

          <label className="block text-sm">
            <span className="mb-1 block text-xs font-medium text-slate-500">
              Ödeme Yöntemi
            </span>
            <select
              value={paymentMethod}
              onChange={(event) =>
                setPaymentMethod(
                  event.target.value as (typeof paymentMethods)[number],
                )
              }
              className="input"
            >
              {paymentMethods.map((method) => (
                <option key={method} value={method}>
                  {paymentMethodLabels[method]}
                </option>
              ))}
            </select>
          </label>

          {paymentMethod === "CREDIT" && (
            <label className="block text-sm">
              <span className="mb-1 block text-xs font-medium text-slate-500">
                Müşteri
              </span>
              <select
                value={customerId}
                onChange={(event) => setCustomerId(event.target.value)}
                className="input"
              >
                <option value="">Müşteri seçin</option>
                {customers.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name}
                  </option>
                ))}
              </select>
            </label>
          )}

          <button
            type="button"
            onClick={handleCheckout}
            disabled={isPending || cart.length === 0}
            className="w-full rounded-md bg-slate-900 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50"
          >
            {isPending ? "İşleniyor..." : "Satışı Tamamla"}
          </button>
        </div>
      </div>
    </div>
  );
}
