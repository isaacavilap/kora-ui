"use client";
import { useState } from "react";
import { Avatar, Badge, Button, DropdownMenuItem, Inline, KoraLink, PageHeader, Stack, StatGroup, Text, Toaster, toast } from "kora-ui";
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
      <Inline wrap={false} className="gap-2.5">
        <Avatar name={a.name} size={32} className="rounded-md" />
        <Stack gap="none">
          <Text strong className="truncate">{a.name}</Text>
          <Text size="xs" tone="muted">{a.code}</Text>
        </Stack>
      </Inline>
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
        actions={<Button asChild className="max-md:w-full"><KoraLink href="/preview/record-form"><Plus aria-hidden />Add asset</KoraLink></Button>}
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
            <DropdownMenuItem asChild><KoraLink href="/preview/record-detail">Open</KoraLink></DropdownMenuItem>
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
