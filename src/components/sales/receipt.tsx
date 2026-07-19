"use client";

import { Printer, Plus } from "lucide-react";
import { paymentMethodLabels, type paymentMethods } from "@/lib/validation/sale";

const currency = (value: number) =>
  value.toLocaleString("tr-TR", { style: "currency", currency: "TRY" });

const dateFormatter = new Intl.DateTimeFormat("tr-TR", {
  dateStyle: "short",
  timeStyle: "short",
});

export type ReceiptData = {
  saleNumber: string;
  date: Date;
  items: { name: string; unitPrice: number; quantity: number }[];
  subtotal: number;
  discount: number;
  vatTotal: number;
  total: number;
  paymentMethod: (typeof paymentMethods)[number];
  cashReceived?: number;
  changeDue?: number;
};

export function Receipt({
  receipt,
  onNewSale,
}: {
  receipt: ReceiptData;
  onNewSale: () => void;
}) {
  return (
    <div className="mx-auto max-w-sm space-y-4">
      <div className="rounded-lg border border-slate-200 bg-white p-6 font-mono text-sm">
        <div className="text-center">
          <p className="text-base font-bold">İkizler Tobacco</p>
          <p className="text-xs text-slate-500">Satış Fişi</p>
        </div>
        <div className="my-3 border-t border-dashed border-slate-300" />
        <div className="flex justify-between text-xs text-slate-600">
          <span>{receipt.saleNumber}</span>
          <span>{dateFormatter.format(receipt.date)}</span>
        </div>
        <div className="my-3 border-t border-dashed border-slate-300" />
        <div className="space-y-1.5">
          {receipt.items.map((item) => (
            <div key={item.name} className="flex justify-between gap-2">
              <span className="flex-1 truncate">
                {item.name} x{item.quantity}
              </span>
              <span>{currency(item.unitPrice * item.quantity)}</span>
            </div>
          ))}
        </div>
        <div className="my-3 border-t border-dashed border-slate-300" />
        <div className="space-y-1">
          <div className="flex justify-between">
            <span>Ara Toplam</span>
            <span>{currency(receipt.subtotal)}</span>
          </div>
          {receipt.discount > 0 && (
            <div className="flex justify-between">
              <span>İndirim</span>
              <span>-{currency(receipt.discount)}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span>KDV (dahil)</span>
            <span>{currency(receipt.vatTotal)}</span>
          </div>
          <div className="flex justify-between text-base font-bold">
            <span>Toplam</span>
            <span>{currency(receipt.total)}</span>
          </div>
        </div>
        <div className="my-3 border-t border-dashed border-slate-300" />
        <div className="space-y-1">
          <div className="flex justify-between">
            <span>Ödeme</span>
            <span>{paymentMethodLabels[receipt.paymentMethod]}</span>
          </div>
          {receipt.cashReceived != null && (
            <div className="flex justify-between">
              <span>Alınan Nakit</span>
              <span>{currency(receipt.cashReceived)}</span>
            </div>
          )}
          {receipt.changeDue != null && receipt.changeDue > 0 && (
            <div className="flex justify-between">
              <span>Para Üstü</span>
              <span>{currency(receipt.changeDue)}</span>
            </div>
          )}
        </div>
        <div className="my-3 border-t border-dashed border-slate-300" />
        <p className="text-center text-xs text-slate-500">Teşekkür ederiz!</p>
      </div>

      <div className="flex gap-3 print:hidden">
        <button
          type="button"
          onClick={() => window.print()}
          className="flex flex-1 items-center justify-center gap-2 rounded-md border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          <Printer className="h-4 w-4" />
          Fişi Yazdır
        </button>
        <button
          type="button"
          onClick={onNewSale}
          className="flex flex-1 items-center justify-center gap-2 rounded-md bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
        >
          <Plus className="h-4 w-4" />
          Yeni Satış
        </button>
      </div>
    </div>
  );
}
