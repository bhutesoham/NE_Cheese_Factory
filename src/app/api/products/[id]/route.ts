import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { getAdminSession } from '@/lib/auth'
import { slugify } from '@/lib/utils'

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const rows = await query(`SELECT * FROM products WHERE id = $1`, [params.id])
  if (!rows[0]) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  const p = rows[0] as Record<string, unknown>
  return NextResponse.json({
    ...p,
    price: parseFloat(p.price as string),
    images: Array.isArray(p.images) ? p.images : [],
    weight_options: Array.isArray(p.weight_options) ? p.weight_options : [],
  })
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getAdminSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()

  // Get current product to preserve slug if name unchanged
  const current = await query(`SELECT * FROM products WHERE id = $1`, [params.id])
  if (!current[0]) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const currentProduct = current[0] as Record<string, unknown>
  let slug = currentProduct.slug as string
  if (body.name && body.name !== currentProduct.name) {
    slug = slugify(body.name)
    const existing = await query(`SELECT id FROM products WHERE slug = $1 AND id != $2`, [slug, params.id])
    if (existing.length > 0) slug = `${slug}-${Date.now()}`
  }

  const updated = await query(
    `UPDATE products SET
      name = COALESCE($1, name),
      slug = $2,
      description = COALESCE($3, description),
      short_description = COALESCE($4, short_description),
      price = COALESCE($5, price),
      cheese_type = $6,
      weight_options = COALESCE($7, weight_options),
      images = COALESCE($8, images),
      in_stock = COALESCE($9, in_stock),
      stock_quantity = COALESCE($10, stock_quantity),
      featured = COALESCE($11, featured),
      sort_order = COALESCE($12, sort_order),
      updated_at = NOW()
    WHERE id = $13
    RETURNING *`,
    [
      body.name, slug, body.description, body.short_description,
      body.price, body.cheese_type || null,
      body.weight_options !== undefined ? JSON.stringify(body.weight_options) : null,
      body.images !== undefined ? JSON.stringify(body.images) : null,
      body.in_stock, body.stock_quantity, body.featured, body.sort_order,
      params.id,
    ]
  )

  return NextResponse.json(updated[0])
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getAdminSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await query(`DELETE FROM products WHERE id = $1`, [params.id])
  return NextResponse.json({ success: true })
}
