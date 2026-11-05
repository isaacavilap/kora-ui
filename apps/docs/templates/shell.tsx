"use client";
import type { ReactNode } from "react";
import { AppShell, Avatar, DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger, Sidebar, SidebarItem, SidebarSection, Topbar } from "kora-ui";
import { BarChart3, Home, Settings, ShoppingCart, Users } from "lucide-react";
import { Logo } from "./logo";

export function DemoShell({ page, title, children }: { page: string; title: string; children: ReactNode }) {
  return (
    <AppShell
      sidebar={
        <Sidebar brand={{ name: "Kora Coffee", logo: <Logo /> }}>
          <SidebarSection>
            <SidebarItem href="/preview/dashboard" icon={<Home aria-hidden />} active={page === "dashboard"}>Overview</SidebarItem>
            <SidebarItem href="/preview/orders" icon={<ShoppingCart aria-hidden />} active={page === "orders"} badge={12}>Orders</SidebarItem>
            <SidebarItem href="/preview/dashboard" icon={<BarChart3 aria-hidden />}>Reports</SidebarItem>
          </SidebarSection>
          <SidebarSection label="Workspace">
            <SidebarItem href="/preview/members" icon={<Users aria-hidden />} active={page === "members"}>Members</SidebarItem>
            <SidebarItem href="/preview/account" icon={<Settings aria-hidden />} active={page === "account"}>Account</SidebarItem>
          </SidebarSection>
        </Sidebar>
      }
      topbar={
        <Topbar>
          <span className="mr-auto truncate text-sm font-medium">{title}</span>
          <DropdownMenu>
            <DropdownMenuTrigger aria-label="Account menu" className="cursor-pointer rounded-full outline-offset-2">
              <Avatar name="Marta Ríos" size={30} />
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem asChild><a href="/preview/account">Account</a></DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild><a href="/preview/login">Sign out</a></DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </Topbar>
      }
    >
      {children}
    </AppShell>
  );
}

