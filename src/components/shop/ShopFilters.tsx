'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { useCallback, useState } from 'react'
import { ProductFilters } from '@/types'
import { cn } from '@/lib/utils'
import { SlidersHorizontal, X } from 'lucide-react'

export default function ShopFilters({ cheeseTypes, currentFilters }: { cheeseTypes: string[]; currentFilters: ProductFilters }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [search, setSearch] = useState(currentFilters.search || '')

  const updateFilter = useCallback((key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value === null || value === '') params.delete(key)
    else params.set(key, value)
    router.push(`${pathname}?${params.toString()}`)
  }, [pathname, router, searchParams])

  const clearAll = () => { setSearch(''); router.push(pathname) }
  const hasFilters = !!(currentFilters.search || currentFilters.cheese_type || currentFilters.min_price || currentFilters.max_price || currentFilters.in_stock)

  const sortOptions = [
    { value: 'popular', label: 'Popular' },
    { value: 'newest', label: 'Newest' },
    { value: 'price_asc', label: 'Price ↑' },
    { value: 'price_desc', label: 'Price ↓' },
    { value: 'name', label: 'Name A–Z' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-earth-800 font-medium"><SlidersHorizontal size={16} />Filters</div>
        {hasFilters && <button onClick={clearAll} className="text-xs text-cheese-600 hover:text-cheese-700 flex items-center gap-1"><X size={12} />Clear</button>}
      </div>
      <div>
        <label className="block text-sm font-medium text-earth-700 mb-2">Search</label>
        <div className="flex gap-2">
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && updateFilter('search', search)} placeholder="Search cheese..." className="input-field text-sm py-2" />
          <button onClick={() => updateFilter('search', search)} className="btn-primary px-3 py-2 text-sm">Go</button>
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-earth-700 mb-2">Sort by</label>
        <select value={currentFilters.sort || 'popular'} onChange={e => updateFilter('sort', e.target.value)} className="input-field text-sm py-2">
          {sortOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
        </select>
      </div>
      {cheeseTypes.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-earth-700 mb-2">Cheese type</label>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => updateFilter('type', null)} className={cn('px-3 py-1 rounded-full text-sm border transition-colors', !currentFilters.cheese_type ? 'bg-cheese-500 text-white border-cheese-500' : 'border-earth-200 text-earth-600 hover:border-cheese-300')}>All</button>
            {cheeseTypes.map(type => (
              <button key={type} onClick={() => updateFilter('type', currentFilters.cheese_type === type ? null : type)} className={cn('px-3 py-1 rounded-full text-sm border transition-colors', currentFilters.cheese_type === type ? 'bg-cheese-500 text-white border-cheese-500' : 'border-earth-200 text-earth-600 hover:border-cheese-300')}>{type}</button>
            ))}
          </div>
        </div>
      )}
      <div>
        <label className="block text-sm font-medium text-earth-700 mb-2">Price range (€)</label>
        <div className="flex items-center gap-2">
          <input type="number" min={0} step={0.5} placeholder="Min" value={currentFilters.min_price ?? ''} onChange={e => updateFilter('min', e.target.value || null)} className="input-field text-sm py-2 w-full" />
          <span className="text-earth-400">–</span>
          <input type="number" min={0} step={0.5} placeholder="Max" value={currentFilters.max_price ?? ''} onChange={e => updateFilter('max', e.target.value || null)} className="input-field text-sm py-2 w-full" />
        </div>
      </div>
      <div className="flex items-center gap-3">
        <button role="switch" aria-checked={!!currentFilters.in_stock} onClick={() => updateFilter('instock', currentFilters.in_stock ? null : 'true')} className={cn('relative w-10 h-6 rounded-full transition-colors duration-200', currentFilters.in_stock ? 'bg-cheese-500' : 'bg-earth-200')}>
          <span className={cn('absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200', currentFilters.in_stock ? 'translate-x-5' : 'translate-x-1')} />
        </button>
        <span className="text-sm text-earth-700">In stock only</span>
      </div>
    </div>
  )
}
