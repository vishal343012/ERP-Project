# Suroj ERP Demo v2 — Azure App Service

Interactive sample ERP dashboard with Dashboard, Sales, Inventory, Customers, and Suppliers pages.

## Important limitations
- Learning/demo application only. It has no authentication or authorization and must not be used with real business data.
- Sample records are stored in Node.js process memory. Newly created sales orders disappear on restart and may not be visible across multiple instances.
- PostgreSQL, Blob Storage, Key Vault and real identity integration are not configured yet; those are planned for the next phase.
- Supplier/customer contact details use example domains and sample records.

## Run locally
Requires Node.js 20+ and npm.

```bash
npm install
npm start
```

Browse to `http://localhost:8080`. Health check: `http://localhost:8080/health`.

API endpoints:
- `GET /api/summary`
- `GET /api/orders`
- `POST /api/orders` JSON body: `{"customer":"Example Ltd","total":15000}`
- `GET /api/products`
- `GET /api/customers`
- `GET /api/suppliers`

## Deploy to Azure App Service
1. In Azure Portal, create a Web App using **Publish: Code**, **Linux**, and a supported Node.js LTS runtime.
2. Choose a test plan that fits your budget. A lower-cost tier is suitable for an initial disposable lab; Premium v3 can be used later to test production-like scaling and deployment slots.
3. Download the ZIP and deploy using Deployment Center or a supported ZIP deployment method. Ensure `package.json` and `server.js` are at the ZIP root.
4. Ensure the selected deployment process installs npm dependencies. Check deployment logs if the app fails to start. Startup command, if requested: `npm start`.
5. Open `https://YOUR-APP-NAME.azurewebsites.net` and check `/health`.

Azure CLI example, if CLI is installed and logged in:

```bash
az login
az webapp deploy --resource-group RG-ERP-TEST --name YOUR-UNIQUE-APP-NAME --src-path suroj-erp-demo-v2.zip --type zip
```

## Next phase
Add authentication, PostgreSQL persistence, database migrations, Blob Storage for uploads, Key Vault/managed identity, Application Insights, and appropriate private networking before using real data.
