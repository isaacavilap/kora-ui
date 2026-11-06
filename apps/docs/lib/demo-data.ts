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


export const topProducts = [
  { label: "Paper filters, 100", value: 2210 },
  { label: "House blend, 500 g", value: 1840 },
  { label: "Ceramic mug", value: 688 },
  { label: "Boquete Geisha, 250 g", value: 612 },
  { label: "Descaling tablets", value: 431 },
];

export const salesByChannel = [
  { month: "Jul", online: 31200, wholesale: 18400, cafe: 9700 },
  { month: "Aug", online: 34800, wholesale: 19600, cafe: 10400 },
  { month: "Sep", online: 38300, wholesale: 21000, cafe: 10900 },
  { month: "Oct", online: 40100, wholesale: 22300, cafe: 11500 },
  { month: "Nov", online: 43800, wholesale: 22900, cafe: 11900 },
  { month: "Dec", online: 48200, wholesale: 23600, cafe: 12500 },
];

export type Stage = "new" | "approved" | "in-progress" | "done";
export type WorkRequest = { id: string; title: string; requester: string; assignee: string; date: string; stage: Stage; priority: "Low" | "Normal" | "High"; amount: number; location: string };

export const stages: Array<{ value: Stage; label: string; next?: Stage; action?: string }> = [
  { value: "new", label: "New", next: "approved", action: "Approve" },
  { value: "approved", label: "Approved", next: "in-progress", action: "Start work" },
  { value: "in-progress", label: "In progress", next: "done", action: "Mark as done" },
  { value: "done", label: "Done" },
];
export const stageTone = { new: "info", approved: "accent", "in-progress": "warning", done: "success" } as const;

const requestTitles = ["Replace espresso grinder", "Monthly supply order", "Repair walk-in fridge", "Install new register", "Deep clean, north site", "Order uniforms", "Fix patio lighting", "Renew health permit", "Service water filter", "Paint front counter"];
const assignees = ["Tomás Vega", "Lucía Herrera", "Diego Paredes", "Ana Castillo"];
const sites = ["Downtown", "Airport", "Riverside"];

export const requests: WorkRequest[] = Array.from({ length: 24 }, (_, i) => ({
  id: `RQ-${String(1024 - i)}`,
  title: requestTitles[i % requestTitles.length]!,
  requester: customers[i % customers.length]!,
  assignee: assignees[i % assignees.length]!,
  date: new Date(Date.UTC(2026, 9, 28 - (i % 25))).toISOString().slice(0, 10),
  stage: stages[(i * 3) % 4]!.value,
  priority: (["Normal", "High", "Normal", "Low"] as const)[i % 4]!,
  amount: 120 + ((i * 173) % 1800),
  location: sites[i % sites.length]!,
}));

export type Asset = { id: string; name: string; code: string; category: string; location: string; status: "Available" | "In use" | "In repair"; value: number };

export const assets: Asset[] = [
  { id: "a1", name: "Espresso machine, 3 group", code: "AS-101", category: "Equipment", location: "Downtown", status: "In use", value: 9800 },
  { id: "a2", name: "Espresso machine, 2 group", code: "AS-102", category: "Equipment", location: "Airport", status: "In use", value: 7200 },
  { id: "a3", name: "Burr grinder", code: "AS-103", category: "Equipment", location: "Riverside", status: "In repair", value: 1290 },
  { id: "a4", name: "Walk-in fridge", code: "AS-104", category: "Refrigeration", location: "Downtown", status: "In use", value: 6400 },
  { id: "a5", name: "Display fridge", code: "AS-105", category: "Refrigeration", location: "Airport", status: "Available", value: 2100 },
  { id: "a6", name: "Delivery van", code: "AS-106", category: "Vehicles", location: "Downtown", status: "In use", value: 24500 },
  { id: "a7", name: "Cargo bike", code: "AS-107", category: "Vehicles", location: "Riverside", status: "Available", value: 3200 },
  { id: "a8", name: "Point of sale, tablet", code: "AS-108", category: "Technology", location: "Airport", status: "In use", value: 890 },
  { id: "a9", name: "Point of sale, tablet", code: "AS-109", category: "Technology", location: "Riverside", status: "In repair", value: 890 },
];
export const assetTone = { Available: "success", "In use": "neutral", "In repair": "warning" } as const;

export type LogEntry = { id: string; actor: string; action: "Created" | "Updated" | "Deleted" | "Signed in"; record: string; date: string; time: string; change: string };
const logActions = ["Updated", "Created", "Signed in", "Updated", "Deleted"] as const;

export const activityLog: LogEntry[] = Array.from({ length: 30 }, (_, i) => {
  const action = logActions[i % logActions.length]!;
  return {
    id: `log${i}`,
    actor: customers[i % customers.length]!,
    action,
    record: action === "Signed in" ? "Account" : `RQ-${1024 - (i % 20)}`,
    date: new Date(Date.UTC(2026, 9, 30 - (i % 12))).toISOString().slice(0, 10),
    time: `${String(8 + (i % 10)).padStart(2, "0")}:${String((i * 7) % 60).padStart(2, "0")}`,
    change: action === "Updated" ? "Stage changed from New to Approved." : action === "Deleted" ? "Record removed." : action === "Created" ? "Record added." : "New session from a known device.",
  };
});

export type Company = { id: string; name: string; description: string; modules: string[]; revenue: number; delta: number; open: number; pastDue: number; people: number };

export const companies: Company[] = [
  { id: "coffee", name: "Kora Coffee", description: "Coffee shops", modules: ["requests", "agenda", "assets", "orders"], revenue: 68400, delta: 8.2, open: 18, pastDue: 2, people: 42 },
  { id: "roasters", name: "Norte Roasters", description: "Roasting plant", modules: ["requests", "assets", "report"], revenue: 41250, delta: -3.4, open: 9, pastDue: 1, people: 16 },
  { id: "logistics", name: "Vía Logistics", description: "Deliveries", modules: ["requests", "agenda", "report"], revenue: 22900, delta: 12.5, open: 12, pastDue: 0, people: 23 },
];

export const COMPANY_KEY = "kora-demo-company";

export const revenueByCompany = [
  { month: "Jul", coffee: 59200, roasters: 44100, logistics: 16800 },
  { month: "Aug", coffee: 61800, roasters: 43300, logistics: 18200 },
  { month: "Sep", coffee: 63200, roasters: 42700, logistics: 20350 },
  { month: "Oct", coffee: 68400, roasters: 41250, logistics: 22900 },
];
