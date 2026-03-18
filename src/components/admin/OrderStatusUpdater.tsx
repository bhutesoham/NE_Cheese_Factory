'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { OrderStatus } from '@/types'
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS, cn } from '@/lib/utils'
import { Loader2, ChevronDown } from 'lucide-react'

interface Props { orderId: string; currentStatus: OrderStatus }
const STATUSES: OrderStatus[] = ['pending', 'confirmed', 'shipped', 'completed', 'cancelled']

export default function OrderStatusUpdater({ orderId, currentStatus }: Props) {
  const [status, setStatus] = useState<OrderStatus>(currentStatus)
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const router = useRouter()

  const handleUpdate = async () => {
    if (status === currentStatus) return
    setLoading(true)
    try {
      const res = await fetch(`/api/orders/${orderId}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) })
      if (!res.ok) throw new Error('Update failed')
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
      router.refresh()
    } catch { alert('Failed to update status.') }
    finally { setLoading(false) }
  }

  return (
    <div className="flex items-center gap-3">
      <div className="relative">
        <select value={status} onChange={e => setStatus(e.target.value as OrderStatus)} className="input-field text-sm py-2 pr-8 appearance-none cursor-pointer">
          {STATUSES.map(s => <option key={s} value={s}>{ORDER_STATUS_LABELS[s]}</option>)}
        </select>
        <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-earth-400 pointer-events-none" />
      </div>
      <button onClick={handleUpdate} disabled={loading || status === currentStatus} className={cn('btn-primary px-4 py-2 text-sm', saved && 'bg-forest-600 hover:bg-forest-700', status === currentStatus && 'opacity-40 cursor-not-allowed')}>
        {loading ? <><Loader2 size={14} className="animate-spin" /> Saving...</> : saved ? 'Saved!' : 'Update status'}
      </button>
      <span className={`badge ${ORDER_STATUS_COLORS[currentStatus]} hidden sm:inline-flex`}>{ORDER_STATUS_LABELS[currentStatus]}</span>
    </div>
  )
}
