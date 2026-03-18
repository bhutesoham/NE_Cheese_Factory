import { query } from '@/lib/db'
import { Product } from '@/types'
import { formatPrice, formatDateTime } from '@/lib/utils'
import Link from 'next/link'
import Image from 'next/image'
import { Plus, Pencil, Package } from 'lucide-react'
import DeleteProductButton from '@/components/admin/DeleteProductButton'

async function getProducts(): Promise<Product[]> {
  const rows = await query(`SELECT * FROM products ORDER BY sort_order ASC, created_at DESC`)
  return rows.map((p: Record<string, unknown>) => ({
    ...(p as Product),
    price: parseFloat(p.price as string),
    images: Array.isArray(p.images) ? (p.images as string[]) : [],
    weight_options: Array.isArray(p.weight_options) ? p.weight_options : [],
  }))
}

export default async function AdminProductsPage() {
  const products = await getProducts()
  return (
    <div>
      <div className="flex items-center justify-between mb-8 pt-14 md:pt-0">
        <div>
          <h1 className="font-serif text-3xl text-earth-900">Products</h1>
          <p className="text-earth-500 mt-1">{products.length} products in your range</p>
        </div>
        <Link href="/admin/products/new" className="btn-primary"><Plus size={18} />New product</Link>
      </div>
      {products.length === 0 ? (
        <div className="card p-16 text-center text-earth-400">
          <Package size={40} className="mx-auto mb-4 opacity-40" />
          <p className="text-lg font-medium text-earth-600 mb-2">No products yet</p>
          <p className="text-sm mb-6">Add your first cheese to get started.</p>
          <Link href="/admin/products/new" className="btn-primary"><Plus size={18} />Add product</Link>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-earth-100 bg-earth-50">
                <th className="text-left px-5 py-3 text-xs font-semibold text-earth-500 uppercase tracking-wide">Product</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-earth-500 uppercase tracking-wide hidden sm:table-cell">Type</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-earth-500 uppercase tracking-wide">Price</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-earth-500 uppercase tracking-wide hidden md:table-cell">Stock</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-earth-500 uppercase tracking-wide hidden lg:table-cell">Status</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-earth-500 uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-earth-50">
              {products.map(product => (
                <tr key={product.id} className="hover:bg-cream-50 transition-colors">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-cream-100 shrink-0">
                        {product.images?.[0] ? <Image src={product.images[0]} alt={product.name} fill className="object-cover" /> : <div className="w-full h-full flex items-center justify-center text-xl">🧀</div>}
                      </div>
                      <div>
                        <p className="font-medium text-earth-900 text-sm">{product.name}</p>
                        <p className="text-xs text-earth-400 hidden sm:block">{formatDateTime(product.created_at)}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell"><span className="text-sm text-earth-600">{product.cheese_type || '—'}</span></td>
                  <td className="px-4 py-3 text-right"><span className="font-medium text-earth-900">{formatPrice(product.price)}</span></td>
                  <td className="px-4 py-3 text-center hidden md:table-cell"><span className={`text-sm ${product.stock_quantity === 0 ? 'text-red-500' : 'text-earth-600'}`}>{product.stock_quantity}</span></td>
                  <td className="px-4 py-3 text-center hidden lg:table-cell">
                    <span className={`badge ${product.in_stock ? 'bg-forest-50 text-forest-700' : 'bg-red-50 text-red-700'}`}>{product.in_stock ? 'In stock' : 'Out of stock'}</span>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <Link href={`/admin/products/${product.id}/edit`} className="p-1.5 rounded-lg text-earth-400 hover:text-cheese-600 hover:bg-cheese-50 transition-colors" title="Edit"><Pencil size={16} /></Link>
                      <DeleteProductButton productId={product.id} productName={product.name} />
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
