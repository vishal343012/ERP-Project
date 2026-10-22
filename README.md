# ERP POC — PostgreSQL integrated

## Required table
Run this in the `erpdb` database using pgAdmin Query Tool:

```sql
CREATE TABLE IF NOT EXISTS customers (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  contact VARCHAR(150) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'Active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

If you already created a `customers` table with different columns (for example `email` and `company`), align the schema before deploying this code.

## App Service settings
- `PGHOST`: Azure PostgreSQL server hostname
- `PGPORT`: `5432`
- `PGDATABASE`: `erpdb`
- `PGUSER`: actual PostgreSQL login
- `PGPASSWORD`: PostgreSQL password

The app uses TLS encryption. `rejectUnauthorized: false` does not validate the server certificate, so configure the trusted CA and certificate verification before production use.

## API checks
- `GET /api/health` — checks database connectivity
- `GET /api/customers` — reads customers from PostgreSQL
- `POST /api/customers` — creates a customer with JSON body `{"name":"Demo Customer","contact":"demo@example.com"}`
- `GET /api/summary` — counts customers from PostgreSQL; invoice and revenue values are still demo placeholders

Deploy the ZIP with `server.js`, `package.json`, and `public/` at the ZIP root. Ensure the App Service build/deployment installs dependencies (`npm install`). Add authentication/authorization and production-grade security before real customer use.
