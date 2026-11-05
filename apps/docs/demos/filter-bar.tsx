"use client";
import { useState } from "react";
import { Button, Select } from "kora-ui";
import { FilterBar } from "kora-ui/table";

const statuses = [
  { value: "paid", label: "Paid" },
  { value: "pending", label: "Pending" },
];

export default function Demo() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const active = Boolean(search || status);
  return (
    <FilterBar
      search={search}
      onSearchChange={setSearch}
      onClear={active ? () => { setSearch(""); setStatus(""); } : undefined}
      actions={<Button>New order</Button>}
    >
      <Select aria-label="Status" placeholder="Status" value={status} onValueChange={setStatus} options={statuses} />
    </FilterBar>
  );
}

