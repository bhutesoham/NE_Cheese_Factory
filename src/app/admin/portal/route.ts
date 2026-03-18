import { NextRequest, NextResponse } from 'next/server'
import { getAdminSession } from '@/lib/auth'
import { query } from '@/lib/db'

const fmt = (n: number) =>
  new Intl.NumberFormat('en-NL', { style: 'currency', currency: 'EUR' }).format(n)

const fmtDate = (d: string) =>
  new Date(d).toLocaleString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })

const statusBadge = (s: string) => {
  const colors: Record<string, string> = {
    pending: '#92400e;background:#fef3c7',
    confirmed: '#1e40af;background:#dbeafe',
    shipped: '#5b21b6;background:#ede9fe',
    completed: '#065f46;background:#d1fae5',
    cancelled: '#991b1b;background:#fee2e2',
  }
  const style = colors[s] || '#333;background:#eee'
  return `<span style="color:${style};padding:3px 10px;border-radius:99px;font-size:12px;font-weight:600">${s.charAt(0).toUpperCase() + s.slice(1)}</span>`
}

export async function GET(req: NextRequest) {
  const session = await getAdminSession()
  if (!session) {
    return NextResponse.redirect(new URL('/admin/login', req.url))
  }

  const tab = new URL(req.url).searchParams.get('tab') || 'dashboard'

  // Load data based on tab
  let tabContent = ''

  if (tab === 'dashboard') {
    const [statsRows, recentOrders] = await Promise.all([
      query(`SELECT
        COUNT(*) AS total_orders,
        COUNT(*) FILTER (WHERE status='pending') AS pending_orders,
        COALESCE(SUM(total_amount) FILTER (WHERE status!='cancelled'),0) AS total_revenue,
        (SELECT COUNT(*) FROM products) AS total_products
        FROM orders`),
      query(`SELECT * FROM orders ORDER BY created_at DESC LIMIT 10`),
    ])
    const s = statsRows[0] as Record<string, string>
    const orders = recentOrders as Record<string, string>[]

    tabContent = `
      <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-bottom:28px">
        ${[
          ['Total Orders', parseInt(s.total_orders)],
          ['Pending', parseInt(s.pending_orders)],
          ['Revenue', fmt(parseFloat(s.total_revenue))],
          ['Products', parseInt(s.total_products)],
        ].map(([label, value]) => `
          <div style="background:#fff;border:1px solid #e8dcc8;border-radius:12px;padding:20px">
            <div style="font-size:13px;color:#9e7a4a;margin-bottom:6px">${label}</div>
            <div style="font-size:28px;font-weight:700;color:#1a0f00">${value}</div>
          </div>`).join('')}
      </div>
      <div style="background:#fff;border:1px solid #e8dcc8;border-radius:12px;overflow:hidden">
        <div style="padding:16px 20px;border-bottom:1px solid #e8dcc8;font-weight:600;font-size:16px">Recent Orders</div>
        ${orders.length === 0
          ? '<div style="padding:40px;text-align:center;color:#9e7a4a">No orders yet.</div>'
          : `<table style="width:100%;border-collapse:collapse">
              <thead><tr style="background:#faf5ec">
                <th style="text-align:left;padding:10px 16px;font-size:12px;color:#9e7a4a;font-weight:600;text-transform:uppercase">Order</th>
                <th style="text-align:left;padding:10px 16px;font-size:12px;color:#9e7a4a;font-weight:600;text-transform:uppercase">Customer</th>
                <th style="text-align:left;padding:10px 16px;font-size:12px;color:#9e7a4a;font-weight:600;text-transform:uppercase">Date</th>
                <th style="text-align:left;padding:10px 16px;font-size:12px;color:#9e7a4a;font-weight:600;text-transform:uppercase">Status</th>
                <th style="text-align:right;padding:10px 16px;font-size:12px;color:#9e7a4a;font-weight:600;text-transform:uppercase">Total</th>
              </tr></thead>
              <tbody>
                ${orders.map(o => `
                  <tr style="border-top:1px solid #f5ede0">
                    <td style="padding:12px 16px;font-weight:600">#${o.order_number}</td>
                    <td style="padding:12px 16px">
                      <div style="font-weight:500">${o.customer_name}</div>
                      <div style="font-size:12px;color:#9e7a4a">${o.customer_email}</div>
                    </td>
                    <td style="padding:12px 16px;font-size:13px;color:#9e7a4a">${fmtDate(o.created_at)}</td>
                    <td style="padding:12px 16px">${statusBadge(o.status)}</td>
                    <td style="padding:12px 16px;text-align:right;font-weight:600">${fmt(parseFloat(o.total_amount))}</td>
                  </tr>`).join('')}
              </tbody>
            </table>`}
      </div>`
  }

  if (tab === 'products') {
    const products = await query(`SELECT * FROM products ORDER BY sort_order ASC, created_at DESC`) as Record<string, unknown>[]
    tabContent = `
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px">
        <div style="font-size:14px;color:#9e7a4a">${products.length} products</div>
        <button onclick="showSection('new-product-form')" style="background:#c45e08;color:#fff;border:none;padding:10px 20px;border-radius:8px;font-size:14px;font-weight:600;cursor:pointer">+ New Product</button>
      </div>

      <!-- New product form -->
      <div id="new-product-form" style="display:none;background:#fff;border:1px solid #e8dcc8;border-radius:12px;padding:24px;margin-bottom:20px">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px">
          <h3 style="margin:0;font-size:18px">New Product</h3>
          <button onclick="hideSection('new-product-form')" style="background:none;border:none;font-size:20px;cursor:pointer;color:#9e7a4a">×</button>
        </div>
        <form onsubmit="createProduct(event)">
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:16px">
            <div><label style="display:block;font-size:13px;font-weight:600;color:#5c3d00;margin-bottom:6px">Name *</label>
              <input type="text" name="name" required placeholder="e.g. Aged Gouda" style="width:100%;padding:9px 12px;border:1px solid #d4b896;border-radius:8px;font-size:14px;box-sizing:border-box"></div>
            <div><label style="display:block;font-size:13px;font-weight:600;color:#5c3d00;margin-bottom:6px">Price (€) *</label>
              <input type="number" name="price" step="0.01" min="0" required placeholder="8.50" style="width:100%;padding:9px 12px;border:1px solid #d4b896;border-radius:8px;font-size:14px;box-sizing:border-box"></div>
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:16px">
            <div><label style="display:block;font-size:13px;font-weight:600;color:#5c3d00;margin-bottom:6px">Cheese Type</label>
              <select name="cheese_type" style="width:100%;padding:9px 12px;border:1px solid #d4b896;border-radius:8px;font-size:14px;box-sizing:border-box">
                <option value="">Select type</option>
                <option>Gouda</option><option>Farmhouse Cheese</option><option>Herb Cheese</option>
                <option>Sheep Cheese</option><option>Goat Cheese</option><option>Edam</option><option>Other</option>
              </select></div>
            <div><label style="display:block;font-size:13px;font-weight:600;color:#5c3d00;margin-bottom:6px">Stock Quantity</label>
              <input type="number" name="stock_quantity" min="0" value="0" style="width:100%;padding:9px 12px;border:1px solid #d4b896;border-radius:8px;font-size:14px;box-sizing:border-box"></div>
          </div>
          <div style="margin-bottom:16px"><label style="display:block;font-size:13px;font-weight:600;color:#5c3d00;margin-bottom:6px">Short Description</label>
            <input type="text" name="short_description" placeholder="One line summary" style="width:100%;padding:9px 12px;border:1px solid #d4b896;border-radius:8px;font-size:14px;box-sizing:border-box"></div>
          <div style="margin-bottom:16px"><label style="display:block;font-size:13px;font-weight:600;color:#5c3d00;margin-bottom:6px">Full Description</label>
            <textarea name="description" rows="3" placeholder="Full product details..." style="width:100%;padding:9px 12px;border:1px solid #d4b896;border-radius:8px;font-size:14px;box-sizing:border-box;resize:vertical"></textarea></div>
          <div style="display:flex;gap:20px;margin-bottom:20px">
            <label style="display:flex;align-items:center;gap:8px;font-size:14px;cursor:pointer"><input type="checkbox" name="in_stock" checked> In stock</label>
            <label style="display:flex;align-items:center;gap:8px;font-size:14px;cursor:pointer"><input type="checkbox" name="featured"> Featured on homepage</label>
          </div>
          <div style="display:flex;gap:10px">
            <button type="submit" style="background:#c45e08;color:#fff;border:none;padding:10px 20px;border-radius:8px;font-size:14px;font-weight:600;cursor:pointer">Save Product</button>
            <button type="button" onclick="hideSection('new-product-form')" style="background:#f5ede0;color:#5c3d00;border:1px solid #e8dcc8;padding:10px 20px;border-radius:8px;font-size:14px;cursor:pointer">Cancel</button>
          </div>
        </form>
      </div>

      <!-- Edit product form -->
      <div id="edit-product-form" style="display:none;background:#fff;border:2px solid #c45e08;border-radius:12px;padding:24px;margin-bottom:20px">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px">
          <h3 style="margin:0;font-size:18px">Edit Product</h3>
          <button onclick="hideSection('edit-product-form')" style="background:none;border:none;font-size:20px;cursor:pointer;color:#9e7a4a">×</button>
        </div>
        <form onsubmit="updateProduct(event)">
          <input type="hidden" id="edit-id">
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:16px">
            <div><label style="display:block;font-size:13px;font-weight:600;color:#5c3d00;margin-bottom:6px">Name *</label>
              <input type="text" id="edit-name" required style="width:100%;padding:9px 12px;border:1px solid #d4b896;border-radius:8px;font-size:14px;box-sizing:border-box"></div>
            <div><label style="display:block;font-size:13px;font-weight:600;color:#5c3d00;margin-bottom:6px">Price (€) *</label>
              <input type="number" id="edit-price" step="0.01" min="0" required style="width:100%;padding:9px 12px;border:1px solid #d4b896;border-radius:8px;font-size:14px;box-sizing:border-box"></div>
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:16px">
            <div><label style="display:block;font-size:13px;font-weight:600;color:#5c3d00;margin-bottom:6px">Cheese Type</label>
              <select id="edit-cheese-type" style="width:100%;padding:9px 12px;border:1px solid #d4b896;border-radius:8px;font-size:14px;box-sizing:border-box">
                <option value="">Select type</option>
                <option>Gouda</option><option>Farmhouse Cheese</option><option>Herb Cheese</option>
                <option>Sheep Cheese</option><option>Goat Cheese</option><option>Edam</option><option>Other</option>
              </select></div>
            <div><label style="display:block;font-size:13px;font-weight:600;color:#5c3d00;margin-bottom:6px">Stock Quantity</label>
              <input type="number" id="edit-stock" min="0" style="width:100%;padding:9px 12px;border:1px solid #d4b896;border-radius:8px;font-size:14px;box-sizing:border-box"></div>
          </div>
          <div style="margin-bottom:16px"><label style="display:block;font-size:13px;font-weight:600;color:#5c3d00;margin-bottom:6px">Short Description</label>
            <input type="text" id="edit-short" style="width:100%;padding:9px 12px;border:1px solid #d4b896;border-radius:8px;font-size:14px;box-sizing:border-box"></div>
          <div style="margin-bottom:16px"><label style="display:block;font-size:13px;font-weight:600;color:#5c3d00;margin-bottom:6px">Full Description</label>
            <textarea id="edit-desc" rows="3" style="width:100%;padding:9px 12px;border:1px solid #d4b896;border-radius:8px;font-size:14px;box-sizing:border-box;resize:vertical"></textarea></div>
          <div style="display:flex;gap:20px;margin-bottom:20px">
            <label style="display:flex;align-items:center;gap:8px;font-size:14px;cursor:pointer"><input type="checkbox" id="edit-instock"> In stock</label>
            <label style="display:flex;align-items:center;gap:8px;font-size:14px;cursor:pointer"><input type="checkbox" id="edit-featured"> Featured on homepage</label>
          </div>
          <div style="display:flex;gap:10px">
            <button type="submit" style="background:#c45e08;color:#fff;border:none;padding:10px 20px;border-radius:8px;font-size:14px;font-weight:600;cursor:pointer">Save Changes</button>
            <button type="button" onclick="hideSection('edit-product-form')" style="background:#f5ede0;color:#5c3d00;border:1px solid #e8dcc8;padding:10px 20px;border-radius:8px;font-size:14px;cursor:pointer">Cancel</button>
          </div>
        </form>
      </div>

      <!-- Products table -->
      <div style="background:#fff;border:1px solid #e8dcc8;border-radius:12px;overflow:hidden">
        ${products.length === 0
          ? '<div style="padding:60px;text-align:center;color:#9e7a4a"><div style="font-size:48px;margin-bottom:12px">🧀</div><p>No products yet. Add your first cheese above.</p></div>'
          : `<table style="width:100%;border-collapse:collapse">
              <thead><tr style="background:#faf5ec">
                <th style="text-align:left;padding:10px 16px;font-size:12px;color:#9e7a4a;font-weight:600;text-transform:uppercase">Product</th>
                <th style="text-align:left;padding:10px 16px;font-size:12px;color:#9e7a4a;font-weight:600;text-transform:uppercase">Type</th>
                <th style="text-align:left;padding:10px 16px;font-size:12px;color:#9e7a4a;font-weight:600;text-transform:uppercase">Price</th>
                <th style="text-align:left;padding:10px 16px;font-size:12px;color:#9e7a4a;font-weight:600;text-transform:uppercase">Stock</th>
                <th style="text-align:left;padding:10px 16px;font-size:12px;color:#9e7a4a;font-weight:600;text-transform:uppercase">Status</th>
                <th style="text-align:left;padding:10px 16px;font-size:12px;color:#9e7a4a;font-weight:600;text-transform:uppercase">Actions</th>
              </tr></thead>
              <tbody>
                ${products.map(p => `
                  <tr style="border-top:1px solid #f5ede0">
                    <td style="padding:12px 16px">
                      <div style="font-weight:600">${p.name}</div>
                      <div style="font-size:12px;color:#9e7a4a">${p.short_description || ''}</div>
                    </td>
                    <td style="padding:12px 16px;color:#9e7a4a;font-size:13px">${p.cheese_type || '—'}</td>
                    <td style="padding:12px 16px;font-weight:600">${fmt(parseFloat(p.price as string))}</td>
                    <td style="padding:12px 16px">${p.stock_quantity}</td>
                    <td style="padding:12px 16px">
                      <span style="color:${p.in_stock ? '#065f46' : '#991b1b'};background:${p.in_stock ? '#d1fae5' : '#fee2e2'};padding:3px 10px;border-radius:99px;font-size:12px;font-weight:600">
                        ${p.in_stock ? 'In stock' : 'Out of stock'}
                      </span>
                    </td>
                    <td style="padding:12px 16px">
                      <button onclick="editProduct('${p.id}','${(p.name as string).replace(/'/g,"\\'")}',${parseFloat(p.price as string)},'${p.cheese_type || ''}','${(p.short_description as string || '').replace(/'/g,"\\'")}','${(p.description as string || '').replace(/'/g,"\\'").replace(/\n/g,'\\n')}',${p.in_stock},${p.featured},${p.stock_quantity})"
                        style="background:#f5ede0;color:#5c3d00;border:1px solid #e8dcc8;padding:6px 14px;border-radius:6px;font-size:13px;cursor:pointer;margin-right:6px">Edit</button>
                      <button onclick="deleteProduct('${p.id}','${(p.name as string).replace(/'/g,"\\'")}')"
                        style="background:#fee2e2;color:#991b1b;border:none;padding:6px 14px;border-radius:6px;font-size:13px;cursor:pointer">Delete</button>
                    </td>
                  </tr>`).join('')}
              </tbody>
            </table>`}
      </div>`
  }

  if (tab === 'orders') {
    const orders = await query(`SELECT * FROM orders ORDER BY created_at DESC`) as Record<string, string>[]
    const statuses = ['pending', 'confirmed', 'shipped', 'completed', 'cancelled']
    tabContent = `
      <div style="font-size:14px;color:#9e7a4a;margin-bottom:20px">${orders.length} orders total</div>
      <div style="background:#fff;border:1px solid #e8dcc8;border-radius:12px;overflow:hidden">
        ${orders.length === 0
          ? '<div style="padding:60px;text-align:center;color:#9e7a4a"><div style="font-size:48px;margin-bottom:12px">📦</div><p>No orders yet.</p></div>'
          : `<table style="width:100%;border-collapse:collapse">
              <thead><tr style="background:#faf5ec">
                <th style="text-align:left;padding:10px 16px;font-size:12px;color:#9e7a4a;font-weight:600;text-transform:uppercase">Order</th>
                <th style="text-align:left;padding:10px 16px;font-size:12px;color:#9e7a4a;font-weight:600;text-transform:uppercase">Customer & Address</th>
                <th style="text-align:left;padding:10px 16px;font-size:12px;color:#9e7a4a;font-weight:600;text-transform:uppercase">Date</th>
                <th style="text-align:left;padding:10px 16px;font-size:12px;color:#9e7a4a;font-weight:600;text-transform:uppercase">Total</th>
                <th style="text-align:left;padding:10px 16px;font-size:12px;color:#9e7a4a;font-weight:600;text-transform:uppercase">Update Status</th>
              </tr></thead>
              <tbody>
                ${orders.map(o => `
                  <tr style="border-top:1px solid #f5ede0">
                    <td style="padding:12px 16px">
                      <div style="font-weight:700">#${o.order_number}</div>
                      <div style="margin-top:4px">${statusBadge(o.status)}</div>
                    </td>
                    <td style="padding:12px 16px">
                      <div style="font-weight:600">${o.customer_name}</div>
                      <div style="font-size:12px;color:#9e7a4a">${o.customer_email}</div>
                      <div style="font-size:12px;color:#9e7a4a">${o.customer_phone || ''}</div>
                      <div style="font-size:12px;color:#9e7a4a">${o.delivery_address}, ${o.delivery_postal_code} ${o.delivery_city}</div>
                      ${o.notes ? `<div style="font-size:12px;color:#c45e08;font-style:italic;margin-top:2px">"${o.notes}"</div>` : ''}
                    </td>
                    <td style="padding:12px 16px;font-size:13px;color:#9e7a4a;white-space:nowrap">${fmtDate(o.created_at)}</td>
                    <td style="padding:12px 16px;font-weight:700">${fmt(parseFloat(o.total_amount))}</td>
                    <td style="padding:12px 16px">
                      <select onchange="updateOrderStatus('${o.id}', this.value, this)"
                        style="padding:7px 10px;border:1px solid #d4b896;border-radius:8px;font-size:13px;cursor:pointer;background:#fff">
                        ${statuses.map(s => `<option value="${s}"${o.status === s ? ' selected' : ''}>${s.charAt(0).toUpperCase() + s.slice(1)}</option>`).join('')}
                      </select>
                    </td>
                  </tr>`).join('')}
              </tbody>
            </table>`}
      </div>`
  }

  const navTabs = [
    { id: 'dashboard', label: '📊 Dashboard' },
    { id: 'products', label: '🧀 Products' },
    { id: 'orders', label: '📦 Orders' },
  ]

  const pageTitles: Record<string, string> = {
    dashboard: 'Dashboard',
    products: 'Products',
    orders: 'Orders',
  }

  const fullPage = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="google" content="notranslate">
<title>${pageTitles[tab] || 'Admin'} — The Cheese Shop</title>
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;background:#f5f2eb;color:#1a0f00;font-size:15px}
</style>
</head>
<body>
<div style="display:flex;min-height:100vh">

  <!-- Sidebar -->
  <div style="width:220px;background:#fff;border-right:1px solid #e8dcc8;position:fixed;top:0;bottom:0;left:0;display:flex;flex-direction:column">
    <div style="padding:20px 16px;border-bottom:1px solid #e8dcc8;font-size:17px;font-weight:700;display:flex;align-items:center;gap:8px">
      🧀 The Cheese Shop
    </div>
    <div style="padding:10px;flex:1">
      ${navTabs.map(t => `
        <a href="/admin/portal?tab=${t.id}"
          style="display:flex;align-items:center;gap:10px;padding:10px 12px;border-radius:8px;font-size:14px;font-weight:500;color:${tab === t.id ? '#c45e08' : '#5c3d00'};background:${tab === t.id ? '#fef0d0' : 'transparent'};margin-bottom:2px;text-decoration:none">
          ${t.label}
        </a>`).join('')}
    </div>
    <div style="padding:10px;border-top:1px solid #e8dcc8">
      <a href="/shop" target="_blank" style="display:flex;align-items:center;gap:10px;padding:10px 12px;border-radius:8px;font-size:14px;color:#5c3d00;text-decoration:none;margin-bottom:2px">
        🌐 View Shop
      </a>
      <a href="/admin/logout" style="display:flex;align-items:center;gap:10px;padding:10px 12px;border-radius:8px;font-size:14px;color:#991b1b;text-decoration:none">
        🚪 Sign Out
      </a>
    </div>
  </div>

  <!-- Main content -->
  <div style="margin-left:220px;flex:1;padding:32px">
    <h1 style="font-size:26px;font-weight:700;margin-bottom:24px;color:#1a0f00">${pageTitles[tab] || 'Admin'}</h1>
    <div id="msg" style="display:none;padding:10px 16px;border-radius:8px;margin-bottom:16px;font-size:14px"></div>
    ${tabContent}
  </div>
</div>

<script>
function showMsg(text, type) {
  var el = document.getElementById('msg');
  el.textContent = text;
  el.style.display = 'block';
  el.style.background = type === 'success' ? '#d1fae5' : '#fee2e2';
  el.style.color = type === 'success' ? '#065f46' : '#991b1b';
  setTimeout(function(){ el.style.display = 'none'; }, 3000);
}

function showSection(id) {
  document.getElementById(id).style.display = 'block';
  document.getElementById(id).scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function hideSection(id) {
  document.getElementById(id).style.display = 'none';
}

function editProduct(id, name, price, type, shortDesc, desc, inStock, featured, stock) {
  document.getElementById('edit-id').value = id;
  document.getElementById('edit-name').value = name;
  document.getElementById('edit-price').value = price;
  document.getElementById('edit-cheese-type').value = type;
  document.getElementById('edit-short').value = shortDesc;
  document.getElementById('edit-desc').value = desc.replace(/\\\\n/g, '\\n');
  document.getElementById('edit-instock').checked = inStock === true || inStock === 'true';
  document.getElementById('edit-featured').checked = featured === true || featured === 'true';
  document.getElementById('edit-stock').value = stock;
  showSection('edit-product-form');
  hideSection('new-product-form');
}

async function createProduct(e) {
  e.preventDefault();
  var form = e.target;
  var data = {
    name: form.name.value,
    description: form.description.value,
    short_description: form.short_description.value,
    price: parseFloat(form.price.value),
    cheese_type: form.cheese_type.value,
    in_stock: form.in_stock.checked,
    stock_quantity: parseInt(form.stock_quantity.value) || 0,
    featured: form.featured.checked,
    images: [],
    weight_options: []
  };
  try {
    var res = await fetch('/api/products', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(data) });
    if (res.ok) { window.location.href = '/admin/portal?tab=products'; }
    else { var d = await res.json(); showMsg(d.error || 'Save failed', 'error'); }
  } catch(err) { showMsg('Network error', 'error'); }
}

async function updateProduct(e) {
  e.preventDefault();
  var id = document.getElementById('edit-id').value;
  var data = {
    name: document.getElementById('edit-name').value,
    description: document.getElementById('edit-desc').value,
    short_description: document.getElementById('edit-short').value,
    price: parseFloat(document.getElementById('edit-price').value),
    cheese_type: document.getElementById('edit-cheese-type').value,
    in_stock: document.getElementById('edit-instock').checked,
    stock_quantity: parseInt(document.getElementById('edit-stock').value) || 0,
    featured: document.getElementById('edit-featured').checked,
    images: [],
    weight_options: []
  };
  try {
    var res = await fetch('/api/products/' + id, { method: 'PUT', headers: {'Content-Type':'application/json'}, body: JSON.stringify(data) });
    if (res.ok) { window.location.href = '/admin/portal?tab=products'; }
    else { var d = await res.json(); showMsg(d.error || 'Update failed', 'error'); }
  } catch(err) { showMsg('Network error', 'error'); }
}

async function deleteProduct(id, name) {
  if (!confirm('Delete "' + name + '"? This cannot be undone.')) return;
  try {
    var res = await fetch('/api/products/' + id, { method: 'DELETE' });
    if (res.ok) { window.location.href = '/admin/portal?tab=products'; }
    else { showMsg('Delete failed', 'error'); }
  } catch(err) { showMsg('Network error', 'error'); }
}

async function updateOrderStatus(orderId, status, selectEl) {
  try {
    var res = await fetch('/api/orders/' + orderId, {
      method: 'PATCH',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({ status: status })
    });
    if (res.ok) { showMsg('Status updated to: ' + status, 'success'); }
    else { showMsg('Update failed', 'error'); selectEl.value = selectEl.dataset.original; }
  } catch(err) { showMsg('Network error', 'error'); }
}
</script>
</body>
</html>`

  return new NextResponse(fullPage, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  })
}
