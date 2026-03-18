'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Trash2, ShoppingBag, ArrowRight, ChevronLeft } from 'lucide-react'
import { useCartContext } from '@/lib/CartContext'
import { formatPrice, DELIVERY_COST, FREE_DELIVERY_THRESHOLD } from '@/lib/utils'

export default function CartPage() {
  const { cart, items, mounted, removeItem, updateQuantity } = useCartContext()

  if (!mounted) return (
    <div className="max-w-4xl mx-auto px-4 py-16 text-center">
      <p className="text-earth-400">Loading cart...</p>
    </div>
  )

  if (items.length === 0) return (
    <div className="max-w-4xl mx-auto px-4 py-24 flex flex-col items-center text-center">
      <div className="text-8xl mb-6 opacity-40">🛒</div>
      <h1 className="font-serif text-3xl text-earth-800 mb-3">Your cart is empty</h1>
      <p className="text-earth-500 mb-8">Add some delicious cheeses to get started.</p>
      <Link href="/shop" className="btn-primary"><ShoppingBag size={18} />Browse cheeses</Link>
    </div>
  )

  const remaining = FREE_DELIVERY_THRESHOLD - cart.subtotal

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <Link href="/shop" className="inline-flex items-center gap-1 text-sm text-earth-500 hover:text-cheese-600 mb-8 transition-colors">
        <ChevronLeft size={16} />Continue shopping
      </Link>
      <h1 className="section-title mb-10">Shopping Cart <span className="text-earth-400 text-2xl font-sans font-normal ml-2">({items.length})</span></h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-3">
          {items.map(item => (
            <div key={`${item.product_id}-${item.weight_option}`} className="card p-4 flex items-center gap-4">
              <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-cream-100 shrink-0">
                {item.product_image ? <Image src={item.product_image} alt={item.product_name} fill className="object-cover" /> : <div className="w-full h-full flex items-center justify-center text-3xl">🧀</div>}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-earth-900 truncate">{item.product_name}</h3>
                {item.weight_option && <p className="text-sm text-earth-400">{item.weight_option}</p>}
                <p className="text-cheese-600 font-medium">{formatPrice(item.price)}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button onClick={() => updateQuantity(item.product_id, item.weight_option, item.quantity - 1)} className="w-8 h-8 rounded-lg border border-earth-200 text-earth-600 hover:bg-cream-100 flex items-center justify-center transition-colors">−</button>
                <span className="w-6 text-center font-medium">{item.quantity}</span>
                <button onClick={() => updateQuantity(item.product_id, item.weight_option, item.quantity + 1)} className="w-8 h-8 rounded-lg border border-earth-200 text-earth-600 hover:bg-cream-100 flex items-center justify-center transition-colors">+</button>
              </div>
              <div className="text-right shrink-0 min-w-[70px]">
                <p className="font-medium text-earth-900">{formatPrice(item.price * item.quantity)}</p>
              </div>
              <button onClick={() => removeItem(item.product_id, item.weight_option)} className="p-2 text-earth-300 hover:text-red-500 transition-colors" aria-label="Remove"><Trash2 size={16} /></button>
            </div>
          ))}
        </div>

        <div className="lg:col-span-1">
          <div className="card p-6 sticky top-24">
            <h2 className="font-serif text-xl text-earth-900 mb-4">Order Summary</h2>
            <div className="space-y-2 text-sm mb-4">
              <div className="flex justify-between text-earth-600"><span>Subtotal</span><span>{formatPrice(cart.subtotal)}</span></div>
              <div className="flex justify-between text-earth-600"><span>Delivery</span><span className={cart.delivery_cost === 0 ? 'text-forest-600' : ''}>{cart.delivery_cost === 0 ? 'Free' : formatPrice(cart.delivery_cost)}</span></div>
            </div>
            {remaining > 0 && (
              <div className="mb-4 p-3 bg-cream-100 rounded-lg text-xs text-earth-600">
                Add <strong>{formatPrice(remaining)}</strong> more for free delivery
                <div className="mt-2 h-1.5 bg-earth-200 rounded-full overflow-hidden">
                  <div className="h-full bg-forest-500 rounded-full transition-all" style={{ width: `${Math.min(100, (cart.subtotal / FREE_DELIVERY_THRESHOLD) * 100)}%` }} />
                </div>
              </div>
            )}
            {remaining <= 0 && cart.subtotal > 0 && <div className="mb-4 p-3 bg-forest-50 rounded-lg text-xs text-forest-700">✓ You have free delivery!</div>}
            <div className="border-t border-earth-100 pt-3 mb-5">
              <div className="flex justify-between font-medium text-base">
                <span className="text-earth-900">Total</span>
                <span className="font-serif text-xl text-cheese-700">{formatPrice(cart.total)}</span>
              </div>
            </div>
            <Link href="/shop/checkout" className="btn-primary w-full text-base py-4">Checkout<ArrowRight size={18} /></Link>
            <p className="text-xs text-earth-400 text-center mt-3">Payment on delivery</p>
          </div>
        </div>
      </div>
    </div>
  )
}
