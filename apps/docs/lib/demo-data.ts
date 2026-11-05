export const wait = (ms = 700) => new Promise((resolve) => setTimeout(resolve, ms));

export const money = (value: number) => `$${value.toLocaleString("en-US")}`;

export const revenue = [
  { month: "Jan", revenue: 42100, costs: 28800 },
  { month: "Feb", revenue: 45300, costs: 29400 },
  { month: "Mar", revenue: 51200, costs: 31100 },
  { month: "Apr", revenue: 49800, costs: 30600 },
  { month: "May", revenue: 56400, costs: 32900 },
  { month: "Jun", revenue: 61700, costs: 34200 },
  { month: "Jul", revenue: 59300, costs: 33800 },
  { month: "Aug", revenue: 64800, costs: 35500 },
  { month: "Sep", revenue: 70200, costs: 37100 },
  { month: "Oct", revenue: 73900, costs: 38400 },
  { month: "Nov", revenue: 78600, costs: 40200 },
  { month: "Dec", revenue: 84300, costs: 41900 },
];

export const channels = [
  { name: "Organic search", value: 4820 },
  { name: "Direct", value: 2960 },
  { name: "Referral", value: 1740 },
  { name: "Email", value: 1180 },
  { name: "Paid", value: 860 },
];

export type OrderStatus = "paid" | "pending" | "failed" | "refunded";
export type Order = { id: string; customer: string; email: string; date: string; status: OrderStatus; total: number };

const customers = ["Marta Ríos", "Tomás Vega", "Lucía Herrera", "Diego Paredes", "Ana Castillo", "Pablo Mora", "Sofía Delgado", "Iván Quintero", "Elena Soto", "Hugo Navarro", "Clara Méndez", "Raúl Ibarra"];
const statuses: OrderStatus[] = ["paid", "paid", "pending", "paid", "failed", "paid", "refunded", "paid", "pending", "paid"];

export const orders: Order[] = Array.from({ length: 48 }, (_, i) => {
  const customer = customers[i % customers.length]!;
  return {
    id: `KR-${String(2048 - i)}`,
    customer,
    email: `${customer.split(" ")[0]!.toLowerCase().normalize("NFD").replace(/[^a-z]/g, "")}@example.com`,
    date: new Date(Date.UTC(2026, 9, 30 - (i % 30))).toISOString().slice(0, 10),
    status: statuses[i % statuses.length]!,
    total: 48 + ((i * 137) % 920),
  };
});

export const statusTone = { paid: "success", pending: "warning", failed: "danger", refunded: "neutral" } as const;

