"use client";
import { RankedList } from "kora-ui";
import { topProducts } from "@/lib/demo-data";

export default function Demo() {
  return <RankedList className="max-w-md" items={topProducts} />;
}
