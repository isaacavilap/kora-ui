"use client";
import { useEffect, useState, type ReactNode } from "react";
import { AppShell, Avatar, BottomNav, Breadcrumbs, CommandPalette, DropdownMenuItem, DropdownMenuSeparator, KoraLink, NotificationsMenu, ScopeSwitcher, Sidebar, SidebarGroup, SidebarItem, SidebarSection, UserMenu, Text, Topbar, type CommandItem, type Notification, type ScopeOption } from "kora-ui";
import { Activity, BarChart3, Building2, CalendarDays, ClipboardList, CreditCard, History, Home, LayoutDashboard, LogIn, Package, Plus, Settings, ShieldCheck, ShoppingCart, TrendingUp, UserRound, Users } from "lucide-react";
import { COMPANY_KEY, companies } from "@/lib/demo-data";
import { Logo } from "./logo";

const commands: CommandItem[] = [
  { id: "group", label: "All companies", group: "Pages", href: "/preview/group-overview", icon: <Building2 aria-hidden />, keywords: "group holding consolidated" },
  { id: "home", label: "Today", group: "Pages", href: "/preview/home", icon: <Home aria-hidden /> },
  { id: "requests", label: "Requests", group: "Pages", href: "/preview/workflow", icon: <ClipboardList aria-hidden />, keywords: "stages queue approve" },
  { id: "new-request", label: "New request", group: "Pages", href: "/preview/record-form", icon: <Plus aria-hidden /> },
  { id: "agenda", label: "Agenda", group: "Pages", href: "/preview/agenda", icon: <CalendarDays aria-hidden />, keywords: "calendar visits" },
  { id: "assets", label: "Assets", group: "Pages", href: "/preview/catalog", icon: <Package aria-hidden />, keywords: "catalog inventory" },
  { id: "orders", label: "Orders", group: "Pages", href: "/preview/orders", icon: <ShoppingCart aria-hidden />, keywords: "sales purchases" },
  { id: "overview", label: "Overview dashboard", group: "Dashboards", href: "/preview/dashboard", icon: <LayoutDashboard aria-hidden /> },
  { id: "sales", label: "Sales dashboard", group: "Dashboards", href: "/preview/dashboard-sales", icon: <TrendingUp aria-hidden />, keywords: "revenue channels" },
  { id: "subscriptions", label: "Subscriptions dashboard", group: "Dashboards", href: "/preview/dashboard-saas", icon: <CreditCard aria-hidden />, keywords: "saas recurring churn funnel" },
  { id: "operations", label: "Operations dashboard", group: "Dashboards", href: "/preview/dashboard-operations", icon: <Activity aria-hidden />, keywords: "uptime incidents servers" },
  { id: "report", label: "Monthly report", group: "Insights", href: "/preview/report", icon: <BarChart3 aria-hidden />, keywords: "costs totals" },
  { id: "log", label: "Activity log", group: "Insights", href: "/preview/audit-log", icon: <History aria-hidden />, keywords: "audit history" },
  { id: "members", label: "Members", group: "Workspace", href: "/preview/members", icon: <Users aria-hidden />, keywords: "team invite" },
  { id: "permissions", label: "Permissions", group: "Workspace", href: "/preview/permissions", icon: <ShieldCheck aria-hidden />, keywords: "roles access" },
  { id: "company", label: "Company settings", group: "Workspace", href: "/preview/company-settings", icon: <Building2 aria-hidden />, keywords: "identity modules documents" },
  { id: "settings", label: "Settings", group: "Workspace", href: "/preview/workspace-settings", icon: <Settings aria-hidden />, keywords: "locations notifications" },
  { id: "account", label: "Account", group: "Workspace", href: "/preview/account", icon: <UserRound aria-hidden />, keywords: "profile password security" },
  { id: "signout", label: "Sign out", group: "Workspace", href: "/preview/login", icon: <LogIn aria-hidden /> },
];

const logo = (name: string) => <Avatar name={name} size={24} className="shrink-0 rounded-md" />;
const scopes: ScopeOption[] = [
  { value: "group", label: "All companies", description: "Totals for the group", logo: <Text inline className="grid size-6 shrink-0 place-items-center"><Building2 aria-hidden className="size-4" /></Text> },
  ...companies.map((c) => ({ value: c.id, label: c.name, description: c.description, group: "Companies", logo: logo(c.name) })),
];

const initialNotifications: Notification[] = [
  { id: "1", title: "Payment failed for order KC-1042", description: "The card was declined.", time: "12 min ago", unread: true, href: "/preview/orders" },
  { id: "2", title: "Marta invited Luis to the workspace", time: "2 h ago", unread: true, href: "/preview/members" },
  { id: "3", title: "Your October report is ready", time: "Yesterday", href: "/preview/dashboard" },
];

