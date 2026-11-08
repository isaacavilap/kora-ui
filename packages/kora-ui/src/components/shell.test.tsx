import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { DropdownMenuItem } from "./overlay";
import { UserMenu } from "./shell-tools";
import { AppShell, BottomNav, Box, Fieldset, Heading, List, ListItem, SaveBar, Text, Sidebar, SidebarGroup, SidebarItem, SidebarSection, Topbar } from "./layout";
import { CommandPalette, filterCommands } from "./shell-tools";

const shell = (active = false, props = {}) => (
  <AppShell
    {...props}
    topbar={<Topbar />}
    sidebar={
      <Sidebar>
        <SidebarSection>
          <SidebarItem href="/home">Home</SidebarItem>
          <SidebarGroup label="Reports">
            <SidebarGroup label="Exports">
              <SidebarItem href="/monthly" active={active}>Monthly</SidebarItem>
            </SidebarGroup>
          </SidebarGroup>
        </SidebarSection>
      </Sidebar>
    }
  >
    Page
  </AppShell>
);

describe("Sidebar", () => {
  beforeEach(() => {
    const store = new Map<string, string>();
    vi.stubGlobal("localStorage", {
      getItem: (key: string) => store.get(key) ?? null,
      setItem: (key: string, value: string) => store.set(key, value),
    });
  });

  it("opens and closes submenus", async () => {
    render(shell());
    const reports = screen.getByRole("button", { name: "Reports", hidden: true });
    expect(reports).toHaveAttribute("aria-expanded", "false");
    await userEvent.click(reports);
    expect(reports).toHaveAttribute("aria-expanded", "true");
  });

  it("opens every level around the active item", () => {
    render(shell(true));
    expect(screen.getByRole("button", { name: "Reports", hidden: true })).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("button", { name: "Exports", hidden: true })).toHaveAttribute("aria-expanded", "true");
  });

  it("collapses to a rail, keeps link names, and saves the choice", async () => {
    const { unmount } = render(shell());
    await userEvent.click(screen.getByRole("button", { name: "Collapse sidebar", hidden: true }));
    expect(screen.getByRole("link", { name: "Home", hidden: true })).toBeInTheDocument();
    expect(localStorage.getItem("kora-sidebar-collapsed")).toBe("1");
    unmount();
    render(shell());
    expect(await screen.findByRole("button", { name: "Expand sidebar", hidden: true })).toBeInTheDocument();
  });

  it("removes the column in hidden mode", async () => {
    render(shell(false, { collapseMode: "hidden" }));
    expect(document.querySelector("aside")!.parentElement!.className).toContain("kr:lg:block");
    await userEvent.click(screen.getByRole("button", { name: "Collapse sidebar", hidden: true }));
    expect(document.querySelector("aside")!.parentElement!.className).not.toContain("kr:lg:block");
  });

  it("does not save a controlled state", async () => {
    const onCollapsedChange = vi.fn();
    render(shell(false, { collapsed: false, onCollapsedChange }));
    await userEvent.click(screen.getByRole("button", { name: "Collapse sidebar", hidden: true }));
    expect(onCollapsedChange).toHaveBeenCalledWith(true);
    expect(localStorage.getItem("kora-sidebar-collapsed")).toBeNull();
    expect(screen.getByRole("button", { name: "Collapse sidebar", hidden: true })).toBeInTheDocument();
  });
});

describe("CommandPalette", () => {
  const items = [
    { id: "a", label: "Orders", keywords: "sales", onSelect: vi.fn() },
    { id: "b", label: "Members", onSelect: vi.fn() },
  ];

  it("matches labels and keywords", () => {
    expect(filterCommands(items, "SALES").map((i) => i.id)).toEqual(["a"]);
    expect(filterCommands(items, "").length).toBe(2);
  });

  it("opens with the shortcut, and runs the chosen item with Enter", async () => {
    render(<CommandPalette items={items} />);
    await userEvent.keyboard("{Control>}k{/Control}");
    const dialog = await screen.findByRole("dialog");
    await userEvent.keyboard("{ArrowDown}{Enter}");
    expect(items[1]!.onSelect).toHaveBeenCalled();
    expect(dialog).not.toBeInTheDocument();
  });
});

describe("CommandPalette remote results", () => {
  it("reports the text, shows descriptions, and resets the text on close", async () => {
    const onQueryChange = vi.fn();
    render(<CommandPalette items={[{ id: "r", label: "Pago 123", keywords: "abc", description: "Ana" }]} onQueryChange={onQueryChange} />);
    await userEvent.keyboard("{Control>}k{/Control}");
    await userEvent.type(await screen.findByRole("combobox"), "abc");
    expect(onQueryChange).toHaveBeenLastCalledWith("abc");
    expect(screen.getByRole("option").textContent).toContain("Ana");
    await userEvent.keyboard("{Escape}");
    expect(onQueryChange).toHaveBeenLastCalledWith("");
  });
});

