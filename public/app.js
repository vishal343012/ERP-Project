
const $ = (id) => document.getElementById(id);
const dialog = $("customerDialog");

async function api(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    }
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(body.error || `Request failed (${response.status})`);
  }
  return body;
}

function initials(name = "") {
  return name.split(/\s+/).filter(Boolean).slice(0, 2)
    .map(part => part[0]).join("").toUpperCase();
}

function renderCustomers(customers) {
  const rows = $("customerRows");
  rows.replaceChildren();

  if (!customers.length) {
    const tr = document.createElement("tr");
    const td = document.createElement("td");
    td.colSpan = 4;
    td.textContent = "No customers yet. Add the first customer.";
    tr.appendChild(td);
    rows.appendChild(tr);
  }

  for (const customer of customers) {
    const tr = document.createElement("tr");
    const nameCell = document.createElement("td");
    const wrapper = document.createElement("div");
    wrapper.className = "customer-name";

    const avatar = document.createElement("span");
    avatar.className = "mini-avatar";
    avatar.textContent = initials(customer.name);

    const name = document.createElement("span");
    name.textContent = customer.name || "";
    wrapper.append(avatar, name);
    nameCell.appendChild(wrapper);

    const contact = document.createElement("td");
    contact.textContent = customer.email || customer.contact || "";

    const status = document.createElement("td");
    const pill = document.createElement("span");
    const customerStatus = customer.status || "Active";
    pill.className = `pill ${customerStatus.toLowerCase()}`;
    pill.textContent = customerStatus;
    status.appendChild(pill);

    const id = document.createElement("td");
    id.textContent = `CUS-${String(customer.id).padStart(4, "0")}`;
    tr.append(nameCell, contact, status, id);
    rows.appendChild(tr);
  }

  $("recordCount").textContent =
    `${customers.length} customer record${customers.length === 1 ? "" : "s"}`;
  $("customerCount").textContent = customers.length;
  $("activeCount").textContent =
    customers.filter(c => (c.status || "Active") === "Active").length;
}

async function loadData() {
  try {
    const [customers, summary, health] = await Promise.all([
      api("/api/customers"),
      api("/api/summary"),
      api("/api/health")
    ]);
    renderCustomers(customers);
    $("invoiceCount").textContent = summary.openInvoices ?? 0;
    $("revenue").textContent = new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0
    }).format(summary.monthlyRevenue ?? 0);
    $("healthText").textContent =
      `Health endpoint: ${health.status}; database: ${health.database}`;
  } catch (error) {
    console.error("Dashboard loading failed:", error);
    $("healthText").textContent = `API error: ${error.message}`;
    const rows = $("customerRows");
    rows.replaceChildren();
    const tr = document.createElement("tr");
    const td = document.createElement("td");
    td.colSpan = 4;
    td.textContent = "Could not load API data. Check the application logs.";
    tr.appendChild(td);
    rows.appendChild(tr);
  }
}

function openDialog() {
  $("formError").textContent = "";
  dialog.showModal();
  $("name").focus();
}

$("addTop").addEventListener("click", openDialog);
$("refresh").addEventListener("click", loadData);
$("closeDialog").addEventListener("click", () => dialog.close());
$("cancelDialog").addEventListener("click", () => dialog.close());

$("customerForm").addEventListener("submit", async event => {
  event.preventDefault();
  $("formError").textContent = "";
  const button = event.submitter ||
    $("customerForm").querySelector('[type="submit"]');

  if (button) {
    button.disabled = true;
    button.textContent = "Saving…";
  }

  try {
    await api("/api/customers", {
      method: "POST",
      body: JSON.stringify({
        name: $("name").value.trim(),
        email: $("contact").value.trim()
      })
    });
    $("customerForm").reset();
    dialog.close();
    await loadData();
  } catch (error) {
    console.error("Customer creation failed:", error);
    $("formError").textContent = error.message || "Unable to save customer.";
  } finally {
    if (button) {
      button.disabled = false;
      button.textContent = "Create customer";
    }
  }
});

loadData();
