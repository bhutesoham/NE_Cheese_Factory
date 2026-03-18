import { query } from '@/lib/db'
import { Order } from '@/types'
import { formatPrice, formatDateTime, ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from '@/lib/utils'
import Link from 'next/link'
import { ShoppingBag, ChevronRight } from 'lucide-react'
import OrderStatusFilter from '@/components/admin/OrderStatusFilter'

async function getOrders(status?: string, search?: string): Promise<Order[]> {
  const conditions = ['1=1']
  const params: string[] = []
  let idx = 1
  if (status) { conditions.push(`status = $${idx++}`); params.push(status) }
  if (search) { conditions.push(`(customer_name ILIKE $${idx} OR customer_email ILIKE $${idx} OR order_number ILIKE $${idx})`); params.push(`%${search}%`); idx++ }
  const rows = await query(`SELECT * FROM orders WHERE ${conditions.join(' AND ')} ORDER BY created_at DESC LIMIT 100`, params)
  return rows as unknown as Order[]
}

export default async function AdminOrdersPage({ searchParams }: { searchParams: { status?: string; search?: string } }) {
  const orders = await getOrders(searchParams.status, searchParams.search)
  return (
    <div>
      <div className="flex items-center justify-between mb-8 pt-14 md:pt-0">
        <div>
          <h1 className="font-serif text-3xl text-earth-900">Orders</h1>
          <p className="text-earth-500 mt-1">{orders.length} orders</p>
        </div>
      </div>
      <OrderStatusFilter currentStatus={searchParams.status} currentSearch={searchParams.search} />
      {orders.length === 0 ? (
        <div className="card p-16 text-center text-earth-400">
          <ShoppingBag size={40} className="mx-auto mb-4 opacity-40" />
          <p className="text-lg font-medium text-earth-600 mb-2">No orders found</p>
          <p className="text-sm">{searchParams.status || searchParams.search ? 'Try adjusting your filters.' : 'Orders will appear here once customers place them.'}</p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-earth-100 bg-earth-50">
                <th className="text-left px-5 py-3 text-xs font-semibold text-earth-500 uppercase tracking-wide">Order</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-earth-500 uppercase tracking-wide hidden md:table-cell">Customer</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-earth-500 uppercase tracking-wide hidden lg:table-cell">Date</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-earth-500 uppercase tracking-wide">Status</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-earth-500 uppercase tracking-wide">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-earth-50">
              {orders.map(order => (
                <tr key={order.id} className="hover:bg-cream-50 transition-colors">
                  <td className="px-5 py-3.5">
                    <Link href={`/admin/orders/${order.id}`} className="group flex items-center gap-2">
                      <div>
                        <p className="font-medium text-cheese-700 group-hover:text-cheese-800 text-sm">#{order.order_number}</p>
                        <p className="text-xs text-earth-400 md:hidden">{order.customer_name}</p>
                      </div>
                    </Link>
                  </td>
                  <td className="px-4 py-3.5 hidden md:table-cell">
                    <p className="text-sm font-medium text-earth-900">{order.customer_name}</p>
                    <p className="text-xs text-earth-400">{order.customer_email}</p>
                  </td>
                  <td className="px-4 py-3.5 text-sm text-earth-500 hidden lg:table-cell">{formatDateTime(order.created_at)}</td>
                  <td className="px-4 py-3.5 text-center"><span className={`badge ${ORDER_STATUS_COLORS[order.status]}`}>{ORDER_STATUS_LABELS[order.status]}</span></td>
                  <td className="px-5 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <span className="font-medium text-earth-900 text-sm">{formatPrice(order.total_amount)}</span>
                      <Link href={`/admin/orders/${order.id}`}><ChevronRight size={14} className="text-earth-300 hover:text-earth-600" /></Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
