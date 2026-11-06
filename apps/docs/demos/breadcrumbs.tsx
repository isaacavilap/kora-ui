"use client";
import { Breadcrumbs } from "kora-ui";

export default function Demo() {
  return <Breadcrumbs items={[{ label: "Workspace", href: "#" }, { label: "Orders", href: "#" }, { label: "KC-1042" }]} />;
}
