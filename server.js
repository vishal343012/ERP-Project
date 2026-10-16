const express = require("express");
const path = require("path");

const app = express();
const port = process.env.PORT || 8080;
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// DEMO ONLY: in-memory sample data. It resets on restart and is not shared
// between scaled-out instances. PostgreSQL will replace this in the next phase.
const products = [
  { id: "SKU-1001", name: "Office Chair", category: "Furniture", stock: 24, price: 4999, supplier: "Office Supply Co." },
  { id: "SKU-1002", name: "Laptop 14-inch", category: "Electronics", stock: 12, price: 58999, supplier: "TechSource India" },
  { id: "SKU-1003", name: "A4 Paper Box", category: "Stationery", stock: 75, price: 1250, supplier: "PaperTrail Traders" },
  { id: "SKU-1004", name: "Wireless Keyboard", category: "Electronics", stock: 31, price: 1799, supplier: "TechSource India" },
  { id: "SKU-1005", name: "Filing Cabinet", category: "Furniture", stock: 8, price: 8999, supplier: "Office Supply Co." },
  { id: "SKU-1006", name: "LED Monitor 24-inch", category: "Electronics", stock: 4, price: 12499, supplier: "TechSource India" }
];

const customers = [
  { id: "CUS-001", name: "Northwind Traders", contact: "procurement@northwind.example", phone: "+91 22 4000 1001", city: "Mumbai", status: "Active" },
  { id: "CUS-002", name: "Contoso Services", contact: "accounts@contoso.example", phone: "+91 20 4000 1002", city: "Pune", status: "Active" },
  { id: "CUS-003", name: "Fabrikam Retail", contact: "buying@fabrikam.example", phone: "+91 80 4000 1003", city: "Bengaluru", status: "Active" },
  { id: "CUS-004", name: "Adventure Works", contact: "admin@adventure.example", phone: "+91 40 4000 1004", city: "Hyderabad", status: "Inactive" }
];

const suppliers = [
  { id: "SUP-001", name: "TechSource India", category: "Electronics", contact: "sales@techsource.example", phone: "+91 22 4100 2001", city: "Mumbai", terms: "Net 30", status: "Approved" },
  { id: "SUP-002", name: "Office Supply Co.", category: "Furniture", contact: "orders@officesupply.example", phone: "+91 20 4100 2002", city: "Pune", terms: "Net 15", status: "Approved" },
  { id: "SUP-003", name: "PaperTrail Traders", category: "Stationery", contact: "hello@papertrail.example", phone: "+91 33 4100 2003", city: "Kolkata", terms: "Prepaid", status: "Review" },
  { id: "SUP-004", name: "Metro Industrial", category: "Equipment", contact: "vendor@metroindustrial.example", phone: "+91 44 4100 2004", city: "Chennai", terms: "Net 30", status: "Approved" }
];

const orders = [
  { id: "SO-2026-001", customer: "Northwind Traders", date: "2026-10-12", status: "Processing", total: 68498 },
  { id: "SO-2026-002", customer: "Contoso Services", date: "2026-10-13", status: "Shipped", total: 12490 },
  { id: "SO-2026-003", customer: "Fabrikam Retail", date: "2026-10-15", status: "Pending", total: 58999 },
  { id: "SO-2026-004", customer: "Adventure Works", date: "2026-10-16", status: "Delivered", total: 8999 }
];

app.get("/health", (_req, res) => res.json({ status: "healthy", app: "Suroj ERP Demo", version: "2.0.0", timestamp: new Date().toISOString() }));
app.get("/api/summary", (_req, res) => res.json({
  revenue: orders.reduce((sum, order) => sum + order.total, 0),
  orderCount: orders.length, customerCount: customers.length, productCount: products.length,
  supplierCount: suppliers.length, lowStockCount: products.filter(p => p.stock < 10).length
}));
app.get("/api/orders", (_req, res) => res.json(orders));
app.get("/api/products", (_req, res) => res.json(products));
app.get("/api/customers", (_req, res) => res.json(customers));
app.get("/api/suppliers", (_req, res) => res.json(suppliers));

app.post("/api/orders", (req, res) => {
  const { customer, total } = req.body || {};
  if (typeof customer !== "string" || !customer.trim() || !Number.isFinite(Number(total)) || Number(total) <= 0) {
    return res.status(400).json({ error: "Provide a customer name and a positive numeric total." });
  }
  const order = {
    id: `SO-DEMO-${String(orders.length + 1).padStart(3, "0")}`,
    customer: customer.trim(), date: new Date().toISOString().slice(0, 10),
    status: "Pending", total: Number(total)
  };
  orders.unshift(order);
  res.status(201).json(order);
});

app.get("*", (_req, res) => res.sendFile(path.join(__dirname, "public", "index.html")));
app.listen(port, () => console.log(`Suroj ERP Demo v2 listening on port ${port}`));
