'use client';

import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { cn } from '@/lib/shadcn/utils';
import { signOut } from 'next-auth/react';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';
import {
  Building2,
  ChevronDown,
  LogOut,
  User,
} from 'lucide-react';
import { SIDEBAR_ITEMS, SIDEBAR_CL, isActive } from '@/constants/sidebar.constants';
import { Button } from '@/components/ui/button';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { user } = useAuth();
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});

  const toggleGroup = (title: string) => {
    setOpenGroups(prev => ({
      ...prev,
      [title]: !prev[title]
    }));
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden" 
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <div className={cn(
        "fixed top-0 left-0 h-full w-64 bg-[#600096] text-white transform transition-transform duration-300 ease-in-out z-50",
        isOpen ? "translate-x-0" : "-translate-x-full",
        "lg:translate-x-0 lg:static lg:z-auto"
      )}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div className="flex items-center space-x-3">
            <img src="/favicon-32x32.png" alt="Polar Inmobiliaria" className="w-8 h-8 bg-white rounded-lg p-1" />
            <div>
              <h2 className="font-semibold text-white">Polar Inmobiliaria</h2>
              <p className="text-xs text-white/70">Panel Admin</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {SIDEBAR_ITEMS.map((item) => {
              const Icon = item.icon;
              const itemIsActive = isActive(pathname, item.href);
              const hasChildren = item.children && item.children.length > 0;
              const isGroupOpen = openGroups[item.title];

              return (
                <li key={item.title}>
                  {hasChildren ? (
                    <>
                      <button
                        onClick={() => toggleGroup(item.title)}
                        className={cn(
                          "w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                          SIDEBAR_CL.btnBase
                        )}
                      >
                        <div className="flex items-center space-x-3">
                          {Icon && <Icon className={SIDEBAR_CL.icon} />}
                          <span>{item.title}</span>
                        </div>
                        <ChevronDown className={cn(
                          SIDEBAR_CL.chevron,
                          isGroupOpen && "rotate-180"
                        )} />
                      </button>
                      
                      {isGroupOpen && (
                        <ul className="mt-2 ml-6 space-y-1">
                          {item.children?.map((child) => {
                            const ChildIcon = child.icon;
                            const childIsActive = isActive(pathname, child.href);
                            
                            return (
                              <li key={child.href}>
                                <Link
                                  href={child.href}
                                  onClick={onClose}
                                  className={cn(
                                    "flex items-center space-x-3 px-3 py-2 rounded-lg text-sm transition-colors",
                                    childIsActive ? SIDEBAR_CL.subActive : SIDEBAR_CL.subBase
                                  )}
                                >
                                  {ChildIcon && <ChildIcon className={SIDEBAR_CL.icon} />}
                                  <span>{child.title}</span>
                                </Link>
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </>
                  ) : (
                    <Link
                      href={item.href!}
                      onClick={onClose}
                      className={cn(
                        "flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                        itemIsActive ? SIDEBAR_CL.btnActiveInvert : SIDEBAR_CL.btnBase
                      )}
                    >
                      {Icon && <Icon className={SIDEBAR_CL.icon} />}
                      <span>{item.title}</span>
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-white/10">
          <div className="flex items-center space-x-3 mb-4 px-3 py-2">
            <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center">
              <User className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {user?.name || 'Administrador'}
              </p>
              <p className="text-xs text-white/70">Admin</p>
            </div>
          </div>
          
          <Button
            onClick={() => signOut({ callbackUrl: '/auth' })}
            variant="ghost"
            className="w-full justify-start text-white/90 hover:text-white hover:bg-white/10"
          >
            <LogOut className="w-4 h-4 mr-3" />
            Cerrar Sesión
          </Button>
        </div>
      </div>
    </>
  );
}