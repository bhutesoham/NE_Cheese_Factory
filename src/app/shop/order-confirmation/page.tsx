import Link from 'next/link'
import { CheckCircle, Mail, Truck, Phone } from 'lucide-react'

interface Props { searchParams: { order?: string } }

export default function OrderConfirmationPage({ searchParams }: Props) {
  const orderNumber = searchParams.order || '–'
  const shopPhone = process.env.NEXT_PUBLIC_SHOP_PHONE || ''
  const shopEmail = process.env.NEXT_PUBLIC_SHOP_EMAIL || ''

  return (
    <div className="max-w-2xl mx-auto px-4 py-20 text-center">
      <div className="card p-10">
        <div className="w-20 h-20 bg-forest-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle size={40} className="text-forest-500" />
        </div>
        <h1 className="font-serif text-4xl text-earth-900 mb-3">Thank you!</h1>
        <p className="text-earth-500 text-lg mb-6">Your order has been received.</p>
        <div className="bg-cream-100 rounded-xl px-6 py-4 mb-8 inline-block">
          <p className="text-sm text-earth-500 mb-1">Order number</p>
          <p className="font-serif text-2xl text-cheese-700 font-medium">{orderNumber}</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8 text-left">
          <div className="bg-cream-50 rounded-xl p-4">
            <Mail size={20} className="text-cheese-500 mb-2" />
            <p className="text-sm font-medium text-earth-800">Confirmation</p>
            <p className="text-xs text-earth-500 mt-1">You will receive a confirmation email at the address you provided.</p>
          </div>
          <div className="bg-cream-50 rounded-xl p-4">
            <Phone size={20} className="text-cheese-500 mb-2" />
            <p className="text-sm font-medium text-earth-800">We will contact you</p>
            <p className="text-xs text-earth-500 mt-1">We will reach out to confirm your delivery date.</p>
          </div>
          <div className="bg-cream-50 rounded-xl p-4">
            <Truck size={20} className="text-cheese-500 mb-2" />
            <p className="text-sm font-medium text-earth-800">Payment on delivery</p>
            <p className="text-xs text-earth-500 mt-1">No payment needed now. Pay when your order arrives.</p>
          </div>
        </div>
        {(shopEmail || shopPhone) && (
          <p className="text-sm text-earth-500 mb-8">
            Questions? Contact us via{' '}
            {shopEmail && <a href={`mailto:${shopEmail}`} className="text-cheese-600 hover:underline">{shopEmail}</a>}
            {shopEmail && shopPhone && ' or '}
            {shopPhone && <a href={`tel:${shopPhone}`} className="text-cheese-600 hover:underline">{shopPhone}</a>}
          </p>
        )}
        <Link href="/shop" className="btn-primary">Continue shopping</Link>
      </div>
    </div>
  )
}
