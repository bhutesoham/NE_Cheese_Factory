'use client'

import Link from 'next/link'
import Image from 'next/image'
import { ShoppingCart, Tag } from 'lucide-react'
import { Product } from '@/types'
import { formatPrice, cn } from '@/lib/utils'
import { useCartContext } from '@/lib/CartContext'
import { useState } from 'react'

export default function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCartContext()
  const [added, setAdded] = useState(false)
  const mainImage = product.images?.[0]

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!product.in_stock) return
    addItem({
      product_id: product.id,
      product_name: product.name,
      product_image: mainImage || null,
      price: product.price,
      quantity: 1,
    })
    setAdded(true)
    setTimeout(() => setAdded(false), 1500)
  }

  return (
    <Link href={`/shop/products/${product.slug}`} className="group block">
      <div className="card overflow-hidden hover:shadow-md transition-all duration-300 hover:-translate-y-1">
        <div className="relative aspect-[4/3] bg-cream-100 overflow-hidden">
          {mainImage ? (
            <Image src={mainImage} alt={product.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-6xl opacity-40">🧀</div>
          )}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
            {!product.in_stock && <span className="badge bg-earth-800 text-earth-100">Out of stock</span>}
            {product.featured && product.in_stock && <span className="badge bg-cheese-500 text-white">Featured</span>}
          </div>
          {product.in_stock && (
            <button
              onClick={handleQuickAdd}
              className={cn(
                'absolute bottom-3 right-3 flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-lg transition-all duration-200',
                added
                  ? 'bg-forest-600 text-white scale-95'
                  : 'bg-white/90 backdrop-blur-sm text-earth-800 hover:bg-cheese-500 hover:text-white opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0'
              )}
            >
              <ShoppingCart size={14} />
              {added ? 'Added!' : 'Quick add'}
            </button>
          )}
        </div>
        <div className="p-4">
          {product.cheese_type && (
            <div className="flex items-center gap-1 text-xs text-cheese-600 font-medium mb-1">
              <Tag size={11} />{product.cheese_type}
            </div>
          )}
          <h3 className="font-serif text-lg text-earth-900 leading-snug mb-1 group-hover:text-cheese-700 transition-colors">{product.name}</h3>
          {product.short_description && (
            <p className="text-sm text-earth-500 leading-relaxed line-clamp-2 mb-3">{product.short_description}</p>
          )}
          <div className="flex items-center justify-between">
            <span className="font-serif text-xl text-cheese-700 font-medium">{formatPrice(product.price)}</span>
            {product.in_stock
              ? <span className="text-xs text-forest-600 bg-forest-50 px-2 py-0.5 rounded-full">In stock</span>
              : <span className="text-xs text-earth-400 bg-earth-50 px-2 py-0.5 rounded-full">Out of stock</span>
            }
          </div>
        </div>
      </div>
    </Link>
  )
}
