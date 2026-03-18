import { NextRequest, NextResponse } from 'next/server'
import { getAdminSession } from '@/lib/auth'
import { query } from '@/lib/db'

function html(content: string, title = 'Admin') {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="google" content="notranslate">
<title>${title} — The Cheese Shop Admin</title>
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#f5f2eb;color:#2d1a00}
a{color:inherit;text-decoration:none}
input,select,textarea,button{font-family:inherit;font-size:14px}
.layout{display:flex;min-height:100vh}
.sidebar{width:220px;background:#fff;border-right:1px solid #e8dcc8;display:flex;flex-direction:column;position:fixed;top:0;bottom:0;left:0}
.sidebar-logo{padding:20px;border-bottom:1px solid #e8dcc8;font-size:17px;font-weight:600;display:flex;align-items:center;gap:8px}
.sidebar-nav{flex:1;padding:12px}
.nav-link{display:flex;align-items:center;gap:10px;padding:10px 12px;border-radius:8px;font-size:14px;font-weight:500;color:#5c3d00;margin-bottom:2px;cursor:pointer;border:none;background:none;width:100%;text-align:left}
.nav-link:hover{background:#fdf5e8}
.nav-link.active{background:#fef0d0;color:#c45e08}
.sidebar-bottom{padding:12px;border-top:1px solid #e8dcc8}
.main{margin-left:220px;flex:1;padding:32px}
.page-title{font-size:24px;font-weight:700;margin-bottom:24px;color:#1a0f00}
.card{background:#fff;border-radius:12px;border:1px solid #e8dcc8;padding:24px;margin-bottom:20px}
.stat-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-bottom:24px}
.stat{background:#fff;border-radius:12px;border:1px solid #e8dcc8;padding:20px}
.stat-label{font-size:13px;color:#7a5c00;margin-bottom:6px}
.stat-value{font-size:26px;font-weight:700;color:#1a0f00}
table{width:100%;border-collapse:collapse;font-size:14px}
th{text-align:left;padding:10px 14px;background:#faf5ec;color:#7a5c00;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:.5px;border-bottom:1px solid #e8dcc8}
td{padding:12px 14px;border-bottom:1px solid #f5ede0;color:#2d1a00}
tr:last-child td{border-bottom:none}
tr:hover td{background:#fdf9f3}
.badge{display:inline-block;padding:3px 10px;border-radius:99px;font-size:12px;font-weight:600}
.badge-pending{background:#fef3c7;color:#92400e}
.badge-confirmed{background:#dbeafe;color:#1e40af}
.badge-shipped{background:#ede9fe;color:#5b21b6}
.badge-completed{background:#d1fae5;color:#065f46}
.badge-cancelled{background:#fee2e2;color:#991b1b}
.btn{display:inline-flex;align-items:center;gap:6px;padding:9px 18px;border-radius:8px;font-size:14px;font-weight:600;cursor:pointer;border:none;transition:all .15s}
.btn-primary{background:#c45e08;color:#fff}
.btn-primary:hover{background:#a34e06}
.btn-danger{background:#fee2e2;color:#991b1b}
.btn-danger:hover{background:#fecaca}
.btn-secondary{background:#f5ede0;color:#5c3d00;border:1px solid #e8dcc8}
.btn-secondary:hover{background:#ede0cc}
input[type=text],input[type=email],input[type=number],input[type=password],select,textarea{width:100%;padding:9px 12px;border:1px solid #d4b896;border-radius:8px;font-size:14px;background:#fff;color:#2d1a00;outline:none}
input:focus,select:focus,textarea:focus{border-color:#c45e08;box-shadow:0 0 0 3px rgba(196,94,8,.15)}
.form-group{margin-bottom:16px}
.form-label{display:block;font-size:13px;font-weight:600;color:#5c3d00;margin-bottom:6px}
.form-row{display:grid;grid-template-columns:1fr 1fr;gap:16px}
.error{background:#fee2e2;color:#991b1b;padding:10px 14px;border-radius:8px;font-size:14px;margin-bottom:16px}
.success{background:#d1fae5;color:#065f46;padding:10px 14px;border-radius:8px;font-size:14px;margin-bottom:16px}
.empty{text-align:center;padding:60px 20px;color:#9e7a4a}
.empty-icon{font-size:48px;margin-bottom:12px}
.img-thumb{width:40px;height:40px;border-radius:6px;object-fit:cover;background:#f5ede0;display:flex;align-items:center;justify-content:center;font-size:20px}
.actions{display:flex;gap:6px}
#content{animation:fade .2s ease}
@keyframes fade{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:translateY(0)}}
.login-wrap{min-height:100vh;display:flex;align-items:center;justify-content:center;background:#f5f2eb}
.login-box{width:100%;max-width:380px;background:#fff;border-radius:16px;border:1px solid #e8dcc8;padding:36px}
.login-logo{text-align:center;margin-bottom:28px}
.login-logo .emoji{font-size:48px;display:block;margin-bottom:10px}
.login-logo h1{font-size:22px;font-weight:700;color:#1a0f00}
.login-logo p{font-size:14px;color:#9e7a4a;margin-top:4px}
select.status-select{width:auto;padding:6px 10px}
</style>
</head>
<body>${content}
<script>
function nav(page){
  document.querySelectorAll('.nav-link').forEach(l=>l.classList.remove('active'));
  var el=document.getElementById('nav-'+page);
  if(el)el.classList.add('active');
  loadPage(page);
}
async function loadPage(page){
  var el=document.getElementById('content');
  if(el)el.style.opacity='0';
  var res=await fetch('/api/admin-html?page='+page);
  var data=await res.json();
  if(el){el.innerHTML=data.html;el.style.opacity='1';}
}
async function deleteProduct(id,name){
  if(!confirm('Delete "'+name+'"? This cannot be undone.'))return;
  var res=await fetch('/api/products/'+id,{method:'DELETE'});
  if(res.ok){nav('products');}else{alert('Delete failed.');}
}
async function updateStatus(orderId,sel){
  var status=sel.value;
  var res=await fetch('/api/orders/'+orderId,{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({status})});
  if(res.ok){
    var badge=document.getElementById('badge-'+orderId);
    if(badge){badge.className='badge badge-'+status;badge.textContent=status.charAt(0).toUpperCase()+status.slice(1);}
    showMsg('Status updated!','success');
  }else{showMsg('Update failed.','error');}
}
function showMsg(msg,type){
  var d=document.createElement('div');
  d.className=type==='success'?'success':'error';
  d.textContent=msg;
  var c=document.getElementById('content');
  if(c){c.prepend(d);setTimeout(()=>d.remove(),3000);}
}
async function saveProduct(e,id){
  e.preventDefault();
  var form=e.target;
  var data={
    name:form.name_.value,
    description:form.description.value,
    short_description:form.short_description.value,
    price:parseFloat(form.price.value),
    cheese_type:form.cheese_type.value,
    in_stock:form.in_stock.checked,
    stock_quantity:parseInt(form.stock_quantity.value)||0,
    featured:form.featured.checked,
    images:[],
    weight_options:[]
  };
  var url=id?'/api/products/'+id:'/api/products';
  var method=id?'PUT':'POST';
  var res=await fetch(url,{method,headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});
  if(res.ok){nav('products');}
  else{var d=await res.json();showMsg(d.error||'Save failed.','error');}
}
async function logout(){
  await fetch('/api/auth',{method:'DELETE'});
  window.location.href='/admin/login';
}
</script>
</body>
</html>`
}

function sidebar(activePage: string) {
  const links = [
    { id: 'dashboard', label: '📊 Dashboard' },
    { id: 'products', label: '🧀 Products' },
    { id: 'orders', label: '📦 Orders' },
  ]
  return `
<div class="layout">
<div class="sidebar">
  <div class="sidebar-logo">🧀 Cheese Shop</div>
  <nav class="sidebar-nav">
    ${links.map(l => `<button id="nav-${l.id}" class="nav-link${activePage === l.id ? ' active' : ''}" onclick="nav('${l.id}')">${l.label}</button>`).join('')}
  </nav>
  <div class="sidebar-bottom">
    <button class="nav-link" onclick="window.open('/shop','_blank')">🌐 View Shop</button>
    <button class="nav-link" onclick="logout()" style="color:#991b1b">🚪 Sign Out</button>
  </div>
</div>
<div class="main"><div id="content">`
}

async function dashboardHtml() {
  const [statsRows, recentOrders] = await Promise.all([
    query(`SELECT COUNT(*) AS total_orders, COUNT(*) FILTER (WHERE status='pending') AS pending_orders, COALESCE(SUM(total_amount) FILTER (WHERE status!='cancelled'),0) AS total_revenue, (SELECT COUNT(*) FROM products) AS total_products FROM orders`),
    query(`SELECT * FROM orders ORDER BY created_at DESC LIMIT 8`),
  ])
  const s = statsRows[0] as Record<string, string>
  const fmt = (n: number) => new Intl.NumberFormat('en-NL', { style: 'currency', currency: 'EUR' }).format(n)
  const fmtDate = (d: string) => new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
  const statusColors: Record<string, string> = { pending: 'badge-pending', confirmed: 'badge-confirmed', shipped: 'badge-shipped', completed: 'badge-completed', cancelled: 'badge-cancelled' }
  const orders = recentOrders as Record<string, unknown>[]
  return `
<h1 class="page-title">Dashboard</h1>
<div class="stat-grid">
  <div class="stat"><div class="stat-label">Total Orders</div><div class="stat-value">${parseInt(s.total_orders)}</div></div>
  <div class="stat"><div class="stat-label">Pending</div><div class="stat-value">${parseInt(s.pending_orders)}</div></div>
  <div class="stat"><div class="stat-label">Revenue</div><div class="stat-value">${fmt(parseFloat(s.total_revenue))}</div></div>
  <div class="stat"><div class="stat-label">Products</div><div class="stat-value">${parseInt(s.total_products)}</div></div>
</div>
<div class="card" style="padding:0;overflow:hidden">
  <div style="padding:16px 20px;border-bottom:1px solid #e8dcc8;font-weight:600">Recent Orders</div>
  ${orders.length === 0 ? '<div class="empty"><div class="empty-icon">📦</div><p>No orders yet.</p></div>' : `
  <table>
    <thead><tr><th>Order</th><th>Customer</th><th>Date</th><th>Status</th><th>Total</th></tr></thead>
    <tbody>
      ${orders.map((o: Record<string, unknown>) => `
        <tr style="cursor:pointer" onclick="nav('orders')">
          <td><strong>#${o.order_number}</strong></td>
          <td>${o.customer_name}<br><span style="font-size:12px;color:#9e7a4a">${o.customer_email}</span></td>
          <td style="font-size:12px;color:#9e7a4a">${fmtDate(o.created_at as string)}</td>
          <td><span class="badge ${statusColors[o.status as string] || ''}">${(o.status as string).charAt(0).toUpperCase() + (o.status as string).slice(1)}</span></td>
          <td><strong>${fmt(parseFloat(o.total_amount as string))}</strong></td>
        </tr>`).join('')}
    </tbody>
  </table>`}
</div>`
}

async function productsHtml() {
  const rows = await query(`SELECT * FROM products ORDER BY sort_order ASC, created_at DESC`)
  const fmt = (n: number) => new Intl.NumberFormat('en-NL', { style: 'currency', currency: 'EUR' }).format(n)
  const products = rows as Record<string, unknown>[]
  return `
<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:24px">
  <h1 class="page-title" style="margin:0">Products (${products.length})</h1>
  <button class="btn btn-primary" onclick="showNewProductForm()">+ New Product</button>
</div>
<div id="product-form" style="display:none" class="card">
  <h2 style="font-size:18px;font-weight:700;margin-bottom:20px">New Product</h2>
  <form onsubmit="saveProduct(event,null)">
    <div class="form-row">
      <div class="form-group"><label class="form-label">Name *</label><input type="text" name="name_" required placeholder="e.g. Aged Gouda"></div>
      <div class="form-group"><label class="form-label">Price (€) *</label><input type="number" name="price" step="0.01" min="0" required placeholder="8.50"></div>
    </div>
    <div class="form-row">
      <div class="form-group"><label class="form-label">Cheese Type</label>
        <select name="cheese_type">
          <option value="">Select type</option>
          <option>Gouda</option><option>Farmhouse Cheese</option><option>Herb Cheese</option>
          <option>Sheep Cheese</option><option>Goat Cheese</option><option>Edam</option><option>Other</option>
        </select>
      </div>
      <div class="form-group"><label class="form-label">Stock quantity</label><input type="number" name="stock_quantity" min="0" value="0"></div>
    </div>
    <div class="form-group"><label class="form-label">Short description</label><input type="text" name="short_description" placeholder="One line summary shown in the product list"></div>
    <div class="form-group"><label class="form-label">Full description</label><textarea name="description" rows="3" placeholder="Full product details..."></textarea></div>
    <div style="display:flex;gap:20px;margin-bottom:16px">
      <label style="display:flex;align-items:center;gap:8px;font-size:14px;cursor:pointer"><input type="checkbox" name="in_stock" checked> In stock</label>
      <label style="display:flex;align-items:center;gap:8px;font-size:14px;cursor:pointer"><input type="checkbox" name="featured"> Featured on homepage</label>
    </div>
    <div style="display:flex;gap:10px">
      <button type="submit" class="btn btn-primary">Save Product</button>
      <button type="button" class="btn btn-secondary" onclick="document.getElementById('product-form').style.display='none'">Cancel</button>
    </div>
  </form>
</div>
<div class="card" style="padding:0;overflow:hidden">
  ${products.length === 0 ? '<div class="empty"><div class="empty-icon">🧀</div><p>No products yet. Add your first cheese above.</p></div>' : `
  <table>
    <thead><tr><th>Product</th><th>Type</th><th>Price</th><th>Stock</th><th>Status</th><th>Actions</th></tr></thead>
    <tbody>
      ${products.map((p: Record<string, unknown>) => `
        <tr>
          <td><strong>${p.name}</strong></td>
          <td style="color:#9e7a4a">${p.cheese_type || '—'}</td>
          <td><strong>${fmt(parseFloat(p.price as string))}</strong></td>
          <td>${p.stock_quantity}</td>
          <td><span class="badge" style="background:${p.in_stock ? '#d1fae5' : '#fee2e2'};color:${p.in_stock ? '#065f46' : '#991b1b'}">${p.in_stock ? 'In stock' : 'Out of stock'}</span></td>
          <td class="actions">
            <button class="btn btn-secondary" style="padding:5px 12px;font-size:12px" onclick="showEditForm('${p.id}','${(p.name as string).replace(/'/g, "\\'")}',${parseFloat(p.price as string)},'${p.cheese_type || ''}','${p.short_description || ''}',${p.in_stock},${p.featured},${p.stock_quantity})">Edit</button>
            <button class="btn btn-danger" style="padding:5px 12px;font-size:12px" onclick="deleteProduct('${p.id}','${(p.name as string).replace(/'/g, "\\'")}')">Delete</button>
          </td>
        </tr>`).join('')}
    </tbody>
  </table>`}
</div>
<div id="edit-form" style="display:none" class="card">
  <h2 style="font-size:18px;font-weight:700;margin-bottom:20px">Edit Product</h2>
  <form id="edit-form-inner" onsubmit="saveProduct(event, document.getElementById('edit-id').value)">
    <input type="hidden" id="edit-id">
    <div class="form-row">
      <div class="form-group"><label class="form-label">Name *</label><input type="text" name="name_" id="edit-name" required></div>
      <div class="form-group"><label class="form-label">Price (€) *</label><input type="number" name="price" id="edit-price" step="0.01" min="0" required></div>
    </div>
    <div class="form-row">
      <div class="form-group"><label class="form-label">Cheese Type</label>
        <select name="cheese_type" id="edit-type">
          <option value="">Select type</option>
          <option>Gouda</option><option>Farmhouse Cheese</option><option>Herb Cheese</option>
          <option>Sheep Cheese</option><option>Goat Cheese</option><option>Edam</option><option>Other</option>
        </select>
      </div>
      <div class="form-group"><label class="form-label">Stock quantity</label><input type="number" name="stock_quantity" id="edit-stock" min="0"></div>
    </div>
    <div class="form-group"><label class="form-label">Short description</label><input type="text" name="short_description" id="edit-short"></div>
    <div class="form-group"><label class="form-label">Full description</label><textarea name="description" id="edit-desc" rows="3"></textarea></div>
    <div style="display:flex;gap:20px;margin-bottom:16px">
      <label style="display:flex;align-items:center;gap:8px;font-size:14px;cursor:pointer"><input type="checkbox" name="in_stock" id="edit-instock"> In stock</label>
      <label style="display:flex;align-items:center;gap:8px;font-size:14px;cursor:pointer"><input type="checkbox" name="featured" id="edit-featured"> Featured on homepage</label>
    </div>
    <div style="display:flex;gap:10px">
      <button type="submit" class="btn btn-primary">Save Changes</button>
      <button type="button" class="btn btn-secondary" onclick="document.getElementById('edit-form').style.display='none'">Cancel</button>
    </div>
  </form>
</div>
<script>
function showNewProductForm(){
  document.getElementById('product-form').style.display='block';
  document.getElementById('edit-form').style.display='none';
  window.scrollTo(0,0);
}
function showEditForm(id,name,price,type,shortDesc,inStock,featured,stock){
  document.getElementById('edit-form').style.display='block';
  document.getElementById('product-form').style.display='none';
  document.getElementById('edit-id').value=id;
  document.getElementById('edit-name').value=name;
  document.getElementById('edit-price').value=price;
  document.getElementById('edit-type').value=type;
  document.getElementById('edit-short').value=shortDesc;
  document.getElementById('edit-instock').checked=inStock;
  document.getElementById('edit-featured').checked=featured;
  document.getElementById('edit-stock').value=stock;
  document.getElementById('edit-desc').value='';
  window.scrollTo(0,document.body.scrollHeight);
}
</script>`
}

async function ordersHtml() {
  const rows = await query(`SELECT * FROM orders ORDER BY created_at DESC LIMIT 100`)
  const fmt = (n: number) => new Intl.NumberFormat('en-NL', { style: 'currency', currency: 'EUR' }).format(n)
  const fmtDate = (d: string) => new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
  const statusColors: Record<string, string> = { pending: 'badge-pending', confirmed: 'badge-confirmed', shipped: 'badge-shipped', completed: 'badge-completed', cancelled: 'badge-cancelled' }
  const statuses = ['pending', 'confirmed', 'shipped', 'completed', 'cancelled']
  const orders = rows as Record<string, unknown>[]
  return `
<h1 class="page-title">Orders (${orders.length})</h1>
<div class="card" style="padding:0;overflow:hidden">
  ${orders.length === 0 ? '<div class="empty"><div class="empty-icon">📦</div><p>No orders yet.</p></div>' : `
  <table>
    <thead><tr><th>Order #</th><th>Customer</th><th>Date</th><th>Total</th><th>Status</th><th>Update</th></tr></thead>
    <tbody>
      ${orders.map((o: Record<string, unknown>) => `
        <tr>
          <td><strong>#${o.order_number}</strong></td>
          <td>
            <strong>${o.customer_name}</strong><br>
            <span style="font-size:12px;color:#9e7a4a">${o.customer_email}</span><br>
            <span style="font-size:12px;color:#9e7a4a">${o.customer_phone || ''}</span><br>
            <span style="font-size:12px;color:#9e7a4a">${o.delivery_address}, ${o.delivery_postal_code} ${o.delivery_city}</span>
            ${o.notes ? `<br><span style="font-size:12px;color:#c45e08;font-style:italic">"${o.notes}"</span>` : ''}
          </td>
          <td style="font-size:12px;color:#9e7a4a">${fmtDate(o.created_at as string)}</td>
          <td><strong>${fmt(parseFloat(o.total_amount as string))}</strong></td>
          <td><span id="badge-${o.id}" class="badge ${statusColors[o.status as string] || ''}">${(o.status as string).charAt(0).toUpperCase() + (o.status as string).slice(1)}</span></td>
          <td>
            <select class="status-select" onchange="updateStatus('${o.id}',this)">
              ${statuses.map(s => `<option value="${s}"${o.status === s ? ' selected' : ''}>${s.charAt(0).toUpperCase() + s.slice(1)}</option>`).join('')}
            </select>
          </td>
        </tr>`).join('')}
    </tbody>
  </table>`}
</div>`
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const page = searchParams.get('page')

  // If requesting a page fragment (AJAX)
  if (page) {
    const session = await getAdminSession()
    if (!session) return NextResponse.json({ html: '<p>Not logged in.</p>' })
    let content = ''
    if (page === 'dashboard') content = await dashboardHtml()
    else if (page === 'products') content = await productsHtml()
    else if (page === 'orders') content = await ordersHtml()
    return NextResponse.json({ html: content })
  }

  // Full page load — check session, redirect if not logged in
  const session = await getAdminSession()
  if (!session) {
    return new NextResponse(null, { status: 302, headers: { Location: '/admin/login' } })
  }

  const content = sidebar('dashboard') + await dashboardHtml() + '</div></div></div>'
  return new NextResponse(html(content, 'Dashboard'), {
    headers: { 'Content-Type': 'text/html' },
  })
}
