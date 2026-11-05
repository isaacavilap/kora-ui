"use client";
import { AppShell, Avatar, Button, Sidebar, SidebarItem, SidebarSection, Topbar } from "kora-ui";
import { Home, Settings, ShoppingCart } from "lucide-react";

/* Narrow this window under 1024px: the sidebar becomes a drawer behind the menu button. */
export default function Demo() {
  return (
    <div className="h-96 overflow-auto rounded-md border border-[var(--kora-line)] [&>div]:min-h-full">
      <AppShell
        sidebar={
          <Sidebar brand={{ name: "Kora Coffee" }}>
            <SidebarSection>
              <SidebarItem href="#" icon={<Home aria-hidden />} active>Overview</SidebarItem>
              <SidebarItem href="#" icon={<ShoppingCart aria-hidden />} badge={12}>Orders</SidebarItem>
              <SidebarItem href="#" icon={<Settings aria-hidden />}>Settings</SidebarItem>
            </SidebarSection>
          </Sidebar>
        }
        topbar={
          <Topbar>
            <span className="mr-auto text-sm font-medium">Overview</span>
            <Button size="sm" variant="secondary">Export</Button>
            <Avatar name="Marta Ríos" size={28} />
          </Topbar>
        }
      >
        <p className="text-sm">Page content goes here.</p>
      </AppShell>
    </div>
  );
}

