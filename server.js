const express = require("express");
const path = require("path");

const app = express();
const port = process.env.PORT || 8080;

app.use(express.json({ limit: "1mb" }));
app.use(express.static(path.join(__dirname, "public")));

// POC-only in-memory data. Data resets when the app restarts or an instance changes.
// Replace this with PostgreSQL later; never use in-memory storage for production ERP data.
let nextId = 4;
let customers = [
  { id: 1, name: "Aster Manufacturing", contact: "ops@aster.example", status: "Active" },
  { id: 2, name: "Northstar Traders", contact: "accounts@northstar.example", status: "Active" },
  { id: 3, name: "BluePeak Services", contact: "admin@bluepeak.example", status: "Pending" }
];

app.get("/api/health", (req, res) => {
  res.json({ status: "healthy", app: "erp-single-appservice-poc", database: "not-configured" });
});

app.get("/api/summary", (req, res) => {
  res.json({
    customers: customers.length,
    activeCustomers: customers.filter(c => c.status === "Active").length,
    openInvoices: 12,
    pendingApprovals: 4,
    monthlyRevenue: 128450
  });
});

app.get("/api/customers", (req, res) => {
  res.json(customers);
});

app.post("/api/customers", (req, res) => {
  const name = String(req.body?.name || "").trim();
  const contact = String(req.body?.contact || "").trim();

  if (!name || !contact) {
    return res.status(400).json({ error: "Customer name and contact are required." });
  }

  const customer = {
    id: nextId++,
    name: name.slice(0, 100),
    contact: contact.slice(0, 150),
    status: "Active"
  };
  customers.push(customer);
  return res.status(201).json(customer);
});

// Single App Service pattern: Node serves the frontend and handles /api/* routes.
// Angular can replace this static demo frontend later, keeping the same API contract.
app.get("*", (req, res, next) => {
  if (req.path.startsWith("/api/")) {
    return res.status(404).json({ error: "API route not found" });
  }
  return res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(port, () => {
  console.log(`ERP POC listening on port ${port}`);
});
