import { NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { getAdminSession } from '@/lib/auth'

export async function GET() {
  const session = await getAdminSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const [statsRows, recentOrders] = await Promise.all([
    query(`
      SELECT
        COUNT(*) FILTER (WHERE true)                    AS total_orders,
        COUNT(*) FILTER (WHERE status = 'pending')      AS pending_orders,
        COALESCE(SUM(total_amount) FILTER (WHERE status != 'cancelled'), 0) AS total_revenue,
        (SELECT COUNT(*) FROM products)                 AS total_products,
        (SELECT COUNT(*) FROM products WHERE in_stock = false OR stock_quantity = 0) AS out_of_stock
      FROM orders
    `),
    query(`
      SELECT * FROM orders ORDER BY created_at DESC LIMIT 5
    `),
  ])

  const stats = statsRows[0] as Record<string, unknown>

  return NextResponse.json({
    total_orders: parseInt(stats.total_orders as string),
    pending_orders: parseInt(stats.pending_orders as string),
    total_revenue: parseFloat(stats.total_revenue as string),
    total_products: parseInt(stats.total_products as string),
    out_of_stock: parseInt(stats.out_of_stock as string),
    recent_orders: recentOrders,
  })
}