export function DemoShell({ page, title, children }: { page: string; title: string; children: ReactNode }) {
  const [notifications, setNotifications] = useState(initialNotifications);
  const [stored, setStored] = useState("coffee");
  useEffect(() => {
    setStored(localStorage.getItem(COMPANY_KEY) ?? "coffee");
  }, []);
  const scope = page === "group-overview" ? "group" : stored;
  const company = companies.find((c) => c.id === scope);
  const has = (module: string) => company?.modules.includes(module);
  const scopeHome = company ? "/preview/home" : "/preview/group-overview";

  const bottomItems = company
    ? [
        { href: "/preview/home", label: "Today", icon: <Home aria-hidden />, active: page === "home" },
        ...(has("requests") ? [{ href: "/preview/workflow", label: "Requests", icon: <ClipboardList aria-hidden />, active: page === "workflow" || page === "record-detail" || page === "record-form" }] : []),
        ...(has("agenda") ? [{ href: "/preview/agenda", label: "Agenda", icon: <CalendarDays aria-hidden />, active: page === "agenda" }] : has("assets") ? [{ href: "/preview/catalog", label: "Assets", icon: <Package aria-hidden />, active: page === "catalog" }] : []),
        { href: "/preview/report", label: "Report", icon: <BarChart3 aria-hidden />, active: page === "report" },
      ]
    : [
        { href: "/preview/group-overview", label: "Overview", icon: <Building2 aria-hidden />, active: page === "group-overview" },
        { href: "/preview/report", label: "Report", icon: <BarChart3 aria-hidden />, active: page === "report" },
        { href: "/preview/audit-log", label: "Activity", icon: <History aria-hidden />, active: page === "audit-log" },
      ];

  return (
    <AppShell
      bottomNav={<BottomNav items={bottomItems} />}
      sidebar={
        <Sidebar
          brand={{ name: "Kora Group", logo: <Logo /> }}
          scope={
            <ScopeSwitcher
              label="company"
              options={scopes}
              value={scope}
              onChange={(value) => {
                localStorage.setItem(COMPANY_KEY, value);
                window.location.href = value === "group" ? "/preview/group-overview" : "/preview/home";
              }}
            />
          }
        >
          <SidebarSection>
            {company ? (
              <SidebarItem href="/preview/home" icon={<Home aria-hidden />} active={page === "home"}>Today</SidebarItem>
            ) : (
              <SidebarItem href="/preview/group-overview" icon={<Building2 aria-hidden />} active={page === "group-overview"}>Overview</SidebarItem>
            )}
            <SidebarGroup label="Dashboards" icon={<LayoutDashboard aria-hidden />}>
              <SidebarItem href="/preview/dashboard" active={page === "dashboard"}>Overview</SidebarItem>
              <SidebarItem href="/preview/dashboard-sales" active={page === "dashboard-sales"}>Sales</SidebarItem>
              <SidebarItem href="/preview/dashboard-saas" active={page === "dashboard-saas"}>Subscriptions</SidebarItem>
              <SidebarItem href="/preview/dashboard-operations" active={page === "dashboard-operations"}>Operations</SidebarItem>
            </SidebarGroup>
          </SidebarSection>
          {company && (
            <SidebarSection label="Work">
              {has("requests") && <SidebarItem href="/preview/workflow" icon={<ClipboardList aria-hidden />} active={page === "workflow" || page === "record-detail" || page === "record-form"} badge={company.open}>Requests</SidebarItem>}
              {has("agenda") && <SidebarItem href="/preview/agenda" icon={<CalendarDays aria-hidden />} active={page === "agenda"}>Agenda</SidebarItem>}
              {has("assets") && <SidebarItem href="/preview/catalog" icon={<Package aria-hidden />} active={page === "catalog"}>Assets</SidebarItem>}
              {has("orders") && <SidebarItem href="/preview/orders" icon={<ShoppingCart aria-hidden />} active={page === "orders"} badge={12}>Orders</SidebarItem>}
            </SidebarSection>
          )}
          <SidebarSection label="Insights">
            <SidebarItem href="/preview/report" icon={<BarChart3 aria-hidden />} active={page === "report"}>Monthly report</SidebarItem>
            <SidebarItem href="/preview/audit-log" icon={<History aria-hidden />} active={page === "audit-log"}>Activity log</SidebarItem>
          </SidebarSection>
          <SidebarSection label="Workspace">
            <SidebarItem href="/preview/members" icon={<Users aria-hidden />} active={page === "members"}>Members</SidebarItem>
            <SidebarItem href="/preview/permissions" icon={<ShieldCheck aria-hidden />} active={page === "permissions"}>Permissions</SidebarItem>
            <SidebarGroup label="Settings" icon={<Settings aria-hidden />}>
              {company && <SidebarItem href="/preview/company-settings" active={page === "company-settings"}>Company</SidebarItem>}
              <SidebarItem href="/preview/workspace-settings" active={page === "workspace-settings"}>Workspace</SidebarItem>
              <SidebarItem href="/preview/account" active={page === "account"}>Account</SidebarItem>
            </SidebarGroup>
          </SidebarSection>
        </Sidebar>
      }
      topbar={
        <Topbar>
          <Breadcrumbs className="mr-auto" items={[{ label: company?.name ?? "All companies", href: scopeHome }, { label: title }]} />
          <CommandPalette items={commands} />
          <NotificationsMenu items={notifications} onMarkAllRead={() => setNotifications(notifications.map((n) => ({ ...n, unread: false })))} />
          <UserMenu name="Marta Ríos" email="marta@koracoffee.com" seed="marta">
            <DropdownMenuItem asChild><KoraLink href="/preview/account">Account</KoraLink></DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild><KoraLink href="/preview/login">Sign out</KoraLink></DropdownMenuItem>
          </UserMenu>
        </Topbar>
      }
    >
      {children}
    </AppShell>
  );
}
