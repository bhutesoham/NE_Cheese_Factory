'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ShoppingCart, ChevronLeft, Tag, Check, Package } from 'lucide-react'
import { Product, WeightOption } from '@/types'
import { formatPrice, cn } from '@/lib/utils'
import { useCartContext } from '@/lib/CartContext'
import ProductCard from '@/components/shop/ProductCard'

interface Props {
  product: Product
  related: Product[]
}

export default function ProductDetailClient({ product, related }: Props) {
  const { addItem } = useCartContext()
  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [selectedWeight, setSelectedWeight] = useState<WeightOption | null>(
    product.weight_options?.[0] || null
  )
  const [added, setAdded] = useState(false)

  const images = product.images?.length ? product.images : []
  const hasWeightOptions = product.weight_options?.length > 0
  const effectivePrice = (selectedWeight?.price || 0) > 0
    ? selectedWeight!.price
    : product.price

  const handleAddToCart = () => {
    if (!product.in_stock) return
    addItem({
      product_id: product.id,
      product_name: product.name,
      product_image: images[0] || null,
      price: effectivePrice,
      quantity,
      weight_option: selectedWeight?.label,
    })
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      {/* Breadcrumb */}
      <Link
        href="/shop"
        className="inline-flex items-center gap-1 text-sm text-earth-500 hover:text-cheese-600 mb-8 transition-colors"
      >
        <ChevronLeft size={16} />
        Terug naar alle kazen
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20">
        {/* Images */}
        <div className="space-y-3">
          {/* Main image */}
          <div className="relative aspect-square rounded-2xl overflow-hidden bg-cream-100">
            {images[selectedImage] ? (
              <Image
                src={images[selectedImage]}
                alt={product.name}
                fill
                className="object-cover"
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-9xl opacity-30">
                🧀
              </div>
            )}
            {!product.in_stock && (
              <div className="absolute inset-0 bg-earth-900/40 flex items-center justify-center">
                <span className="bg-earth-800 text-white px-6 py-2 rounded-full font-medium">
                  Uitverkocht
                </span>
              </div>
            )}
          </div>

          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={cn(
                    'relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors',
                    i === selectedImage ? 'border-cheese-500' : 'border-transparent hover:border-earth-300'
                  )}
                >
                  <Image src={img} alt={`${product.name} ${i + 1}`} fill className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex flex-col">
          {/* Type badge */}
          {product.cheese_type && (
            <div className="flex items-center gap-1.5 text-sm text-cheese-600 font-medium mb-3">
              <Tag size={14} />
              {product.cheese_type}
            </div>
          )}

          <h1 className="font-serif text-4xl text-earth-900 mb-4 leading-tight">{product.name}</h1>

          {product.short_description && (
            <p className="text-earth-500 text-lg leading-relaxed mb-6">{product.short_description}</p>
          )}

          {/* Price */}
          <div className="flex items-baseline gap-2 mb-6">
            <span className="font-serif text-4xl text-cheese-700">{formatPrice(effectivePrice)}</span>
            <span className="text-earth-400 text-sm">per stuk</span>
          </div>

          {/* Weight options */}
          {hasWeightOptions && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-earth-700 mb-2">
                Gewicht / maat
              </label>
              <div className="flex flex-wrap gap-2">
                {product.weight_options.map(opt => (
                  <button
                    key={opt.label}
                    onClick={() => setSelectedWeight(opt)}
                    className={cn(
                      'px-4 py-2 rounded-lg border text-sm font-medium transition-all',
                      selectedWeight?.label === opt.label
                        ? 'bg-cheese-500 text-white border-cheese-500'
                        : 'border-earth-200 text-earth-700 hover:border-cheese-400'
                    )}
                  >
                    {opt.label}
                    {opt.price > 0 && (
                      <span className="ml-1.5 opacity-70 text-xs">{formatPrice(opt.price)}</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity */}
          {product.in_stock && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-earth-700 mb-2">Aantal</label>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  className="w-10 h-10 rounded-lg border border-earth-200 text-earth-700 hover:bg-cream-100 flex items-center justify-center text-lg font-medium transition-colors"
                >
                  −
                </button>
                <span className="w-8 text-center font-medium text-earth-900">{quantity}</span>
                <button
                  onClick={() => setQuantity(q => q + 1)}
                  className="w-10 h-10 rounded-lg border border-earth-200 text-earth-700 hover:bg-cream-100 flex items-center justify-center text-lg font-medium transition-colors"
                >
                  +
                </button>
              </div>
            </div>
          )}

          {/* Add to cart */}
          <div className="flex gap-3 mb-8">
            <button
              onClick={handleAddToCart}
              disabled={!product.in_stock}
              className={cn(
                'flex-1 btn-primary text-base py-4',
                added && 'bg-forest-600 hover:bg-forest-700'
              )}
            >
              {added ? (
                <>
                  <Check size={20} />
                  Toegevoegd aan winkelwagen!
                </>
              ) : (
                <>
                  <ShoppingCart size={20} />
                  {product.in_stock ? 'In winkelwagen' : 'Uitverkocht'}
                </>
              )}
            </button>
            {added && (
              <Link href="/shop/cart" className="btn-secondary">
                Bekijk
              </Link>
            )}
          </div>

          {/* Stock info */}
          <div className="flex items-center gap-2 text-sm mb-8">
            <Package size={16} className={product.in_stock ? 'text-forest-500' : 'text-earth-400'} />
            <span className={product.in_stock ? 'text-forest-600' : 'text-earth-400'}>
              {product.in_stock
                ? `Op voorraad (${product.stock_quantity} beschikbaar)`
                : 'Momenteel niet op voorraad'}
            </span>
          </div>

          {/* Divider */}
          <div className="border-t border-earth-100 pt-6">
            <div className="bg-cheese-50 rounded-xl p-4 text-sm text-earth-700 leading-relaxed">
              <strong className="text-earth-900 block mb-1">Betaling bij ontvangst</strong>
              U betaalt wanneer uw bestelling wordt bezorgd. Geen vooruitbetaling vereist.
              Wij nemen contact op om de leveringsdatum te bevestigen.
            </div>
          </div>
        </div>
      </div>

      {/* Description */}
      {product.description && (
        <div className="max-w-3xl mb-20">
          <h2 className="font-serif text-2xl text-earth-900 mb-4">Over deze kaas</h2>
          <div className="text-earth-600 leading-relaxed whitespace-pre-line">{product.description}</div>
        </div>
      )}

      {/* Related */}
      {related.length > 0 && (
        <div>
          <h2 className="font-serif text-2xl text-earth-900 mb-6">Misschien ook interessant</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {related.map(p => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
