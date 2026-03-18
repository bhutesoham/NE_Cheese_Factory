import Link from 'next/link'
import { query } from '@/lib/db'
import { Product } from '@/types'
import ProductCard from '@/components/shop/ProductCard'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { ChevronRight, Truck, Leaf, Award } from 'lucide-react'

async function getFeaturedProducts(): Promise<Product[]> {
  try {
    const rows = await query<Product>(
      `SELECT * FROM products WHERE featured = true AND in_stock = true ORDER BY sort_order ASC LIMIT 6`
    )
    return rows.map(p => ({
      ...p,
      price: parseFloat(p.price as unknown as string),
      images: Array.isArray(p.images) ? p.images : [],
      weight_options: Array.isArray(p.weight_options) ? p.weight_options : [],
    }))
  } catch {
    return []
  }
}

export default async function HomePage() {
  const featured = await getFeaturedProducts()

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 pt-[var(--header-height)]">
        <section className="relative overflow-hidden bg-gradient-to-br from-earth-900 via-earth-800 to-cheese-900 text-white">
          <div className="absolute inset-0 opacity-10 bg-grain" />
          <div className="relative max-w-6xl mx-auto px-4 py-24 md:py-36">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 bg-cheese-500/20 border border-cheese-400/30 rounded-full px-4 py-1.5 text-cheese-200 text-sm mb-6">
                <Leaf size={14} />
                Artisan &amp; fresh
              </div>
              <h1 className="font-serif text-5xl md:text-7xl leading-[1.05] text-white mb-6">
                Cheese the way<br />
                <em className="text-cheese-300">it should taste</em>
              </h1>
              <p className="text-earth-300 text-lg md:text-xl leading-relaxed mb-10 max-w-xl">
                Direct from the farm to your door. Aged Gouda, fresh farmhouse cheese,
                sheep cheese and more — made with care and ripened with craft.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link href="/shop" className="btn-primary text-base px-8 py-4">
                  Browse all cheeses
                  <ChevronRight size={18} />
                </Link>
                <Link href="/shop/cart" className="btn-secondary border-earth-400 text-earth-200 hover:bg-earth-700 text-base px-8 py-4">
                  View Cart
                </Link>
              </div>
            </div>
          </div>
          <div className="absolute right-0 top-0 bottom-0 w-1/3 hidden lg:block overflow-hidden">
            <div className="absolute top-1/2 right-16 -translate-y-1/2 text-[200px] opacity-20 select-none">🧀</div>
          </div>
        </section>

        <section className="bg-white border-b border-earth-100">
          <div className="max-w-6xl mx-auto px-4 py-8 grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { icon: <Truck size={20} />, title: 'Home Delivery', text: 'Free delivery from €25' },
              { icon: <Leaf size={20} />, title: 'Artisan', text: 'Made with fresh raw milk' },
              { icon: <Award size={20} />, title: 'Quality', text: 'Ripened the traditional way' },
            ].map(usp => (
              <div key={usp.title} className="flex items-center gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-cheese-50 rounded-full flex items-center justify-center text-cheese-600">
                  {usp.icon}
                </div>
                <div>
                  <div className="font-medium text-earth-900">{usp.title}</div>
                  <div className="text-sm text-earth-500">{usp.text}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-4 py-16 md:py-24">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-cheese-600 text-sm font-medium mb-2 uppercase tracking-wide">Featured</p>
              <h2 className="section-title">Our specialities</h2>
            </div>
            <Link href="/shop" className="text-cheese-600 hover:text-cheese-700 text-sm font-medium flex items-center gap-1 transition-colors">
              All cheeses <ChevronRight size={16} />
            </Link>
          </div>

          {featured.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-stagger">
              {featured.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 text-earth-400">
              <div className="text-5xl mb-4">🧀</div>
              <p>Products will be added soon.</p>
              <p className="text-sm mt-2">Add products via the admin dashboard.</p>
            </div>
          )}
        </section>

        <section className="bg-forest-800 text-white">
          <div className="max-w-6xl mx-auto px-4 py-16 text-center">
            <h2 className="font-serif text-3xl md:text-4xl text-white mb-4">Ready to taste?</h2>
            <p className="text-forest-200 mb-8 max-w-lg mx-auto">
              Order today and receive your cheeses fresh at home.
              Payment on delivery — no upfront payment needed.
            </p>
            <Link href="/shop" className="btn-primary bg-cheese-500 hover:bg-cheese-400 text-lg px-10 py-4">
              Order now <ChevronRight size={20} />
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