describe("BottomNav", () => {
  it("marks the current page, and opens the sidebar for the rest", async () => {
    render(shell(false, { bottomNav: <BottomNav items={[{ href: "/home", label: "Inicio", icon: null, active: true }]} /> }));
    const nav = screen.getByRole("navigation", { name: "Main" });
    expect(nav.querySelector("[aria-current=page]")?.textContent).toContain("Inicio");
    await userEvent.click(screen.getByRole("button", { name: "More" }));
    expect(screen.getByRole("dialog")).toBeTruthy();
  });
});

describe("BottomNav current page", () => {
  const nav = (active: boolean) => shell(false, { bottomNav: <BottomNav items={[{ href: "/home", label: "Inicio", icon: null, active }]} /> });

  it("colors only the icon of the active item, with no muted class to override it", () => {
    render(nav(true));
    const link = screen.getByRole("navigation", { name: "Main" }).querySelector("[aria-current=page]")!;
    expect(link.className).not.toContain("kr:text-accent");
    expect(link.className).not.toContain("kr:text-muted");
    expect(link.querySelector(".kr\\:text-accent")).toBeTruthy();
  });

  it("marks More for a page outside the bottom menu", () => {
    render(nav(false));
    expect(screen.getByRole("button", { name: "More" }).getAttribute("aria-current")).toBe("true");
  });
});

describe("SaveBar", () => {
  it("shows only with unsaved changes", async () => {
    const onDiscard = vi.fn();
    const { rerender } = render(<SaveBar dirty={false} onDiscard={onDiscard} />);
    expect(screen.queryByRole("button", { name: "Discard" })).toBeNull();
    rerender(<SaveBar dirty onDiscard={onDiscard} />);
    await userEvent.click(screen.getByRole("button", { name: "Discard" }));
    expect(onDiscard).toHaveBeenCalledOnce();
    expect(screen.getByRole("button", { name: "Save changes" }).getAttribute("type")).toBe("submit");
  });
});

describe("layout and text components", () => {
  it("renders the requested tags", () => {
    render(<><Box as="section" aria-label="Area" /><List ordered><ListItem>One</ListItem></List><Fieldset legend="Group" /></>);
    expect(screen.getByRole("region", { name: "Area" }).tagName).toBe("SECTION");
    expect(screen.getByRole("list").tagName).toBe("OL");
    expect(screen.getByRole("group", { name: "Group" }).tagName).toBe("FIELDSET");
  });

  it("renders the requested heading level and the inline text tag", () => {
    render(<><Heading level={3}>Title</Heading><Text inline>Word</Text><Text>Line</Text></>);
    expect(screen.getByRole("heading", { level: 3, name: "Title" })).toBeTruthy();
    expect(screen.getByText("Word").tagName).toBe("SPAN");
    expect(screen.getByText("Line").tagName).toBe("P");
  });
});

describe("UserMenu", () => {
  it("opens a menu with the name and the items", async () => {
    render(<UserMenu name="Ana" email="ana@ejemplo.com" seed="1"><DropdownMenuItem>Sign out</DropdownMenuItem></UserMenu>);
    await userEvent.click(screen.getByRole("button", { name: "Account menu: Ana" }));
    expect(screen.getByRole("menuitem", { name: "Sign out" })).toBeTruthy();
    expect(screen.getByText("ana@ejemplo.com")).toBeTruthy();
  });

  it("chooses the theme and the text size, and keeps them on this device", async () => {
    const store = new Map<string, string>();
    vi.stubGlobal("localStorage", {
      getItem: (key: string) => store.get(key) ?? null,
      setItem: (key: string, value: string) => store.set(key, value),
      removeItem: (key: string) => store.delete(key),
    });
    render(<UserMenu name="Ana" seed="1"><DropdownMenuItem>Sign out</DropdownMenuItem></UserMenu>);
    await userEvent.click(screen.getByRole("button", { name: "Account menu: Ana" }));
    expect(screen.getByRole("menuitemradio", { name: "System" }).getAttribute("aria-checked")).toBe("true");
    await userEvent.click(screen.getByRole("menuitemradio", { name: "Dark" }));
    expect(document.documentElement.classList.contains("dark")).toBe(true);
    expect(localStorage.getItem("kora-theme")).toBe("dark");
    // The menu stays open, so the second choice is one more click.
    await userEvent.click(screen.getByRole("menuitemradio", { name: "18 px" }));
    expect(document.documentElement.style.fontSize).toBe("112.5%");
    expect(localStorage.getItem("kora-text-size")).toBe("112.5");
    await userEvent.click(screen.getByRole("menuitemradio", { name: "System" }));
    expect(localStorage.getItem("kora-theme")).toBeNull();
  });

  it("leaves them out when asked", async () => {
    render(<UserMenu name="Ana" preferences={false}><DropdownMenuItem>Sign out</DropdownMenuItem></UserMenu>);
    await userEvent.click(screen.getByRole("button", { name: "Account menu: Ana" }));
    expect(screen.queryByRole("menuitemradio")).toBeNull();
  });
});
