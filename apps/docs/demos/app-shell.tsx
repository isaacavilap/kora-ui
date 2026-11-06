"use client";
import { AppShell, Avatar, Button, Sidebar, SidebarGroup, SidebarItem, SidebarSection, Topbar } from "kora-ui";
import { BarChart3, Home, Settings, ShoppingCart } from "lucide-react";

/* Use the Topbar button to collapse the sidebar. Under 1024px it becomes a drawer behind the menu button. */
export default function Demo() {
  return (
    <div className="h-96 overflow-auto rounded-md border border-[var(--kora-line)] [&>div]:min-h-full">
      <AppShell
        sidebar={
          <Sidebar brand={{ name: "Kora Coffee" }}>
            <SidebarSection>
              <SidebarItem href="#" icon={<Home aria-hidden />}>Overview</SidebarItem>
              <SidebarGroup label="Sales" icon={<ShoppingCart aria-hidden />}>
                <SidebarItem href="#" active badge={12}>Orders</SidebarItem>
                <SidebarItem href="#">Refunds</SidebarItem>
              </SidebarGroup>
              <SidebarGroup label="Reports" icon={<BarChart3 aria-hidden />}>
                <SidebarItem href="#">Revenue</SidebarItem>
                <SidebarGroup label="Exports">
                  <SidebarItem href="#">Monthly</SidebarItem>
                  <SidebarItem href="#">Yearly</SidebarItem>
                </SidebarGroup>
              </SidebarGroup>
              <SidebarItem href="#" icon={<Settings aria-hidden />}>Settings</SidebarItem>
            </SidebarSection>
          </Sidebar>
        }
        topbar={
          <Topbar>
            <span className="mr-auto text-sm font-medium">Orders</span>
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
