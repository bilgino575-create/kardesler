import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Truck,
  Users,
  Building2,
  Wallet,
  TrendingDown,
  TrendingUp,
  FileText,
  Barcode,
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

export const navSections: NavSection[] = [
  {
    title: "Genel",
    items: [{ label: "Dashboard", href: "/", icon: LayoutDashboard }],
  },
  {
    title: "Operasyon",
    items: [
      { label: "Envanter", href: "/inventory", icon: Package },
      { label: "Satış", href: "/sales", icon: ShoppingCart },
      { label: "Satın Alma", href: "/purchases", icon: Truck },
      { label: "Müşteriler", href: "/customers", icon: Users },
      { label: "Tedarikçiler", href: "/suppliers", icon: Building2 },
      { label: "Depo", href: "/warehouse", icon: Building2 },
      { label: "Barkod", href: "/barcode", icon: Barcode },
    ],
  },
  {
    title: "Finans",
    items: [
      { label: "Kasa", href: "/cash-register", icon: Wallet },
      { label: "Giderler", href: "/expenses", icon: TrendingDown },
      { label: "Gelirler", href: "/income", icon: TrendingUp },
      { label: "Faturalar", href: "/invoices", icon: FileText },
      { label: "Raporlar", href: "/reports", icon: BarChart3 },
    ],
  },
  {
    title: "Yönetim",
    items: [
      { label: "Kullanıcılar", href: "/users", icon: UserCog },
      { label: "Roller", href: "/roles", icon: Shield },
      { label: "İzinler", href: "/permissions", icon: KeyRound },
      { label: "Denetim Kayıtları", href: "/audit-logs", icon: ScrollText },
      { label: "Bildirimler", href: "/notifications", icon: Bell },
      { label: "Ayarlar", href: "/settings", icon: Settings },
    ],
  },
];
