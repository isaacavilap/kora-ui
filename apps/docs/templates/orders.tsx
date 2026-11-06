"use client";
import { useMemo, useState } from "react";
import { Badge, Button, Dialog, DialogContent, DropdownMenuItem, Field, Input, PageHeader, Select, Sheet, SheetContent, StatGroup, Tabs, TabsContent, TabsList, TabsTrigger, Toaster, toast } from "kora-ui";
import { DataTable, type DataTableColumn } from "kora-ui/table";
import { Plus } from "lucide-react";
import { money, orders as seed, statusTone, type Order, type OrderStatus } from "@/lib/demo-data";
import { DemoShell } from "./shell";

const statusOptions = (["paid", "pending", "failed", "refunded"] as OrderStatus[]).map((s) => ({ value: s, label: s[0]!.toUpperCase() + s.slice(1) }));

export default function Template() {
  const [orders, setOrders] = useState(seed);
  const [creating, setCreating] = useState(false);
  const [viewing, setViewing] = useState<Order>();
  const [deleting, setDeleting] = useState<Order[]>();

  const columns = useMemo<DataTableColumn<Order>[]>(
    () => [
      { id: "id", header: "Order", accessor: "id", sortable: true },
      { id: "customer", header: "Customer", accessor: "customer", sortable: true },
      { id: "email", header: "Email", accessor: "email", hideOnMobile: true },
      { id: "date", header: "Date", accessor: "date", sortable: true, filter: { type: "date" } },
      { id: "status", header: "Status", accessor: "status", sortable: true, filter: { type: "select", options: statusOptions }, cell: (o) => <Badge tone={statusTone[o.status]} className="capitalize">{o.status}</Badge> },
      { id: "total", header: "Total", accessor: "total", sortable: true, align: "right", cell: (o) => money(o.total) },
    ],
    [],
  );
  const attention = useMemo(() => orders.filter((o) => o.status === "pending" || o.status === "failed"), [orders]);
  const ordersTable = (rows: Order[]) => (
    <DataTable
      columns={columns}
      data={rows}
      getRowId={(o) => o.id}
      searchable
      searchPlaceholder="Search orders"
      columnToggle
      selectable
      rowActions={(o) => (
        <>
          <DropdownMenuItem onSelect={() => setViewing(o)}>View details</DropdownMenuItem>
          <DropdownMenuItem onSelect={() => setDeleting([o])}>Delete</DropdownMenuItem>
        </>
      )}
      onRowClick={setViewing}
      bulkActions={(selected, clear) => (
        <Button variant="danger" size="sm" onClick={() => { setDeleting(selected); clear(); }}>Delete</Button>
      )}
    />
  );

  return (
    <DemoShell page="orders" title="Orders">
      <Toaster />
      <PageHeader title="Orders" description="Every order from your store, newest first." actions={<Button onClick={() => setCreating(true)} className="max-md:w-full"><Plus aria-hidden />New order</Button>} />
      <StatGroup
        className="mb-4"
        stats={[
          { label: "Paid", value: orders.filter((o) => o.status === "paid").length, delta: 4.2 },
          { label: "Pending", value: orders.filter((o) => o.status === "pending").length },
          { label: "Failed", value: orders.filter((o) => o.status === "failed").length, delta: -8, invertDelta: true },
          { label: "Refunded", value: orders.filter((o) => o.status === "refunded").length },
        ]}
      />
      <Tabs defaultValue="all" className="mb-3">
        <TabsList>
          <TabsTrigger value="all">All orders</TabsTrigger>
          <TabsTrigger value="attention">Needs attention</TabsTrigger>
        </TabsList>
        <TabsContent value="all" className="mt-3">{ordersTable(orders)}</TabsContent>
        <TabsContent value="attention" className="mt-3">{ordersTable(attention)}</TabsContent>
      </Tabs>

      <Sheet open={Boolean(viewing)} onOpenChange={(open) => !open && setViewing(undefined)}>
        <SheetContent title={viewing?.id} description={viewing?.customer}>
          {viewing && (
            <dl className="grid grid-cols-2 gap-y-3 text-sm">
              <dt className="text-[var(--kora-muted)]">Status</dt><dd><Badge tone={statusTone[viewing.status]} className="capitalize">{viewing.status}</Badge></dd>
              <dt className="text-[var(--kora-muted)]">Date</dt><dd>{viewing.date}</dd>
              <dt className="text-[var(--kora-muted)]">Email</dt><dd className="truncate">{viewing.email}</dd>
              <dt className="text-[var(--kora-muted)]">Total</dt><dd>{money(viewing.total)}</dd>
            </dl>
          )}
        </SheetContent>
      </Sheet>

      <Dialog open={creating} onOpenChange={setCreating}>
        <DialogContent title="New order" description="Add an order by hand, such as a phone sale.">
          <form
            className="grid gap-4"
            onSubmit={(e) => {
              e.preventDefault();
              const form = new FormData(e.currentTarget);
              setOrders([
                { id: `KR-${2049 + orders.length - seed.length}`, customer: String(form.get("customer")), email: String(form.get("email")), date: new Date().toISOString().slice(0, 10), status: "pending", total: Number(form.get("total")) },
                ...orders,
              ]);
              setCreating(false);
              toast.success("Order created.");
            }}
          >
            <Field label="Customer"><Input name="customer" required /></Field>
            <Field label="Email"><Input name="email" type="email" required /></Field>
            <Field label="Total"><Input name="total" type="number" min="1" required /></Field>
            <Button type="submit" className="justify-self-end max-md:w-full">Create order</Button>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(deleting)} onOpenChange={(open) => !open && setDeleting(undefined)}>
        <DialogContent
          title={`Delete ${deleting?.length ?? 0} orders?`}
          description="This removes them and their invoices. You cannot undo this."
          footer={
            <>
              <Button variant="secondary" onClick={() => setDeleting(undefined)}>Cancel</Button>
              <Button
                variant="danger"
                onClick={() => {
                  const ids = new Set(deleting?.map((o) => o.id));
                  setOrders(orders.filter((o) => !ids.has(o.id)));
                  setDeleting(undefined);
                  toast.success("Orders deleted.");
                }}
              >
                Delete orders
              </Button>
            </>
          }
        />
      </Dialog>
    </DemoShell>
  );
}

