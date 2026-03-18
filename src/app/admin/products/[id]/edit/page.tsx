import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { query } from '@/lib/db'
import { Product } from '@/types'
import ProductForm from '@/components/admin/ProductForm'

async function getProduct(id: string): Promise<Product | null> {
  const rows = await query(`SELECT * FROM products WHERE id = $1`, [id])
  if (!rows[0]) return null
  const p = rows[0] as Record<string, unknown>
  return {
    ...(p as Product),
    price: parseFloat(p.price as string),
    images: Array.isArray(p.images) ? (p.images as string[]) : [],
    weight_options: Array.isArray(p.weight_options) ? p.weight_options : [],
  }
}

interface Props {
  params: { id: string }
}

export default async function EditProductPage({ params }: Props) {
  const product = await getProduct(params.id)
  if (!product) notFound()

  return (
    <div>
      <Link href="/admin/products" className="inline-flex items-center gap-1 text-sm text-earth-500 hover:text-cheese-600 mb-6 transition-colors">
        <ChevronLeft size={16} /> Terug naar producten
      </Link>
      <div className="mb-8">
        <h1 className="font-serif text-3xl text-earth-900">Bewerk product</h1>
        <p className="text-earth-500 mt-1">{product.name}</p>
      </div>
      <ProductForm product={product} isEdit />
    </div>
  )
}
