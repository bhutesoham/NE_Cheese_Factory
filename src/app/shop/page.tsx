import { query } from '@/lib/db'
import { Product, ProductFilters } from '@/types'
import ProductCard from '@/components/shop/ProductCard'
import ShopFilters from '@/components/shop/ShopFilters'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Alle kazen',
  description: 'Blader door ons volledige assortiment ambachtelijke kazen.',
}

async function getProducts(filters: ProductFilters): Promise<Product[]> {
  const conditions: string[] = ['1=1']
  const params: (string | number | boolean)[] = []
  let idx = 1

  if (filters.search) {
    conditions.push(`(name ILIKE $${idx} OR description ILIKE $${idx} OR cheese_type ILIKE $${idx})`)
    params.push(`%${filters.search}%`)
    idx++
  }
  if (filters.cheese_type) {
    conditions.push(`cheese_type = $${idx}`)
    params.push(filters.cheese_type)
    idx++
  }
  if (filters.min_price !== undefined) {
    conditions.push(`price >= $${idx}`)
    params.push(filters.min_price)
    idx++
  }
  if (filters.max_price !== undefined) {
    conditions.push(`price <= $${idx}`)
    params.push(filters.max_price)
    idx++
  }
  if (filters.in_stock === true) {
    conditions.push(`in_stock = true`)
  }

  const sortMap: Record<string, string> = {
    price_asc: 'price ASC',
    price_desc: 'price DESC',
    newest: 'created_at DESC',
    name: 'name ASC',
    popular: 'featured DESC, sort_order ASC',
  }
  const orderBy = sortMap[filters.sort || 'popular'] || 'featured DESC, sort_order ASC'

  const rows = await query<Product>(
    `SELECT * FROM products WHERE ${conditions.join(' AND ')} ORDER BY ${orderBy}`,
    params
  )
  return rows.map(p => ({
    ...p,
    price: parseFloat(p.price as unknown as string),
    images: Array.isArray(p.images) ? p.images : [],
    weight_options: Array.isArray(p.weight_options) ? p.weight_options : [],
  }))
}

async function getCheesTypes(): Promise<string[]> {
  const rows = await query<{ cheese_type: string }>(
    `SELECT DISTINCT cheese_type FROM products WHERE cheese_type IS NOT NULL ORDER BY cheese_type`
  )
  return rows.map(r => r.cheese_type)
}

interface ShopPageProps {
  searchParams: { [key: string]: string | undefined }
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const filters: ProductFilters = {
    search: searchParams.search,
    cheese_type: searchParams.type,
    min_price: searchParams.min ? parseFloat(searchParams.min) : undefined,
    max_price: searchParams.max ? parseFloat(searchParams.max) : undefined,
    in_stock: searchParams.instock === 'true' ? true : undefined,
    sort: (searchParams.sort as ProductFilters['sort']) || 'popular',
  }

  const [products, cheeseTypes] = await Promise.all([
    getProducts(filters),
    getCheesTypes(),
  ])

  const hasFilters = !!(filters.search || filters.cheese_type || filters.min_price || filters.max_price || filters.in_stock)

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 md:py-14">
      {/* Page header */}
      <div className="mb-10">
        <p className="text-cheese-600 text-sm font-medium mb-2 uppercase tracking-wide">Assortiment</p>
        <h1 className="section-title">Alle kazen</h1>
        <p className="text-earth-500 mt-2">
          {products.length} {products.length === 1 ? 'product' : 'producten'} gevonden
          {hasFilters && <span> voor uw selectie</span>}
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar filters */}
        <aside className="lg:w-64 shrink-0">
          <ShopFilters cheeseTypes={cheeseTypes} currentFilters={filters} />
        </aside>

        {/* Product grid */}
        <div className="flex-1">
          {products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 animate-stagger">
              {products.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-24 text-earth-400">
              <div className="text-6xl mb-4">🔍</div>
              <p className="text-lg font-medium text-earth-600 mb-2">Geen kazen gevonden</p>
              <p className="text-sm">Probeer een andere zoekopdracht of verwijder filters</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
