import { useState } from "react";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { DataTable, matchesFilter, type DataTableColumn, type DataTableState } from "./data-table";

type Row = { id: string; name: string; total: number };
const data: Row[] = Array.from({ length: 12 }, (_, i) => ({ id: String(i + 1), name: `Order ${String(i + 1).padStart(2, "0")}`, total: 100 - i }));
const columns: DataTableColumn<Row>[] = [
  { id: "name", header: "Name", accessor: "name", sortable: true },
  { id: "total", header: "Total", accessor: "total", sortable: true, align: "right" },
];
const names = () =>
  within(screen.getByRole("table")).getAllByRole("row").slice(1).map((r) => within(r).getAllByRole("cell")[0]?.textContent);

describe("DataTable client mode", () => {
  it("paginates, and sorts from the header", async () => {
    render(<DataTable columns={columns} data={data} getRowId={(r) => r.id} pageSize={5} />);
    expect(names()).toHaveLength(5);
    expect(names()[0]).toBe("Order 01");
    const sortTotal = () => userEvent.click(within(screen.getByRole("table")).getByRole("button", { name: "Total" }));
    await sortTotal(); // Numbers sort high to low first.
    expect(names()[0]).toBe("Order 01");
    await sortTotal();
    expect(names()[0]).toBe("Order 12");
    await userEvent.click(screen.getByRole("button", { name: "Next" }));
    expect(names()[0]).toBe("Order 07");
  });

  it("searches and goes back to the first page", async () => {
    const { rerender } = render(<DataTable columns={columns} data={data} pageSize={5} />);
    await userEvent.click(screen.getByRole("button", { name: "Next" }));
    rerender(<DataTable columns={columns} data={data} pageSize={5} search="Order 11" />);
    expect(names()).toEqual(["Order 11"]);
  });

  it("does not strand the user on an empty page when data shrinks", async () => {
    const { rerender } = render(<DataTable columns={columns} data={data} pageSize={5} />);
    await userEvent.click(screen.getByRole("button", { name: "Next" }));
    await userEvent.click(screen.getByRole("button", { name: "Next" }));
    rerender(<DataTable columns={columns} data={data.slice(0, 3)} pageSize={5} />);
    expect(names()).toHaveLength(3);
  });

  it("passes selected rows to bulk actions, and clears them", async () => {
    const seen = vi.fn();
    render(
      <DataTable
        columns={columns}
        data={data}
        getRowId={(r) => r.id}
        selectable
        bulkActions={(rows, clear) => {
          seen(rows.map((r) => r.id));
          return <button onClick={clear}>Clear</button>;
        }}
      />,
    );
    await userEvent.click(within(screen.getByRole("table")).getAllByRole("checkbox", { name: "Select row" })[1]!);
    expect(seen).toHaveBeenLastCalledWith(["2"]);
    await userEvent.click(screen.getByRole("button", { name: "Clear" }));
    expect(screen.queryByRole("button", { name: "Clear" })).toBeNull();
  });

  it("shows empty, loading, and error states with retry", async () => {
    const retry = vi.fn();
    const { rerender } = render(<DataTable columns={columns} data={[]} />);
    expect(screen.getAllByText("Nothing here yet").length).toBeGreaterThan(0);
    rerender(<DataTable columns={columns} data={[]} loading />);
    expect(screen.getAllByRole("status", { name: "Loading" }).length).toBeGreaterThan(0);
    rerender(<DataTable columns={columns} data={[]} error="Could not load" onRetry={retry} />);
    await userEvent.click(screen.getAllByRole("button", { name: "Try again" })[0]!);
    expect(retry).toHaveBeenCalledOnce();
  });
});

describe("DataTable server mode", () => {
  it("does not sort locally, and reports state to the parent", async () => {
    const changes: DataTableState[] = [];
    function Server() {
      const [state, setState] = useState<DataTableState>({ pageIndex: 0, pageSize: 5, sorting: [] });
      return (
        <DataTable
          manual
          columns={columns}
          data={data.slice(0, 5)}
          rowCount={12}
          state={state}
          onStateChange={(s) => {
            changes.push(s);
            setState(s);
          }}
        />
      );
    }
    render(<Server />);
    await userEvent.click(screen.getByRole("button", { name: "Next" }));
    expect(changes.at(-1)).toMatchObject({ pageIndex: 1, pageSize: 5 });
    await userEvent.click(within(screen.getByRole("table")).getByRole("button", { name: "Total" }));
    expect(changes.at(-1)).toMatchObject({ pageIndex: 0, sorting: [{ id: "total" }] });
    expect(names()[0]).toBe("Order 01");
  });
});

