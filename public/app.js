const money = value => new Intl.NumberFormat("en-IN", {style:"currency",currency:"INR",maximumFractionDigits:0}).format(value);
const fmtDate = value => new Date(`${value}T00:00:00`).toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"numeric"});
const safe = value => String(value ?? "").replace(/[&<>"']/g, ch => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));
const api = async (url, options) => {
  const response = await fetch(url, options);
  if (!response.ok) { const body = await response.json().catch(()=>({})); throw new Error(body.error || `Request failed (${response.status})`); }
  return response.json();
};
let state = {orders:[], products:[], customers:[], suppliers:[]};
const status = value => `<span class="pill ${safe(value).toLowerCase()}">${safe(value)}</span>`;
const orderRows = list => list.map(o=>`<tr><td>${safe(o.id)}</td><td>${safe(o.customer)}</td><td>${fmtDate(o.date)}</td><td>${status(o.status)}</td><td class="right">${money(o.total)}</td></tr>`).join("");
function renderOrders(){document.querySelector("#recent-orders").innerHTML=orderRows(state.orders.slice(0,5));document.querySelector("#sales-orders").innerHTML=orderRows(state.orders);}
function renderProducts(){
  const query=(document.querySelector("#product-search")?.value||"").toLowerCase();
  const rows=state.products.filter(p=>[p.id,p.name,p.category,p.supplier].some(v=>String(v).toLowerCase().includes(query)));
  document.querySelector("#inventory-count").textContent=`${rows.length} items`;
  document.querySelector("#inventory-rows").innerHTML=rows.map(p=>`<tr><td>${safe(p.id)}</td><td>${safe(p.name)}</td><td>${safe(p.category)}</td><td>${safe(p.supplier)}</td><td>${p.stock} ${p.stock<10?'<span class="pill pending">Low stock</span>':""}</td><td class="right">${money(p.price)}</td></tr>`).join("")||'<tr><td colspan="6">No matching products found.</td></tr>';
  const low=state.products.filter(p=>p.stock<10);
  document.querySelector("#low-stock-list").innerHTML=low.map(p=>`<div class="stock-item"><b>${safe(p.name)}</b><small>${p.stock} units left</small><div class="stock-bar"><span class="low" style="width:${Math.max(5,Math.min(100,p.stock))}%"></span></div></div>`).join("")||"<p>No low-stock products.</p>";
}
function renderCustomers(){
  const q=(document.querySelector("#customer-search")?.value||"").toLowerCase();
  const rows=state.customers.filter(c=>[c.id,c.name,c.contact,c.phone,c.city,c.status].some(v=>String(v).toLowerCase().includes(q)));
  document.querySelector("#customers-count").textContent=`${rows.length} customers`;
  document.querySelector("#customer-rows").innerHTML=rows.map(c=>`<tr><td>${safe(c.id)}</td><td>${safe(c.name)}</td><td>${safe(c.contact)}</td><td>${safe(c.phone)}</td><td>${safe(c.city)}</td><td>${status(c.status)}</td></tr>`).join("")||'<tr><td colspan="6">No matching customers found.</td></tr>';
}
function renderSuppliers(){
  const q=(document.querySelector("#supplier-search")?.value||"").toLowerCase();
  const rows=state.suppliers.filter(s=>[s.id,s.name,s.category,s.contact,s.phone,s.city,s.terms,s.status].some(v=>String(v).toLowerCase().includes(q)));
  document.querySelector("#suppliers-count").textContent=`${rows.length} suppliers`;
  document.querySelector("#supplier-rows").innerHTML=rows.map(s=>`<tr><td>${safe(s.id)}</td><td>${safe(s.name)}</td><td>${safe(s.category)}</td><td>${safe(s.contact)}</td><td>${safe(s.phone)}</td><td>${safe(s.city)}</td><td>${safe(s.terms)}</td><td>${status(s.status)}</td></tr>`).join("")||'<tr><td colspan="8">No matching suppliers found.</td></tr>';
}
function renderSummary(summary){
  document.querySelector("#metric-revenue").textContent=money(summary.revenue);
  document.querySelector("#metric-orders").textContent=summary.orderCount;
  document.querySelector("#metric-products").textContent=summary.productCount;
  document.querySelector("#metric-customers").textContent=summary.customerCount;
}
function navigate(view){
  const names={dashboard:"Dashboard",sales:"Sales",inventory:"Inventory",customers:"Customers",suppliers:"Suppliers"};
  Object.keys(names).forEach(key=>document.querySelector(`#view-${key}`).classList.toggle("hidden",key!==view));
  document.querySelectorAll("[data-view]").forEach(button=>button.classList.toggle("active",button.dataset.view===view));
  document.querySelector("#breadcrumb").textContent=names[view];
  document.querySelector("#page-title").textContent=names[view];
  document.querySelector("#page-subtitle").textContent=({dashboard:"Welcome back. Here's your business at a glance.",sales:"Manage sales orders and review order status.",inventory:"Browse products, quantities, prices and stock alerts.",customers:"Manage your sample customer directory.",suppliers:"Browse vendors, product categories and payment terms."})[view];
}
function notice(message,error=false){
  const el=document.querySelector("#notice");el.textContent=message;el.style.background=error?"#fff0ef":"#e5f8ef";el.style.color=error?"#b42318":"#137653";el.classList.add("show");setTimeout(()=>el.classList.remove("show"),4500);
}
async function refresh(){
  const [summary,orders,products,customers,suppliers]=await Promise.all([
    api("/api/summary"),api("/api/orders"),api("/api/products"),api("/api/customers"),api("/api/suppliers")
  ]);
  state={orders,products,customers,suppliers};
  renderSummary(summary);renderOrders();renderProducts();renderCustomers();renderSuppliers();
}
document.querySelectorAll("[data-view]").forEach(button=>button.addEventListener("click",()=>navigate(button.dataset.view)));
document.querySelector("#today").textContent=new Date().toLocaleDateString("en-IN",{weekday:"short",day:"2-digit",month:"short",year:"numeric"});
document.querySelector("#product-search").addEventListener("input",renderProducts);
document.querySelector("#customer-search").addEventListener("input",renderCustomers);
document.querySelector("#supplier-search").addEventListener("input",renderSuppliers);
document.querySelector("#new-order-btn").addEventListener("click",()=>document.querySelector("#order-form").classList.toggle("hidden"));
document.querySelector("#order-form").addEventListener("submit",async event=>{
  event.preventDefault();
  try{
    const order=await api("/api/orders",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({customer:document.querySelector("#order-customer").value,total:Number(document.querySelector("#order-total").value)})});
    event.target.reset();event.target.classList.add("hidden");await refresh();notice(`Created demo order ${order.id}. It is not saved permanently.`);
  }catch(error){notice(error.message,true);}
});
refresh().catch(error=>notice(`Could not load demo data: ${error.message}`,true));
