const $ = (id) => document.getElementById(id);
const dialog = $("customerDialog");

const response = await fetch("/api/customers", {
  method: "POST",
  headers: {
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    name: customerName,
    email: customerEmail
  })
});
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.error || `Request failed (${response.status})`);
  return body;
}

function initials(name) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map(part => part[0]).join("").toUpperCase();
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
    name.textContent = customer.name;
    wrapper.append(avatar, name);
    nameCell.appendChild(wrapper);

    const contact = document.createElement("td");
    contact.textContent = customer.contact;
    const status = document.createElement("td");
    const pill = document.createElement("span");
    pill.className = `pill ${customer.status.toLowerCase()}`;
    pill.textContent = customer.status;
    status.appendChild(pill);
    const id = document.createElement("td");
    id.textContent = `CUS-${String(customer.id).padStart(4, "0")}`;
    tr.append(nameCell, contact, status, id);
    rows.appendChild(tr);
  }
  $("recordCount").textContent = `${customers.length} customer record${customers.length === 1 ? "" : "s"}`;
  $("customerCount").textContent = customers.length;
  $("activeCount").textContent = customers.filter(c => c.status === "Active").length;
}

async function loadData() {
  try {
    const [customers, summary, health] = await Promise.all([
      api("/api/customers"), api("/api/summary"), api("/api/health")
    ]);
    renderCustomers(customers);
    $("invoiceCount").textContent = summary.openInvoices;
    $("revenue").textContent = new Intl.NumberFormat("en-IN", {
      style: "currency", currency: "INR", maximumFractionDigits: 0
    }).format(summary.monthlyRevenue);
    $("healthText").textContent = `Health endpoint: ${health.status}; database: ${health.database}`;
  } catch (error) {
    $("healthText").textContent = `API error: ${error.message}`;
    $("customerRows").innerHTML = '<tr><td colspan="4">Could not load API data. Check the application logs.</td></tr>';
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

$("customerForm").addEventListener("submit", async (event) => {
  event.preventDefault();
  $("formError").textContent = "";
  const button = event.submitter;
  button.disabled = true;
  button.textContent = "Saving…";
  try {
    await api("/api/customers", {
      method: "POST",
      body: JSON.stringify({
        name: $("name").value.trim(),
        contact: $("contact").value.trim()
      })
    });
    $("customerForm").reset();
    dialog.close();
    await loadData();
  } catch (error) {
    $("formError").textContent = error.message;
  } finally {
    button.disabled = false;
    button.textContent = "Create customer";
  }
});

loadData();
