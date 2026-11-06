"use client";
import { useState, type ReactNode } from "react";
import { AppShell, Breadcrumbs, CommandPalette, DropdownMenuItem, DropdownMenuSeparator, NotificationsMenu, Sidebar, SidebarGroup, SidebarItem, SidebarSection, SidebarUser, ThemeToggle, Topbar, type CommandItem, type Notification } from "kora-ui";
import { BarChart3, FileText, Home, LogIn, Settings, ShoppingCart, Users } from "lucide-react";
import { Logo } from "./logo";

const commands: CommandItem[] = [
  { id: "overview", label: "Overview", group: "Pages", href: "/preview/dashboard", icon: <Home aria-hidden /> },
  { id: "orders", label: "Orders", group: "Pages", href: "/preview/orders", icon: <ShoppingCart aria-hidden />, keywords: "sales purchases" },
  { id: "members", label: "Members", group: "Workspace", href: "/preview/members", icon: <Users aria-hidden />, keywords: "team roles invite" },
  { id: "account", label: "Account", group: "Workspace", href: "/preview/account", icon: <Settings aria-hidden />, keywords: "profile password security" },
  { id: "signout", label: "Sign out", group: "Workspace", href: "/preview/login", icon: <LogIn aria-hidden /> },
];

const initialNotifications: Notification[] = [
  { id: "1", title: "Payment failed for order KC-1042", description: "The card was declined.", time: "12 min ago", unread: true, href: "/preview/orders" },
  { id: "2", title: "Marta invited Luis to the workspace", time: "2 h ago", unread: true, href: "/preview/members" },
  { id: "3", title: "Your October report is ready", time: "Yesterday", href: "/preview/dashboard" },
];

export function DemoShell({ page, title, children }: { page: string; title: string; children: ReactNode }) {
  const [notifications, setNotifications] = useState(initialNotifications);
  return (
    <AppShell
      sidebar={
        <Sidebar
          brand={{ name: "Kora Coffee", logo: <Logo /> }}
          footer={
            <SidebarUser name="Marta Ríos" email="marta@koracoffee.com">
              <DropdownMenuItem asChild><a href="/preview/account">Account</a></DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild><a href="/preview/login">Sign out</a></DropdownMenuItem>
            </SidebarUser>
          }
        >
          <SidebarSection>
            <SidebarItem href="/preview/dashboard" icon={<Home aria-hidden />} active={page === "dashboard"}>Overview</SidebarItem>
            <SidebarGroup label="Sales" icon={<ShoppingCart aria-hidden />}>
              <SidebarItem href="/preview/orders" active={page === "orders"} badge={12}>Orders</SidebarItem>
              <SidebarItem href="/preview/orders">Refunds</SidebarItem>
            </SidebarGroup>
            <SidebarGroup label="Reports" icon={<BarChart3 aria-hidden />}>
              <SidebarItem href="/preview/dashboard">Revenue</SidebarItem>
              <SidebarGroup label="Exports">
                <SidebarItem href="/preview/dashboard">Monthly</SidebarItem>
                <SidebarItem href="/preview/dashboard">Yearly</SidebarItem>
              </SidebarGroup>
            </SidebarGroup>
          </SidebarSection>
          <SidebarSection label="Workspace">
            <SidebarItem href="/preview/members" icon={<Users aria-hidden />} active={page === "members"}>Members</SidebarItem>
            <SidebarItem href="/preview/account" icon={<Settings aria-hidden />} active={page === "account"}>Account</SidebarItem>
            <SidebarGroup label="Pages" icon={<FileText aria-hidden />}>
              <SidebarItem href="/preview/login">Sign in</SidebarItem>
              <SidebarItem href="/preview/register">Create account</SidebarItem>
            </SidebarGroup>
          </SidebarSection>
        </Sidebar>
      }
      topbar={
        <Topbar>
          <Breadcrumbs className="mr-auto" items={[{ label: "Kora Coffee", href: "/preview/dashboard" }, { label: title }]} />
          <CommandPalette items={commands} />
          <NotificationsMenu items={notifications} onMarkAllRead={() => setNotifications(notifications.map((n) => ({ ...n, unread: false })))} />
          <ThemeToggle />
        </Topbar>
      }
    >
      {children}
    </AppShell>
  );
}
