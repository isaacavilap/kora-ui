"use client";
import { useState } from "react";
import { Avatar, Badge, Button, DropdownMenuItem, PageHeader, StatGroup, Toaster, toast } from "kora-ui";
import { DataTable, type DataTableColumn } from "kora-ui/table";
import { Plus } from "lucide-react";
import { assets as seed, assetTone, money, type Asset } from "@/lib/demo-data";
import { DemoShell } from "./shell";

const columns: DataTableColumn<Asset>[] = [
  {
    id: "name",
    header: "Asset",
    accessor: "name",
    sortable: true,
    cell: (a) => (
      <span className="flex min-w-0 items-center gap-2.5">
        <Avatar name={a.name} size={32} className="rounded-md" />
        <span className="min-w-0">
          <span className="block truncate font-medium">{a.name}</span>
          <span className="block text-xs text-[var(--kora-muted)]">{a.code}</span>
        </span>
      </span>
    ),
  },
  { id: "category", header: "Category", accessor: "category", sortable: true, filter: { type: "select" } },
  { id: "location", header: "Location", accessor: "location", sortable: true, filter: { type: "select" } },
  { id: "status", header: "Status", accessor: "status", filter: { type: "select" }, cell: (a) => <Badge tone={assetTone[a.status]}>{a.status}</Badge> },
  { id: "value", header: "Value", accessor: "value", sortable: true, align: "right", cell: (a) => money(a.value), footer: (rows) => money(rows.reduce((sum, a) => sum + a.value, 0)) },
];

export default function Template() {
  const [assets, setAssets] = useState(seed);
  const remove = (ids: string[]) => setAssets(assets.filter((a) => !ids.includes(a.id)));
  return (
    <DemoShell page="catalog" title="Assets">
      <Toaster />
      <PageHeader
        title="Assets"
        description="What you own, where it is, and what state it is in."
        actions={<Button asChild className="max-md:w-full"><a href="/preview/record-form"><Plus aria-hidden />Add asset</a></Button>}
      />
      <StatGroup
        className="mb-4"
        stats={[
          { label: "Total", value: assets.length },
          { label: "Available", value: assets.filter((a) => a.status === "Available").length },
          { label: "In use", value: assets.filter((a) => a.status === "In use").length },
          { label: "In repair", value: assets.filter((a) => a.status === "In repair").length },
        ]}
      />
      <DataTable
        columns={columns}
        data={assets}
        getRowId={(a) => a.id}
        searchable
        searchPlaceholder="Search assets"
        viewToggle
        columnToggle
        exportFilename="assets"
        selectable
        rowActions={(a) => (
          <>
            <DropdownMenuItem asChild><a href="/preview/record-detail">Open</a></DropdownMenuItem>
            <DropdownMenuItem onSelect={() => { remove([a.id]); toast.success(`${a.code} removed.`); }}>Remove</DropdownMenuItem>
          </>
        )}
        bulkActions={(rows, clear) => (
          <Button variant="danger" size="sm" onClick={() => { remove(rows.map((r) => r.id)); clear(); toast.success(`${rows.length} assets removed.`); }}>Remove</Button>
        )}
      />
    </DemoShell>
  );
}
