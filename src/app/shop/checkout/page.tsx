'use client'

import { useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { ChevronLeft, Lock, Loader2 } from 'lucide-react'
import { useCartContext } from '@/lib/CartContext'
import { formatPrice } from '@/lib/utils'

interface FormData {
  customer_name: string
  customer_email: string
  customer_phone: string
  delivery_address: string
  delivery_city: string
  delivery_postal_code: string
  notes: string
}

interface FieldErrors {
  customer_name?: string
  customer_email?: string
  delivery_address?: string
  delivery_city?: string
  delivery_postal_code?: string
}

export default function CheckoutPage() {
  const { cart, items, clearCart, mounted } = useCartContext()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})

  // Use refs instead of state for form values to prevent re-render on each keystroke
  const nameRef = useRef<HTMLInputElement>(null)
  const emailRef = useRef<HTMLInputElement>(null)
  const phoneRef = useRef<HTMLInputElement>(null)
  const addressRef = useRef<HTMLInputElement>(null)
  const cityRef = useRef<HTMLInputElement>(null)
  const postalRef = useRef<HTMLInputElement>(null)
  const notesRef = useRef<HTMLTextAreaElement>(null)

  const clearFieldError = useCallback((field: keyof FieldErrors) => {
    setFieldErrors(prev => ({ ...prev, [field]: '' }))
  }, [])

  if (!mounted) return null

  if (items.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-24 text-center">
        <p className="text-earth-500 mb-4">Your cart is empty.</p>
        <Link href="/shop" className="btn-primary">Browse cheeses</Link>
      </div>
    )
  }

  function validate(data: FormData): boolean {
    const errors: FieldErrors = {}
    if (!data.customer_name.trim()) errors.customer_name = 'Name is required'
    if (!data.customer_email.trim()) errors.customer_email = 'Email address is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.customer_email)) errors.customer_email = 'Invalid email address'
    if (!data.delivery_address.trim()) errors.delivery_address = 'Address is required'
    if (!data.delivery_city.trim()) errors.delivery_city = 'City is required'
    if (!data.delivery_postal_code.trim()) errors.delivery_postal_code = 'Postal code is required'
    else if (!/^\d{4}\s?[A-Z]{2}$/i.test(data.delivery_postal_code)) errors.delivery_postal_code = 'Invalid postal code (e.g. 1234 AB)'
    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async () => {
    const data: FormData = {
      customer_name: nameRef.current?.value || '',
      customer_email: emailRef.current?.value || '',
      customer_phone: phoneRef.current?.value || '',
      delivery_address: addressRef.current?.value || '',
      delivery_city: cityRef.current?.value || '',
      delivery_postal_code: postalRef.current?.value || '',
      notes: notesRef.current?.value || '',
    }

    if (!validate(data)) return
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, items, delivery_cost: cart.delivery_cost }),
      })
      const result = await res.json()
      if (!res.ok) throw new Error(result.error || 'Something went wrong')
      clearCart()
      router.push(`/shop/order-confirmation?order=${result.order_number}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <Link href="/shop/cart" className="inline-flex items-center gap-1 text-sm text-earth-500 hover:text-cheese-600 mb-8 transition-colors">
        <ChevronLeft size={16} />Back to cart
      </Link>

      <h1 className="section-title mb-10">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form */}
        <div className="lg:col-span-2 space-y-6">

          {/* Contact details */}
          <div className="card p-6 space-y-5">
            <h2 className="font-serif text-xl text-earth-900">Your details</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-earth-700 mb-1.5">Full name <span className="text-cheese-600">*</span></label>
                <input ref={nameRef} type="text" placeholder="Jane Smith" onChange={() => clearFieldError('customer_name')} className={`input-field ${fieldErrors.customer_name ? 'border-red-400 ring-2 ring-red-200' : ''}`} />
                {fieldErrors.customer_name && <p className="text-red-500 text-xs mt-1">{fieldErrors.customer_name}</p>}
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-earth-700 mb-1.5">Email address <span className="text-cheese-600">*</span></label>
                <input ref={emailRef} type="email" placeholder="jane@email.com" onChange={() => clearFieldError('customer_email')} className={`input-field ${fieldErrors.customer_email ? 'border-red-400 ring-2 ring-red-200' : ''}`} />
                {fieldErrors.customer_email && <p className="text-red-500 text-xs mt-1">{fieldErrors.customer_email}</p>}
              </div>
              <div className="col-span-1">
                <label className="block text-sm font-medium text-earth-700 mb-1.5">Phone number</label>
                <input ref={phoneRef} type="tel" placeholder="+31 6 12345678" className="input-field" />
              </div>
            </div>
          </div>

          {/* Delivery address */}
          <div className="card p-6 space-y-5">
            <h2 className="font-serif text-xl text-earth-900">Delivery address</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-earth-700 mb-1.5">Street + house number <span className="text-cheese-600">*</span></label>
                <input ref={addressRef} type="text" placeholder="Main Street 12" onChange={() => clearFieldError('delivery_address')} className={`input-field ${fieldErrors.delivery_address ? 'border-red-400 ring-2 ring-red-200' : ''}`} />
                {fieldErrors.delivery_address && <p className="text-red-500 text-xs mt-1">{fieldErrors.delivery_address}</p>}
              </div>
              <div className="col-span-1">
                <label className="block text-sm font-medium text-earth-700 mb-1.5">Postal code <span className="text-cheese-600">*</span></label>
                <input ref={postalRef} type="text" placeholder="1234 AB" onChange={() => clearFieldError('delivery_postal_code')} className={`input-field ${fieldErrors.delivery_postal_code ? 'border-red-400 ring-2 ring-red-200' : ''}`} />
                {fieldErrors.delivery_postal_code && <p className="text-red-500 text-xs mt-1">{fieldErrors.delivery_postal_code}</p>}
              </div>
              <div className="col-span-1">
                <label className="block text-sm font-medium text-earth-700 mb-1.5">City <span className="text-cheese-600">*</span></label>
                <input ref={cityRef} type="text" placeholder="Amsterdam" onChange={() => clearFieldError('delivery_city')} className={`input-field ${fieldErrors.delivery_city ? 'border-red-400 ring-2 ring-red-200' : ''}`} />
                {fieldErrors.delivery_city && <p className="text-red-500 text-xs mt-1">{fieldErrors.delivery_city}</p>}
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="card p-6">
            <h2 className="font-serif text-xl text-earth-900 mb-5">Notes (optional)</h2>
            <textarea ref={notesRef} rows={3} placeholder="E.g. ring doorbell on arrival, or leave with neighbour" className="input-field resize-none" />
          </div>

          <p className="text-xs text-earth-400 leading-relaxed">
            Your personal data is only used to process your order. See our{' '}
            <Link href="/privacy" className="text-cheese-600 hover:underline">privacy policy</Link> for more information.
          </p>
        </div>

        {/* Order summary */}
        <div className="lg:col-span-1">
          <div className="card p-6 sticky top-24">
            <h2 className="font-serif text-xl text-earth-900 mb-4">Your order</h2>

            <div className="space-y-3 mb-4">
              {items.map(item => (
                <div key={`${item.product_id}-${item.weight_option}`} className="flex items-center gap-3">
                  <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-cream-100 shrink-0">
                    {item.product_image
                      ? <Image src={item.product_image} alt={item.product_name} fill className="object-cover" />
                      : <div className="w-full h-full flex items-center justify-center text-xl">🧀</div>
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-earth-900 truncate">{item.product_name}</p>
                    {item.weight_option && <p className="text-xs text-earth-400">{item.weight_option}</p>}
                    <p className="text-xs text-earth-500">{item.quantity}× {formatPrice(item.price)}</p>
                  </div>
                  <span className="text-sm font-medium text-earth-900 shrink-0">{formatPrice(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>

            <div className="border-t border-earth-100 pt-3 space-y-1 text-sm mb-4">
              <div className="flex justify-between text-earth-600">
                <span>Subtotal</span><span>{formatPrice(cart.subtotal)}</span>
              </div>
              <div className="flex justify-between text-earth-600">
                <span>Delivery</span>
                <span className={cart.delivery_cost === 0 ? 'text-forest-600' : ''}>
                  {cart.delivery_cost === 0 ? 'Free' : formatPrice(cart.delivery_cost)}
                </span>
              </div>
              <div className="flex justify-between font-medium text-base pt-1 border-t border-earth-100">
                <span className="text-earth-900">Total</span>
                <span className="font-serif text-lg text-cheese-700">{formatPrice(cart.total)}</span>
              </div>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>
            )}

            <button onClick={handleSubmit} disabled={loading} className="btn-primary w-full py-4 text-base">
              {loading
                ? <><Loader2 size={18} className="animate-spin" /> Placing order...</>
                : <><Lock size={16} /> Place order</>
              }
            </button>

            <p className="text-xs text-earth-400 text-center mt-3">
              Payment on delivery · No upfront payment
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
