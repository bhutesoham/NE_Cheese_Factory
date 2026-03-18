import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { getAdminSession } from '@/lib/auth'
import { slugify } from '@/lib/utils'
import { z } from 'zod'

const ProductSchema = z.object({
  name: z.string().min(2),
  description: z.string().optional().default(''),
  short_description: z.string().max(500).optional().default(''),
  price: z.number().positive(),
  cheese_type: z.string().optional().default(''),
  weight_options: z.array(z.object({ label: z.string(), price: z.number() })).default([]),
  images: z.array(z.string()).default([]),
  in_stock: z.boolean().default(true),
  stock_quantity: z.number().int().min(0).default(0),
  featured: z.boolean().default(false),
  sort_order: z.number().int().default(0),
})

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const includeOutOfStock = searchParams.get('all') === 'true'
  const session = await getAdminSession()

  let sql = `SELECT * FROM products`
  const conditions = []
  if (!includeOutOfStock && !session) {
    conditions.push('in_stock = true')
  }
  if (conditions.length) sql += ` WHERE ${conditions.join(' AND ')}`
  sql += ` ORDER BY sort_order ASC, created_at DESC`

  const products = await query(sql)
  return NextResponse.json(products.map(p => ({
    ...p,
    price: parseFloat(p.price as unknown as string),
    images: Array.isArray(p.images) ? p.images : [],
    weight_options: Array.isArray(p.weight_options) ? p.weight_options : [],
  })))
}

export async function POST(req: NextRequest) {
  const session = await getAdminSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const parsed = ProductSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 })
  }

  const data = parsed.data
  let slug = slugify(data.name)

  // Ensure unique slug
  const existing = await query(`SELECT id FROM products WHERE slug = $1`, [slug])
  if (existing.length > 0) {
    slug = `${slug}-${Date.now()}`
  }

  const result = await query(
    `INSERT INTO products (
      name, slug, description, short_description, price, cheese_type,
      weight_options, images, in_stock, stock_quantity, featured, sort_order
    ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING *`,
    [
      data.name, slug, data.description, data.short_description,
      data.price, data.cheese_type || null,
      JSON.stringify(data.weight_options), JSON.stringify(data.images),
      data.in_stock, data.stock_quantity, data.featured, data.sort_order,
    ]
  )

  return NextResponse.json(result[0], { status: 201 })
}
