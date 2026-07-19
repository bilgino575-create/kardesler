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

// The only things a shop owner needs day to day — one flat list, no
// section headers, so there's nothing to figure out.
export const primaryNavItems: NavItem[] = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard },
  { label: "Satış Yap", href: "/sales", icon: ShoppingCart },
  { label: "Stok / Fiyat Girişi", href: "/inventory/stock-entry", icon: ClipboardEdit },
  { label: "Ürünler", href: "/inventory", icon: Package },
  { label: "Müşteriler", href: "/customers", icon: Users },
  { label: "Kasa", href: "/cash-register", icon: Wallet },
  { label: "Raporlar", href: "/reports", icon: BarChart3 },
];

// Everything else, tucked under a single collapsed "Diğer" disclosure.
export const otherNavSection: NavSection = {
  title: "Diğer",
  items: [
    { label: "Satın Alma", href: "/purchases", icon: Truck },
    { label: "Tedarikçiler", href: "/suppliers", icon: Building2 },
    { label: "Barkod", href: "/barcode", icon: Barcode },
    { label: "Giderler", href: "/expenses", icon: TrendingDown },
    { label: "Gelirler", href: "/income", icon: TrendingUp },
    { label: "Faturalar", href: "/invoices", icon: FileText },
    { label: "Depo", href: "/warehouse", icon: Building2 },
    { label: "Kullanıcılar", href: "/users", icon: UserCog },
    { label: "Roller", href: "/roles", icon: Shield },
    { label: "İzinler", href: "/permissions", icon: KeyRound },
    { label: "Denetim Kayıtları", href: "/audit-logs", icon: ScrollText },
    { label: "Bildirimler", href: "/notifications", icon: Bell },
    { label: "Ayarlar", href: "/settings", icon: Settings },
  ],
};
