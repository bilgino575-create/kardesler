"use client";

import { useMemo, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { Search, Plus, Minus, Trash2, ShoppingCart, PackagePlus, UserPlus, History, Star } from "lucide-react";
import { toast } from "sonner";
import {
  completeSale,
  quickAddProduct,
  quickAddCustomer,
} from "@/app/(dashboard)/sales/actions";
import { paymentMethods, paymentMethodLabels } from "@/lib/validation/sale";
import { Receipt, type ReceiptData } from "@/components/sales/receipt";

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
  categoryName: string;
  unit: string;
};

const AGE_RESTRICTED_PATTERN = /sigara|tütün|tutun|nargile/i;
const WEIGHT_UNITS = new Set(["GRAM", "KG"]);
const unitLabel = (unit: string) => (unit === "GRAM" ? "gr" : unit === "KG" ? "kg" : "adet");

const currency = (value: number) =>
  value.toLocaleString("tr-TR", { style: "currency", currency: "TRY" });

const round2 = (value: number) => Math.round(value * 100) / 100;

export function PosScreen({
  products,
  customers,
  favoriteProductIds,
}: {
  products: PosProduct[];
  customers: Customer[];
  favoriteProductIds: string[];
}) {
  const [localProducts, setLocalProducts] = useState(products);
  const [localCustomers, setLocalCustomers] = useState(customers);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [discount, setDiscount] = useState(0);
  const [paymentMethod, setPaymentMethod] =
    useState<(typeof paymentMethods)[number]>("CASH");
  const [customerId, setCustomerId] = useState("");
  const [cashReceived, setCashReceived] = useState("");
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [quickName, setQuickName] = useState("");
  const [quickPrice, setQuickPrice] = useState("");
  const [quickQty, setQuickQty] = useState("1");
  const [showQuickCustomer, setShowQuickCustomer] = useState(false);
  const [quickCustomerName, setQuickCustomerName] = useState("");
  const [quickCustomerPhone, setQuickCustomerPhone] = useState("");
  const [receipt, setReceipt] = useState<ReceiptData | null>(null);
  const [ageVerified, setAgeVerified] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [isQuickAdding, startQuickAddTransition] = useTransition();
  const [isQuickAddingCustomer, startQuickAddCustomerTransition] = useTransition();
  const searchInputRef = useRef<HTMLInputElement>(null);

  const categories = useMemo(
    () => Array.from(new Set(localProducts.map((p) => p.categoryName))).sort(),
    [localProducts],
  );

  const favoriteProducts = useMemo(() => {
    const productMap = new Map(localProducts.map((p) => [p.id, p]));
    return favoriteProductIds
      .map((id) => productMap.get(id))
      .filter((p): p is PosProduct => Boolean(p));
  }, [localProducts, favoriteProductIds]);

  const filteredProducts = useMemo(() => {
    const q = search.trim().toLowerCase();
    return localProducts
      .filter((product) =>
        selectedCategory ? product.categoryName === selectedCategory : true,
      )
      .filter((product) =>
        q
          ? product.name.toLowerCase().includes(q) ||
            product.sku.toLowerCase().includes(q) ||
            (product.barcode ?? "").toLowerCase().includes(q)
          : true,
      )
      .slice(0, 60);
  }, [localProducts, search, selectedCategory]);

  const hasAgeRestrictedItem = cart.some((item) =>
    AGE_RESTRICTED_PATTERN.test(item.categoryName),
  );

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
  const cashReceivedValue = Number(cashReceived) || 0;
  const changeDue = round2(cashReceivedValue - total);

  function addToCart(product: PosProduct) {
    if (product.stock <= 0) {
      toast.error(`"${product.name}" stokta yok.`);
      return;
    }
    const isWeight = WEIGHT_UNITS.has(product.unit);
    setCart((prev) => {
      const existing = prev.find((item) => item.productId === product.id);
      if (existing) {
        if (isWeight) return prev;
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
      const defaultQuantity = isWeight
        ? Math.min(product.unit === "KG" ? 1 : 50, product.stock)
        : 1;
      return [
        ...prev,
        {
          productId: product.id,
          name: product.name,
          unitPrice: product.salePrice,
          vat: product.vat,
          quantity: defaultQuantity,
          stock: product.stock,
          categoryName: product.categoryName,
          unit: product.unit,
        },
      ];
    });
  }

  function handleSearchKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key !== "Enter") return;
    event.preventDefault();
    const q = search.trim().toLowerCase();
    if (!q) return;

    const exactMatch = localProducts.find(
      (product) =>
        product.barcode?.toLowerCase() === q || product.sku.toLowerCase() === q,
    );
    const target = exactMatch ?? (filteredProducts.length === 1 ? filteredProducts[0] : null);

    if (target) {
      addToCart(target);
      setSearch("");
    } else {
      toast.error("Bu barkod/kod ile eşleşen ürün yok.");
    }
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

  function setQuantity(productId: string, value: number) {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.productId !== productId) return item;
          if (!Number.isFinite(value) || value < 0) return item;
          if (value > item.stock) {
            toast.error(`Stokta ${item.stock} ${unitLabel(item.unit)} var.`);
            return { ...item, quantity: item.stock };
          }
          return { ...item, quantity: value };
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
    setCashReceived("");
    setAgeVerified(false);
  }

  function handleQuickAdd() {
    const name = quickName.trim();
    const price = Number(quickPrice);
    const quantity = Number(quickQty);

    if (!name) {
      toast.error("Ürün adı girin.");
      return;
    }
    if (!Number.isFinite(price) || price < 0) {
      toast.error("Geçerli bir fiyat girin.");
      return;
    }
    if (!Number.isInteger(quantity) || quantity < 1) {
      toast.error("Geçerli bir adet girin.");
      return;
    }

    startQuickAddTransition(async () => {
      const result = await quickAddProduct(name, price, quantity);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      setLocalProducts((prev) => [result.product, ...prev]);
      addToCart(result.product);
      toast.success(`"${result.product.name}" eklendi ve sepete kondu.`);
      setQuickName("");
      setQuickPrice("");
      setQuickQty("1");
      setShowQuickAdd(false);
    });
  }

  function handleQuickAddCustomer() {
    const name = quickCustomerName.trim();
    if (!name) {
      toast.error("Müşteri adı girin.");
      return;
    }
    startQuickAddCustomerTransition(async () => {
      const result = await quickAddCustomer(name, quickCustomerPhone);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      setLocalCustomers((prev) => [...prev, result.customer]);
      setCustomerId(result.customer.id);
      toast.success(`"${result.customer.name}" eklendi.`);
      setQuickCustomerName("");
      setQuickCustomerPhone("");
      setShowQuickCustomer(false);
    });
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
    if (paymentMethod === "CASH" && cashReceived && cashReceivedValue < total) {
      toast.error("Alınan nakit toplam tutardan az.");
      return;
    }
    if (hasAgeRestrictedItem && !ageVerified) {
      toast.error("Tütün ürünü satışı için 18 yaş kontrolünü onaylayın.");
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
        setReceipt({
          saleNumber: result.saleNumber,
          date: new Date(),
          items: cart.map((item) => ({
            name: item.name,
            unitPrice: item.unitPrice,
            quantity: item.quantity,
          })),
          subtotal,
          discount: safeDiscount,
          vatTotal,
          total,
          paymentMethod,
          cashReceived: paymentMethod === "CASH" ? cashReceivedValue || total : undefined,
          changeDue: paymentMethod === "CASH" ? Math.max(0, changeDue) : undefined,
        });
        resetCart();
      } else {
        toast.error(result.error);
      }
    });
  }

  function handleNewSale() {
    setReceipt(null);
    searchInputRef.current?.focus();
  }

  if (receipt) {
    return <Receipt receipt={receipt} onNewSale={handleNewSale} />;
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_380px]">
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              ref={searchInputRef}
              type="search"
              autoFocus
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              onKeyDown={handleSearchKeyDown}
              placeholder="Ürün adı yazın ya da barkodu okutup Enter'a basın..."
              className="w-full rounded-md border border-slate-300 bg-white py-2.5 pl-9 pr-3 text-sm focus:border-slate-500 focus:outline-none"
            />
          </div>
          <Link
            href="/sales/history"
            className="inline-flex shrink-0 items-center gap-1.5 rounded-md border border-slate-300 bg-white px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
          >
            <History className="h-4 w-4" />
            Geçmiş Satışlar
          </Link>
        </div>

        {favoriteProducts.length > 0 && (
          <div>
            <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400">
              <Star className="h-3.5 w-3.5" />
              Sık Satılanlar
            </p>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {favoriteProducts.map((product) => (
                <button
                  key={product.id}
                  type="button"
                  onClick={() => addToCart(product)}
                  disabled={product.stock <= 0}
                  className="flex shrink-0 flex-col items-start rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-left hover:border-amber-400 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <span className="max-w-32 truncate text-xs font-medium text-slate-900">
                    {product.name}
                  </span>
                  <span className="text-xs font-semibold text-amber-700">
                    {currency(product.salePrice)}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setSelectedCategory(null)}
            className={`rounded-full border px-3 py-1 text-xs font-medium ${
              selectedCategory === null
                ? "border-slate-900 bg-slate-900 text-white"
                : "border-slate-200 bg-white text-slate-600 hover:border-slate-400"
            }`}
          >
            Tümü
          </button>
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() =>
                setSelectedCategory((prev) => (prev === category ? null : category))
              }
              className={`rounded-full border px-3 py-1 text-xs font-medium ${
                selectedCategory === category
                  ? "border-slate-900 bg-slate-900 text-white"
                  : "border-slate-200 bg-white text-slate-600 hover:border-slate-400"
              }`}
            >
              {category}
            </button>
          ))}
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
                {WEIGHT_UNITS.has(product.unit) && (
                  <span className="text-xs font-normal text-slate-400">
                    {" "}
                    / {unitLabel(product.unit)}
                  </span>
                )}
              </span>
              <span className="text-xs text-slate-400">
                Stok: {product.stock} {unitLabel(product.unit)}
              </span>
            </button>
          ))}
          {filteredProducts.length === 0 && (
            <p className="col-span-full py-10 text-center text-sm text-slate-400">
              Ürün bulunamadı.
            </p>
          )}
        </div>

        <div className="rounded-lg border border-dashed border-slate-300 bg-white p-3">
          {showQuickAdd ? (
            <div className="space-y-2">
              <p className="flex items-center gap-1.5 text-sm font-medium text-slate-700">
                <PackagePlus className="h-4 w-4" />
                Listede Olmayan Ürünü Sat
              </p>
              <div className="flex flex-wrap gap-2">
                <input
                  type="text"
                  placeholder="Ürün adı"
                  value={quickName}
                  onChange={(event) => setQuickName(event.target.value)}
                  className="min-w-40 flex-1 rounded-md border border-slate-300 px-2 py-1.5 text-sm"
                />
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="Fiyat (₺)"
                  value={quickPrice}
                  onChange={(event) => setQuickPrice(event.target.value)}
                  className="w-28 rounded-md border border-slate-300 px-2 py-1.5 text-sm"
                />
                <input
                  type="number"
                  min="1"
                  step="1"
                  placeholder="Adet"
                  value={quickQty}
                  onChange={(event) => setQuickQty(event.target.value)}
                  className="w-20 rounded-md border border-slate-300 px-2 py-1.5 text-sm"
                />
                <button
                  type="button"
                  onClick={handleQuickAdd}
                  disabled={isQuickAdding}
                  className="rounded-md bg-slate-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50"
                >
                  {isQuickAdding ? "Ekleniyor..." : "Sepete Ekle"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowQuickAdd(false)}
                  className="rounded-md px-3 py-1.5 text-sm text-slate-500 hover:bg-slate-50"
                >
                  Vazgeç
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowQuickAdd(true)}
              className="flex w-full items-center justify-center gap-1.5 py-1 text-sm font-medium text-slate-500 hover:text-slate-900"
            >
              <PackagePlus className="h-4 w-4" />
              Listede olmayan bir ürünü satmam gerekiyor
            </button>
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
          {cart.map((item) => {
            const isWeight = WEIGHT_UNITS.has(item.unit);
            return (
              <div key={item.productId} className="flex items-center gap-2 px-4 py-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-slate-900">
                    {item.name}
                  </p>
                  <p className="text-xs text-slate-400">
                    {currency(item.unitPrice)} / {unitLabel(item.unit)} x{" "}
                    {item.quantity} {unitLabel(item.unit)}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  {isWeight ? (
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        min="1"
                        step="1"
                        value={item.quantity}
                        onChange={(event) =>
                          setQuantity(item.productId, Number(event.target.value))
                        }
                        className="w-16 rounded border border-slate-300 px-1.5 py-1 text-center text-sm"
                      />
                      <span className="text-xs text-slate-400">
                        {unitLabel(item.unit)}
                      </span>
                    </div>
                  ) : (
                    <>
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
                    </>
                  )}
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
            );
          })}
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

          {hasAgeRestrictedItem && (
            <label className="flex items-start gap-2 rounded-md bg-amber-50 p-3 text-sm text-amber-800">
              <input
                type="checkbox"
                checked={ageVerified}
                onChange={(event) => setAgeVerified(event.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-amber-400"
              />
              <span>Tütün ürünü satılıyor — 18 yaş kontrolü yapıldı</span>
            </label>
          )}

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

          {paymentMethod === "CASH" && (
            <div className="space-y-2 rounded-md bg-slate-50 p-3">
              <label className="flex items-center justify-between text-sm">
                <span className="text-slate-600">Alınan Nakit</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={cashReceived}
                  onChange={(event) => setCashReceived(event.target.value)}
                  placeholder={total.toFixed(2)}
                  className="w-28 rounded-md border border-slate-300 px-2 py-1 text-right text-sm focus:border-slate-500 focus:outline-none"
                />
              </label>
              {cashReceived && (
                <div className="flex items-center justify-between text-sm font-medium">
                  <span className="text-slate-600">
                    {changeDue >= 0 ? "Para Üstü" : "Eksik"}
                  </span>
                  <span className={changeDue >= 0 ? "text-emerald-600" : "text-red-600"}>
                    {currency(Math.abs(changeDue))}
                  </span>
                </div>
              )}
            </div>
          )}

          {paymentMethod === "CREDIT" && (
            <div className="space-y-2">
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
                  {localCustomers.map((customer) => (
                    <option key={customer.id} value={customer.id}>
                      {customer.name}
                    </option>
                  ))}
                </select>
              </label>

              {showQuickCustomer ? (
                <div className="space-y-2 rounded-md bg-slate-50 p-2">
                  <input
                    type="text"
                    placeholder="Müşteri adı"
                    value={quickCustomerName}
                    onChange={(event) => setQuickCustomerName(event.target.value)}
                    className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm"
                  />
                  <input
                    type="text"
                    placeholder="Telefon (opsiyonel)"
                    value={quickCustomerPhone}
                    onChange={(event) => setQuickCustomerPhone(event.target.value)}
                    className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm"
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={handleQuickAddCustomer}
                      disabled={isQuickAddingCustomer}
                      className="flex-1 rounded-md bg-slate-900 py-1.5 text-xs font-medium text-white hover:bg-slate-800 disabled:opacity-50"
                    >
                      {isQuickAddingCustomer ? "Ekleniyor..." : "Müşteriyi Ekle"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowQuickCustomer(false)}
                      className="rounded-md px-3 py-1.5 text-xs text-slate-500 hover:bg-slate-100"
                    >
                      Vazgeç
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowQuickCustomer(true)}
                  className="flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-900"
                >
                  <UserPlus className="h-3.5 w-3.5" />
                  Yeni müşteri ekle
                </button>
              )}
            </div>
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
