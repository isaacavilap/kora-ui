import { useState } from "react";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { DataTable, type DataTableColumn, type DataTableState } from "./data-table";

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
