'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { ORDER_STATUS_LABELS, cn } from '@/lib/utils'
import { Search } from 'lucide-react'
import { useState } from 'react'

const STATUSES = ['', 'pending', 'confirmed', 'shipped', 'completed', 'cancelled']
const STATUS_LABELS: Record<string, string> = { '': 'All', ...ORDER_STATUS_LABELS }

export default function OrderStatusFilter({ currentStatus, currentSearch }: { currentStatus?: string; currentSearch?: string }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [search, setSearch] = useState(currentSearch || '')

  const update = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString())
    if (!value) params.delete(key)
    else params.set(key, value)
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <div className="flex flex-col sm:flex-row gap-3 mb-6">
      <div className="flex flex-wrap gap-1.5">
        {STATUSES.map(status => (
          <button key={status} onClick={() => update('status', status || null)} className={cn('px-3 py-1.5 rounded-lg text-sm font-medium transition-colors', (currentStatus || '') === status ? 'bg-cheese-500 text-white' : 'bg-white border border-earth-200 text-earth-600 hover:border-cheese-300')}>
            {STATUS_LABELS[status]}
          </button>
        ))}
      </div>
      <div className="flex gap-2 sm:ml-auto">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-earth-400" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && update('search', search || null)} placeholder="Search orders..." className="input-field text-sm py-1.5 pl-8 w-48" />
        </div>
        <button onClick={() => update('search', search || null)} className="btn-primary px-3 py-1.5 text-sm">Search</button>
      </div>
    </div>
  )
}
