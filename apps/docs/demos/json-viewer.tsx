"use client";
import { JsonViewer } from "kora-ui";

const order = {
  id: "ord_8F2K",
  status: "paid",
  total: 128.4,
  gift: false,
  coupon: null,
  customer: { name: "Ana García", email: "ana@example.com", "phone number": "+507 6000-0000" },
  items: [
    { sku: "TSHIRT-M", qty: 2, price: 24.5 },
    { sku: "MUG", qty: 1, price: 12 },
  ],
  note: "Please leave the package with the guard at the entrance of the building, next to the blue door, and call when it arrives so someone can come down.",
  tags: [],
};

export default function Demo() {
  return <JsonViewer data={order} expandDepth={1} aria-label="Order" className="max-h-96" />;
}
