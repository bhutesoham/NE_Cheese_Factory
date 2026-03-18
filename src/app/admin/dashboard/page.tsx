import { getAdminSession } from '@/lib/auth'
import { query } from '@/lib/db'
import { formatPrice, formatDateTime, ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from '@/lib/utils'
import { Order } from '@/types'
import Link from 'next/link'
import { ShoppingBag, Package, TrendingUp, AlertCircle, ChevronRight } from 'lucide-react'
import { redirect } from 'next/navigation'

async function getStats() {
  const [statsRows, recentOrders] = await Promise.all([
    query(`SELECT COUNT(*) AS total_orders, COUNT(*) FILTER (WHERE status = 'pending') AS pending_orders, COALESCE(SUM(total_amount) FILTER (WHERE status != 'cancelled'), 0) AS total_revenue, (SELECT COUNT(*) FROM products) AS total_products, (SELECT COUNT(*) FROM products WHERE in_stock = false OR stock_quantity = 0) AS out_of_stock FROM orders`),
    query(`SELECT * FROM orders ORDER BY created_at DESC LIMIT 6`),
  ])
  const s = statsRows[0] as Record<string, string>
  return {
    total_orders: parseInt(s.total_orders),
    pending_orders: parseInt(s.pending_orders),
    total_revenue: parseFloat(s.total_revenue),
    total_products: parseInt(s.total_products),
    out_of_stock: parseInt(s.out_of_stock),
    recent_orders: recentOrders as unknown as Order[],
  }
}

export default async function DashboardPage() {
  const session = await getAdminSession()
  if (!session) redirect('/admin/login')
  const stats = await getStats()

  const statCards = [
    { label: 'Total orders', value: stats.total_orders, icon: ShoppingBag, color: 'text-blue-600 bg-blue-50', href: '/admin/orders' },
    { label: 'Pending', value: stats.pending_orders, icon: AlertCircle, color: 'text-amber-600 bg-amber-50', href: '/admin/orders?status=pending' },
    { label: 'Total revenue', value: formatPrice(stats.total_revenue), icon: TrendingUp, color: 'text-forest-600 bg-forest-50', href: '/admin/orders' },
    { label: 'Products', value: `${stats.total_products} (${stats.out_of_stock} out of stock)`, icon: Package, color: 'text-cheese-600 bg-cheese-50', href: '/admin/products' },
  ]

  return (
    <div>
      <div className="mb-8 pt-14 md:pt-0">
        <h1 className="font-serif text-3xl text-earth-900">Dashboard</h1>
        <p className="text-earth-500 mt-1">Welcome back{session?.name ? `, ${session.name}` : ''}!</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        {statCards.map(card => (
          <Link key={card.label} href={card.href} className="card p-5 hover:shadow-md transition-shadow group">
            <div className="flex items-start justify-between mb-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${card.color}`}><card.icon size={20} /></div>
              <ChevronRight size={16} className="text-earth-300 group-hover:text-earth-500 mt-1 transition-colors" />
            </div>
            <div className="font-serif text-2xl font-medium text-earth-900 mb-0.5">{card.value}</div>
            <div className="text-sm text-earth-500">{card.label}</div>
          </Link>
        ))}
      </div>
      <div className="card">
        <div className="flex items-center justify-between p-5 border-b border-earth-100">
          <h2 className="font-serif text-xl text-earth-900">Recent Orders</h2>
          <Link href="/admin/orders" className="text-sm text-cheese-600 hover:text-cheese-700 flex items-center gap-1">All orders <ChevronRight size={14} /></Link>
        </div>
        {stats.recent_orders.length === 0 ? (
          <div className="p-10 text-center text-earth-400"><ShoppingBag size={32} className="mx-auto mb-3 opacity-40" /><p>No orders yet.</p></div>
        ) : (
          <div className="divide-y divide-earth-50">
            {stats.recent_orders.map(order => (
              <Link key={order.id} href={`/admin/orders/${order.id}`} className="flex items-center justify-between px-5 py-4 hover:bg-cream-50 transition-colors group">
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-earth-100 flex items-center justify-center text-xs font-medium text-earth-600 shrink-0">{order.customer_name.charAt(0).toUpperCase()}</div>
                  <div className="min-w-0">
                    <p className="font-medium text-earth-900 text-sm truncate">{order.customer_name}</p>
                    <p className="text-xs text-earth-400">#{order.order_number} · {formatDateTime(order.created_at)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0 ml-4">
                  <span className={`badge ${ORDER_STATUS_COLORS[order.status]}`}>{ORDER_STATUS_LABELS[order.status]}</span>
                  <span className="font-medium text-earth-900 text-sm">{formatPrice(order.total_amount)}</span>
                  <ChevronRight size={14} className="text-earth-300 group-hover:text-earth-500 transition-colors" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
