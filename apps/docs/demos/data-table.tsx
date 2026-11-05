"use client";
import { useState } from "react";
import { Badge, Button, toast } from "kora-ui";
import { DataTable, FilterBar, type DataTableColumn } from "kora-ui/table";
import { money, orders, statusTone, type Order } from "@/lib/demo-data";

const columns: DataTableColumn<Order>[] = [
  { id: "id", header: "Order", accessor: "id", sortable: true },
  { id: "customer", header: "Customer", accessor: "customer", sortable: true },
  { id: "status", header: "Status", accessor: "status", cell: (o) => <Badge tone={statusTone[o.status]} className="capitalize">{o.status}</Badge> },
  { id: "date", header: "Date", accessor: "date", sortable: true, hideOnMobile: true },
  { id: "total", header: "Total", accessor: "total", sortable: true, align: "right", cell: (o) => money(o.total) },
];

export default function Demo() {
  const [search, setSearch] = useState("");
  return (
    <div>
      <FilterBar search={search} onSearchChange={setSearch} searchPlaceholder="Search orders" />
      <DataTable
        columns={columns}
        data={orders}
        getRowId={(o) => o.id}
        search={search}
        pageSize={5}
        selectable
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
    </div>
  );
}

