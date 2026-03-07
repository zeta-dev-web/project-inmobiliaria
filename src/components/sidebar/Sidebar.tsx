'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import Image from 'next/image';
import { LogOut, ChevronRight } from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from '@/components/ui/shadcn/sidebar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import * as Collapsible from '@radix-ui/react-collapsible';
import { SIDEBAR_ITEMS, isActive } from '@/constants/sidebar.constants';

export function AppSidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  const handleLogout = async () => {
    await signOut({ redirect: false });
    window.location.href = '/';
  };

  const getUserInitials = (name?: string | null) => {
    if (!name) return 'A';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 1);
  };

  return (
    <Sidebar collapsible="icon" className="border-r border-white/10">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/admin" className="flex items-center gap-3">
                <Image
                  src="/favicon-32x32.png"
                  alt="Polar Inmobiliaria"
                  width={32}
                  height={32}
                  className="object-contain flex-shrink-0 brightness-0 invert"
                />
                <span className="text-lg font-semibold text-white group-data-[collapsible=icon]:hidden">
                  Polar Inmobiliaria
                </span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {SIDEBAR_ITEMS.map((item) => {
                const Icon = item.icon;
                const hasChildren = item.children && item.children.length > 0;

                if (hasChildren) {
                  return (
                    <Collapsible.Root
                      key={item.title}
                      asChild
                      defaultOpen={false}
                    >
                      <SidebarMenuItem>
                        <Collapsible.Trigger asChild>
                          <SidebarMenuButton
                            className="text-white/90 hover:text-white hover:bg-white/10"
                            tooltip={item.title}
                          >
                            {Icon && <Icon className="h-4 w-4" />}
                            <span>{item.title}</span>
                            <ChevronRight className="ml-auto h-4 w-4 transition-transform duration-200 group-data-[state=open]:rotate-90" />
                          </SidebarMenuButton>
                        </Collapsible.Trigger>
                        <Collapsible.Content>
                          <SidebarMenuSub>
                            {item.children?.map((child) => {
                              const ChildIcon = child.icon;
                              const childIsActive = isActive(
                                pathname,
                                child.href
                              );
                              return (
                                <SidebarMenuSubItem key={child.href}>
                                  <SidebarMenuSubButton
                                    asChild
                                    isActive={childIsActive}
                                    className={
                                      childIsActive
                                        ? 'bg-white/20 !text-white font-semibold hover:bg-white/20 hover:!text-white'
                                        : 'text-white/90 hover:text-white hover:bg-white/10'
                                    }
                                  >
                                    <Link href={child.href}>
                                      {ChildIcon && (
                                        <ChildIcon className="h-4 w-4" />
                                      )}
                                      <span>{child.title}</span>
                                    </Link>
                                  </SidebarMenuSubButton>
                                </SidebarMenuSubItem>
                              );
                            })}
                          </SidebarMenuSub>
                        </Collapsible.Content>
                      </SidebarMenuItem>
                    </Collapsible.Root>
                  );
                }

                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild={!item.disabled}
                      isActive={isActive(pathname, item.href)}
                      className={
                        isActive(pathname, item.href)
                          ? 'bg-white/20 !text-white font-semibold hover:bg-white/20 hover:!text-white'
                          : 'text-white/90 hover:text-white hover:bg-white/10'
                      }
                      disabled={item.disabled}
                      tooltip={item.title}
                    >
                      {item.disabled ? (
                        <>
                          {Icon && <Icon className="h-4 w-4" />}
                          <span>{item.title}</span>
                        </>
                      ) : (
                        <Link href={item.href!}>
                          {Icon && <Icon className="h-4 w-4" />}
                          <span>{item.title}</span>
                        </Link>
                      )}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-white/10"
                >
                  <div className="h-8 w-8 rounded-full bg-white/10 flex items-center justify-center text-white font-semibold">
                    {getUserInitials(session?.user?.name)}
                  </div>
                  <div className="flex flex-col items-start text-sm group-data-[collapsible=icon]:hidden">
                    <span className="font-medium text-white">
                      {session?.user?.name || 'Usuario'}
                    </span>
                    <span className="text-xs text-white/70">
                      {session?.user?.role || 'Admin'}
                    </span>
                  </div>
                  <ChevronRight className="ml-auto h-4 w-4 group-data-[collapsible=icon]:hidden" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                side="top"
                align="end"
                className="w-[--radix-dropdown-menu-trigger-width] bg-white"
              >
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="cursor-pointer text-gray-900 hover:bg-gray-100"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Cerrar sesión
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