describe("matchesFilter", () => {
  it("matches any chosen value", () => {
    expect(matchesFilter("paid", ["paid", "failed"])).toBe(true);
    expect(matchesFilter("pending", ["paid"])).toBe(false);
    expect(matchesFilter(undefined, ["paid"])).toBe(false);
    expect(matchesFilter("pending", [])).toBe(true);
  });

  it("treats date ranges as whole local days", () => {
    const range = { from: new Date(2026, 2, 1), to: new Date(2026, 2, 3) };
    expect(matchesFilter("2026-03-01", range)).toBe(true);
    expect(matchesFilter(new Date(2026, 2, 3, 23, 30), range)).toBe(true);
    expect(matchesFilter("2026-03-04", range)).toBe(false);
    expect(matchesFilter("2026-02-28", range)).toBe(false);
    expect(matchesFilter(undefined, range)).toBe(false);
  });
});

describe("DataTable toolbar", () => {
  type Sale = { id: string; name: string; status: string };
  const sales: Sale[] = [
    { id: "1", name: "Ana", status: "paid" },
    { id: "2", name: "Ben", status: "failed" },
    { id: "3", name: "Cleo", status: "paid" },
  ];
  const saleColumns: DataTableColumn<Sale>[] = [
    { id: "name", header: "Name", accessor: "name" },
    { id: "status", header: "Status", accessor: "status", filter: { type: "select" } },
  ];

  it("takes options from the data, filters, and clears", async () => {
    render(<DataTable columns={saleColumns} data={sales} getRowId={(r) => r.id} />);
    await userEvent.click(screen.getByRole("button", { name: "Status" }));
    await userEvent.click(screen.getByRole("checkbox", { name: "failed" }));
    expect(names()).toEqual(["Ben"]);
    await userEvent.keyboard("{Escape}");
    await userEvent.click(screen.getByRole("button", { name: "Clear filters" }));
    expect(names()).toEqual(["Ana", "Ben", "Cleo"]);
  });

  it("offers a way out when filters leave no rows", async () => {
    render(<DataTable columns={saleColumns} data={sales} getRowId={(r) => r.id} searchable />);
    await userEvent.type(screen.getByRole("searchbox"), "zzz");
    expect(screen.getAllByText("No results").length).toBeGreaterThan(0);
  });

  it("sends filters to the parent in server mode", async () => {
    const onStateChange = vi.fn();
    const withOptions: DataTableColumn<Sale>[] = [saleColumns[0]!, { ...saleColumns[1]!, filter: { type: "select", options: [{ value: "paid", label: "Paid" }] } }];
    render(<DataTable manual rowCount={3} columns={withOptions} data={sales} getRowId={(r) => r.id} state={{ pageIndex: 2, pageSize: 1, sorting: [] }} onStateChange={onStateChange} />);
    await userEvent.click(screen.getByRole("button", { name: "Status" }));
    await userEvent.click(screen.getByRole("checkbox", { name: "Paid" }));
    expect(onStateChange).toHaveBeenLastCalledWith(expect.objectContaining({ pageIndex: 0, filters: { status: ["paid"] } }));
  });

  it("hides columns, and keeps at least one", async () => {
    render(<DataTable columns={saleColumns.map((c) => ({ ...c, filter: undefined }))} data={sales} getRowId={(r) => r.id} columnToggle />);
    await userEvent.click(screen.getByRole("button", { name: /Columns/ }));
    await userEvent.click(screen.getByRole("checkbox", { name: "Status" }));
    expect(within(screen.getByRole("table", { hidden: true })).queryByText("failed")).toBeNull();
    await userEvent.click(screen.getByRole("checkbox", { name: "Name" }));
    expect(within(screen.getByRole("table", { hidden: true })).getByText("Ana")).toBeInTheDocument();
  });
});
