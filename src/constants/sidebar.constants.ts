import type { LucideIcon } from 'lucide-react';
import {
  Building2,
  Users,
  FileText,
  Home,
  Settings,
  BarChart3,
  UserCog,
  LayoutDashboard,
  Receipt,
  HandCoins,
  Mail,
  Wrench,
} from 'lucide-react';

export type NavChild = {
  title: string;
  href: string;
  icon?: LucideIcon;
  disabled?: boolean;
};

export type NavItem = {
  title: string;
  icon?: LucideIcon;
  href?: string;
  children?: NavChild[];
  disabled?: boolean;
};

export const SIDEBAR_ITEMS: NavItem[] = [
  { title: 'Panel de Control', icon: LayoutDashboard, href: '/admin' },
  { title: 'Propiedades', icon: Building2, href: '/admin/properties' },
  { title: 'Clientes', icon: Users, href: '/admin/clients' },
  { title: 'Ofertas', icon: FileText, href: '/admin/offers' },
  {
    title: 'Alquileres',
    icon: Home,
    children: [
      {
        title: 'Admin de Alquileres',
        href: '/admin/rentals',
        icon: Home,
      },
      {
        title: 'Historial de Pagos',
        href: '/admin/rentals/payments',
        icon: Receipt,
      },
      {
        title: 'Historial de Entregas',
        href: '/admin/rentals/deliveries',
        icon: HandCoins,
      },
    ],
  },
  { title: 'Recibos Generales', icon: FileText, href: '/admin/general-receipts' },
  { title: 'Reportes', icon: BarChart3, href: '/admin/reports' },
  {
    title: 'Suscriptores',
    icon: Mail,
    href: '/admin/subscribers',
  },
  {
    title: 'Utilidades',
    icon: Wrench,
    children: [
      {
        title: 'Calculadora de Alquileres',
        href: '/admin/utilities/rent-calculator',
        icon: BarChart3,
      },
      {
        title: 'Generar CUIL',
        href: '/admin/utilities/cuil-generator',
        icon: Users,
      },
      {
        title: 'Antecedentes Crediticios',
        href: '/admin/utilities/credit-report',
        icon: FileText,
      },
    ],
  },
  {
    title: 'Configuración',
    icon: Settings,
    children: [
      {
        title: 'Usuarios',
        href: '/admin/users',
        icon: UserCog,
      },
      {
        title: 'Configuración',
        href: '/admin/settings',
        icon: Settings,
      },
    ],
  },
];

export const SIDEBAR_CL = {
  brandVar: '[--brand:#600096]',
  root:
    'text-white overflow-visible border-r ' +
    'bg-[var(--brand)] border-[var(--brand)] ' +
    '[--sidebar:var(--brand)] ' +
    '[--sidebar-foreground:#ffffff] ' +
    '[--sidebar-border:rgba(255_255_255_/_0.10)] ' +
    '[--sidebar-accent:rgba(255,255,255,0.08)] ' +
    '[--sidebar-accent-foreground:#ffffff] ' +
    '[--sidebar-ring:rgba(255,255,255,0.20)]',
  btnBase: 'text-white/90 hover:text-white hover:bg-white/10',
  subBase: 'text-white/90 hover:text-white',
  btnActiveInvert: 'bg-white text-[#600096] font-semibold',
  btnDisabled:
    'opacity-45 cursor-default hover:cursor-not-allowed hover:bg-transparent hover:text-white/90',
  subDisabled:
    'opacity-60 cursor-default hover:cursor-not-allowed hover:bg-transparent text-white/70',
  subDisabledFlyout:
    'opacity-60 cursor-default hover:cursor-not-allowed hover:bg-transparent text-[var(--brand)]/60',
  icon: 'size-4 text-current [--sidebar-accent-foreground:currentColor]',
  chevron: 'size-4 transition-transform duration-200',
  headerBorder: 'border-b border-white/10',
  footerBorder: 'border-t border-white/10',
  flyoutActive: 'bg-white font-semibold text-[var(--brand)]',
  subActive:
    'bg-white !text-[#600096] font-semibold border border-white/80 ' +
    'hover:bg-white/10 hover:!text-white hover:border-transparent',
};

const EXACT_MATCH_ROUTES = ['/admin', '/admin/rentals'];

export const isActive = (pathname: string, href?: string) => {
  if (!href) return false;
  if (pathname === href) return true;

  if (EXACT_MATCH_ROUTES.includes(href)) {
    return pathname === href + '/';
  }

  return pathname.startsWith(href + '/');
};
