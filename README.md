# ERP Single-App-Service POC (Angular-style frontend + Node.js API)

This sample demonstrates a single Azure App Service hosting a browser UI and a Node.js/Express API. It intentionally does **not** use PostgreSQL yet.

## What is included

- ERP-style dashboard UI (`public/`)
- Node.js Express API (`server.js`)
- `GET /api/health`
- `GET /api/summary`
- `GET /api/customers`
- `POST /api/customers`
- Customer add form in the UI

## Important POC limitation

The demo stores customer records in an in-memory JavaScript array. Data resets when the app restarts and is not shared between multiple App Service instances. It is only for a connectivity/UI proof of concept. Do not use this storage model for production or sensitive customer data.

## Run locally

Requirements: Node.js 20 or later and npm.

```bash
npm install
npm start
```

Open `http://localhost:8080`. Test `http://localhost:8080/api/health`.

## Deploy to one Azure App Service

1. Create a resource group for the POC.
2. Create a Linux App Service Plan (for a cost-controlled POC, choose a SKU appropriate for your test; production sizing requires load testing).
3. Create one Web App using Node.js 20 LTS or another currently supported Node.js LTS runtime.
4. Set the deployment source to this project repository or deploy the project ZIP.
5. Ensure the App Service startup command is `npm start` if the runtime does not infer it from `package.json`.
6. Configure application settings as needed and enable HTTPS.
7. Open the Web App URL. The dashboard calls the same-origin `/api/*` endpoints, so no separate API hostname or CORS setup is required.
8. Check `/api/health` and App Service Log stream if the app does not start.

### ZIP deployment notes

Zip the *contents* of this folder (so `package.json`, `server.js`, and `public/` are at the ZIP root), not the parent folder itself. Configure App Service to install production dependencies during deployment/build. If using a deployment workflow, use GitHub Actions or Azure DevOps with a supported Azure authentication method.

## How the single App Service works

- `/` serves `public/index.html`, CSS and browser JavaScript.
- `/api/health`, `/api/summary`, `/api/customers` are handled by Express.
- `POST /api/customers` validates the submitted fields and adds a record to the in-memory list.

## Later: connect PostgreSQL

When the UI/API POC works:

1. Create Azure Database for PostgreSQL Flexible Server.
2. Configure a supported private networking model and DNS.
3. Configure App Service VNet Integration as required for outbound private connectivity.
4. Add secure database settings / Key Vault references; do not commit secrets.
5. Replace the in-memory `customers` array with parameterized SQL using `pg` or a suitable ORM.
6. Add schema migrations, least-privilege database roles, connection pooling, TLS, error handling, backups and monitoring.
7. Load-test before choosing production compute and autoscale limits.

## Later: split into two App Services

- Web App: serves Angular frontend.
- API App: serves Node.js endpoints.
- Update Angular API base URL or Front Door path routing.
- Configure CORS only if the browser calls a different origin.
- Apply private-origin and authentication controls as appropriate.

## Security warning

This is a demo, not production ERP code. It has no user authentication, authorization, durable persistence, audit trail, CSRF strategy, rate limiting, malware scanning, or production-grade error handling. Do not expose it as a real business system.
