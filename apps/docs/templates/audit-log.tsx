"use client";
import { Avatar, Badge, DescriptionList, PageHeader } from "kora-ui";
import { DataTable, type DataTableColumn } from "kora-ui/table";
import { activityLog, type LogEntry } from "@/lib/demo-data";
import { DemoShell } from "./shell";

const actionTone = { Created: "success", Updated: "info", Deleted: "danger", "Signed in": "neutral" } as const;

const columns: DataTableColumn<LogEntry>[] = [
  { id: "date", header: "Date", accessor: "date", sortable: true, filter: { type: "date" }, cell: (l) => `${l.date} ${l.time}` },
  {
    id: "actor",
    header: "Person",
    accessor: "actor",
    sortable: true,
    filter: { type: "select" },
    cell: (l) => (
      <span className="flex items-center gap-2">
        <Avatar name={l.actor} size={24} />
        {l.actor}
      </span>
    ),
  },
  { id: "action", header: "Action", accessor: "action", filter: { type: "select" }, cell: (l) => <Badge tone={actionTone[l.action]}>{l.action}</Badge> },
  { id: "record", header: "Record", accessor: "record", sortable: true },
];

export default function Template() {
  return (
    <DemoShell page="audit-log" title="Activity log">
      <PageHeader title="Activity log" description="Who did what, and when. Entries cannot be edited." />
      <DataTable
        columns={columns}
        data={activityLog}
        getRowId={(l) => l.id}
        searchable
        searchPlaceholder="Search the log"
        exportFilename="activity-log"
        pageSize={12}
        renderExpanded={(l) => (
          <DescriptionList
            items={[
              { label: "Change", value: l.change },
              { label: "Time", value: `${l.date} ${l.time}` },
            ]}
          />
        )}
      />
    </DemoShell>
  );
}
