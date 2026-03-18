'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ShoppingCart, Menu, X } from 'lucide-react'
import { useState } from 'react'
import { useCartContext } from '@/lib/CartContext'
import { cn } from '@/lib/utils'

export default function Header() {
  const { itemCount, mounted } = useCartContext()
  const [mobileOpen, setMobileOpen] = useState(false)
  const pathname = usePathname()

  const navLinks = [
    { href: '/shop', label: 'All Cheeses' },
    { href: '/shop?type=Gouda', label: 'Gouda' },
    { href: '/shop?type=Farmhouse+Cheese', label: 'Farmhouse' },
    { href: '/shop?type=Goat+Cheese', label: 'Goat Cheese' },
    { href: '/privacy', label: 'Privacy' },
  ]

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-cream-50/95 backdrop-blur-sm border-b border-earth-100 h-[var(--header-height)]">
      <div className="max-w-6xl mx-auto px-4 h-full flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <span className="text-2xl">🧀</span>
          <span className="font-serif text-xl text-earth-900 leading-none">The Cheese Shop</span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {navLinks.slice(0, 4).map(link => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                pathname === link.href
                  ? 'text-cheese-700 bg-cheese-50'
                  : 'text-earth-600 hover:text-cheese-700 hover:bg-cream-100'
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link href="/shop/cart" className="relative flex items-center gap-2 btn-ghost text-sm">
            <ShoppingCart size={20} />
            <span className="hidden sm:inline">Cart</span>
            {mounted && itemCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-cheese-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center leading-none">
                {itemCount > 9 ? '9+' : itemCount}
              </span>
            )}
          </Link>

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-lg text-earth-600 hover:text-earth-900 hover:bg-cream-100"
            aria-label="Menu"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-cream-50 border-b border-earth-100 shadow-lg">
          <nav className="max-w-6xl mx-auto px-4 py-3 flex flex-col gap-1">
            {navLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="px-4 py-3 rounded-lg text-earth-700 hover:text-cheese-700 hover:bg-cream-100 font-medium transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  )
}
