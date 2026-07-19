import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  ShoppingCart,
  ClipboardEdit,
  Package,
  Truck,
  Users,
  Building2,
  Wallet,
  Barcode,
  TrendingDown,
  TrendingUp,
  FileText,
  BarChart3,
  UserCog,
  Shield,
  KeyRound,
  ScrollText,
  Bell,
  Settings,
} from "lucide-react";

export type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
};

export type NavSection = {
  title: string;
  items: NavItem[];
};

// Shown as-is: this is what a shop owner actually touches day to day.
export const primaryNavSections: NavSection[] = [
  {
    title: "Genel",
    items: [
      { label: "Dashboard", href: "/", icon: LayoutDashboard },
      { label: "Satış Yap", href: "/sales", icon: ShoppingCart },
      { label: "Stok / Fiyat Girişi", href: "/inventory/stock-entry", icon: ClipboardEdit },
    ],
  },
  {
    title: "Dükkan",
    items: [
      { label: "Ürün Listesi", href: "/inventory", icon: Package },
      { label: "Satın Alma", href: "/purchases", icon: Truck },
      { label: "Müşteriler", href: "/customers", icon: Users },
      { label: "Tedarikçiler", href: "/suppliers", icon: Building2 },
      { label: "Kasa", href: "/cash-register", icon: Wallet },
      { label: "Barkod", href: "/barcode", icon: Barcode },
    ],
  },
  {
    title: "Finans",
    items: [
      { label: "Giderler", href: "/expenses", icon: TrendingDown },
      { label: "Gelirler", href: "/income", icon: TrendingUp },
      { label: "Faturalar", href: "/invoices", icon: FileText },
      { label: "Raporlar", href: "/reports", icon: BarChart3 },
    ],
  },
];

// Tucked under a collapsed "Gelişmiş" disclosure — RBAC/audit/settings that a
// single shop owner will rarely, if ever, need to open.
export const advancedNavSection: NavSection = {
  title: "Gelişmiş",
  items: [
    { label: "Depo", href: "/warehouse", icon: Building2 },
    { label: "Kullanıcılar", href: "/users", icon: UserCog },
    { label: "Roller", href: "/roles", icon: Shield },
    { label: "İzinler", href: "/permissions", icon: KeyRound },
    { label: "Denetim Kayıtları", href: "/audit-logs", icon: ScrollText },
    { label: "Bildirimler", href: "/notifications", icon: Bell },
    { label: "Ayarlar", href: "/settings", icon: Settings },
  ],
};
