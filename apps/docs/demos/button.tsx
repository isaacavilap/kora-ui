"use client";
import { Button } from "kora-ui";
import { Download, Plus } from "lucide-react";

export default function Demo() {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button><Plus aria-hidden />New order</Button>
      <Button variant="secondary"><Download aria-hidden />Export</Button>
      <Button variant="ghost">Cancel</Button>
      <Button variant="danger">Delete</Button>
      <Button loading>Saving</Button>
      <Button size="sm" variant="secondary">Small</Button>
      <Button size="icon" variant="secondary" aria-label="Add"><Plus aria-hidden /></Button>
    </div>
  );
}

