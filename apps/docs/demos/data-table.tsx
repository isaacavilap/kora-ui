"use client";
import { Badge, Button, DropdownMenuItem, toast } from "kora-ui";
import { DataTable, type DataTableColumn } from "kora-ui/table";
import { money, orders, statusTone, type Order } from "@/lib/demo-data";

const columns: DataTableColumn<Order>[] = [
  { id: "id", header: "Order", accessor: "id", sortable: true },
  { id: "customer", header: "Customer", accessor: "customer", sortable: true },
  { id: "status", header: "Status", accessor: "status", filter: { type: "select" }, cell: (o) => <Badge tone={statusTone[o.status]} className="capitalize">{o.status}</Badge> },
  { id: "date", header: "Date", accessor: "date", sortable: true, filter: { type: "date" }, hideOnMobile: true },
  { id: "total", header: "Total", accessor: "total", sortable: true, align: "right", cell: (o) => money(o.total) },
];

export default function Demo() {
  return (
    <DataTable
      columns={columns}
      data={orders}
      getRowId={(o) => o.id}
      searchable
      searchPlaceholder="Search orders"
      columnToggle
      pageSize={5}
      selectable
      rowActions={(o) => (
        <>
          <DropdownMenuItem onSelect={() => toast.success(`${o.id} opened.`)}>View</DropdownMenuItem>
          <DropdownMenuItem onSelect={() => toast.success(`${o.id} refunded.`)}>Refund</DropdownMenuItem>
        </>
      )}
      bulkActions={(rows, clear) => (
        <Button
          size="sm"
          variant="secondary"
          onClick={() => {
            toast.success(`${rows.length} orders exported.`);
            clear();
          }}
        >
          Export
        </Button>
      )}
    />
  );
}
