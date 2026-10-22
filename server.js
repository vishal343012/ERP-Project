const express = require("express");
const path = require("path");
const { Pool } = require("pg");

const app = express();
const port = process.env.PORT || 8080;
app.use(express.json({ limit: "1mb" }));
app.use(express.static(path.join(__dirname, "public")));

const pool = new Pool({
  host: process.env.PGHOST,
  port: Number(process.env.PGPORT || 5432),
  database: process.env.PGDATABASE,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  ssl: { rejectUnauthorized: false },
  connectionTimeoutMillis: 10000,
  max: 5
});

app.get("/api/health", async (req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({ status: "healthy", app: "erp-single-appservice-poc", database: "connected" });
  } catch (error) {
    console.error("Database health check failed:", error.message);
    res.status(503).json({ status: "unhealthy", app: "erp-single-appservice-poc", database: "disconnected" });
  }
});

app.get("/api/summary", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT COUNT(*)::int AS customers, COUNT(*) FILTER (WHERE status = 'Active')::int AS active_customers FROM customers"
    );
    res.json({ customers: result.rows[0].customers, activeCustomers: result.rows[0].active_customers,
      openInvoices: 12, pendingApprovals: 4, monthlyRevenue: 128450 });
  } catch (error) {
    console.error("Summary query failed:", error.message);
    res.status(500).json({ error: "Unable to load ERP summary" });
  }
});

app.get("/api/customers", async (req, res) => {
  try {
    const result = await pool.query("SELECT id, name, contact, status, created_at FROM customers ORDER BY id DESC");
    res.json(result.rows);
  } catch (error) {
    console.error("Customer query failed:", error.message);
    res.status(500).json({ error: "Unable to fetch customers" });
  }
});

app.post("/api/customers", async (req, res) => {
  const name = String(req.body?.name || "").trim().slice(0, 100);
  const contact = String(req.body?.contact || "").trim().slice(0, 150);
  if (!name || !contact) return res.status(400).json({ error: "Customer name and contact are required." });
  try {
    const result = await pool.query(
      "INSERT INTO customers (name, contact, status) VALUES ($1, $2, 'Active') RETURNING id, name, contact, status, created_at",
      [name, contact]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Customer insert failed:", error.message);
    res.status(500).json({ error: "Unable to save customer. Check database schema and connection." });
  }
});

app.get("*", (req, res) => {
  if (req.path.startsWith("/api/")) return res.status(404).json({ error: "API route not found" });
  return res.sendFile(path.join(__dirname, "public", "index.html"));
});

const server = app.listen(port, () => console.log(`ERP POC listening on port ${port}`));
async function shutdown() {
  await pool.end().catch(() => {});
  server.close(() => process.exit(0));
}
process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
