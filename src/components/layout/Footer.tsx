import Link from 'next/link'

export default function Footer() {
  const shopName = process.env.NEXT_PUBLIC_SHOP_NAME || 'The Cheese Shop'
  const shopEmail = process.env.NEXT_PUBLIC_SHOP_EMAIL || ''
  const shopPhone = process.env.NEXT_PUBLIC_SHOP_PHONE || ''
  const year = new Date().getFullYear()

  return (
    <footer className="bg-earth-900 text-earth-200 mt-20">
      <div className="max-w-6xl mx-auto px-4 py-14 grid grid-cols-1 md:grid-cols-3 gap-10">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl">🧀</span>
            <span className="font-serif text-xl text-white">{shopName}</span>
          </div>
          <p className="text-sm text-earth-400 leading-relaxed">
            Artisan cheeses, crafted with care and delivered straight to your door.
            Fresh from the farm, made for your table.
          </p>
        </div>

        <div>
          <h3 className="font-serif text-white text-lg mb-4">Navigation</h3>
          <nav className="flex flex-col gap-2 text-sm">
            <Link href="/shop" className="text-earth-400 hover:text-cheese-300 transition-colors">All Cheeses</Link>
            <Link href="/shop/cart" className="text-earth-400 hover:text-cheese-300 transition-colors">Shopping Cart</Link>
            <Link href="/privacy" className="text-earth-400 hover:text-cheese-300 transition-colors">Privacy Policy</Link>
          </nav>
        </div>

        <div>
          <h3 className="font-serif text-white text-lg mb-4">Contact</h3>
          <div className="flex flex-col gap-2 text-sm text-earth-400">
            {shopEmail && (
              <a href={`mailto:${shopEmail}`} className="hover:text-cheese-300 transition-colors">{shopEmail}</a>
            )}
            {shopPhone && (
              <a href={`tel:${shopPhone}`} className="hover:text-cheese-300 transition-colors">{shopPhone}</a>
            )}
            <p className="text-earth-500 text-xs mt-2">
              Payment on delivery.<br />
              Delivery across the Netherlands.
            </p>
          </div>
        </div>
      </div>

      <div className="border-t border-earth-800">
        <div className="max-w-6xl mx-auto px-4 py-4 flex flex-col sm:flex-row justify-between items-center gap-2 text-xs text-earth-500">
          <span>© {year} {shopName}. All rights reserved.</span>
          <span>Your data is safe – GDPR compliant 🇪🇺</span>
        </div>
      </div>
    </footer>
  )
}
