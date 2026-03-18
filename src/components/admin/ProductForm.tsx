'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Plus, X, Upload, Loader2, GripVertical } from 'lucide-react'
import { Product, WeightOption } from '@/types'
import { CHEESE_TYPES, formatPrice } from '@/lib/utils'

interface Props {
  product?: Product
  isEdit?: boolean
}

export default function ProductForm({ product, isEdit }: Props) {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    name: product?.name || '',
    description: product?.description || '',
    short_description: product?.short_description || '',
    price: product?.price?.toString() || '',
    cheese_type: product?.cheese_type || '',
    in_stock: product?.in_stock ?? true,
    stock_quantity: product?.stock_quantity?.toString() || '0',
    featured: product?.featured ?? false,
    sort_order: product?.sort_order?.toString() || '0',
  })

  const [images, setImages] = useState<string[]>(product?.images || [])
  const [weightOptions, setWeightOptions] = useState<WeightOption[]>(product?.weight_options || [])

  const set = (field: keyof typeof form) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => setForm(f => ({ ...f, [field]: e.target.value }))

  const setCheck = (field: 'in_stock' | 'featured') => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [field]: e.target.checked }))

  // Image upload
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (!files.length) return
    setUploading(true)
    try {
      for (const file of files) {
        const fd = new FormData()
        fd.append('file', file)
        const res = await fetch('/api/upload', { method: 'POST', body: fd })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error)
        setImages(prev => [...prev, data.url])
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload mislukt')
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const removeImage = (index: number) => setImages(prev => prev.filter((_, i) => i !== index))

  // Weight options
  const addWeightOption = () => setWeightOptions(prev => [...prev, { label: '', price: 0 }])
  const removeWeightOption = (index: number) => setWeightOptions(prev => prev.filter((_, i) => i !== index))
  const updateWeightOption = (index: number, field: keyof WeightOption, value: string) => {
    setWeightOptions(prev => prev.map((opt, i) =>
      i === index ? { ...opt, [field]: field === 'price' ? parseFloat(value) || 0 : value } : opt
    ))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')

    const payload = {
      ...form,
      price: parseFloat(form.price),
      stock_quantity: parseInt(form.stock_quantity),
      sort_order: parseInt(form.sort_order),
      images,
      weight_options: weightOptions.filter(o => o.label.trim()),
    }

    try {
      const url = isEdit ? `/api/products/${product!.id}` : '/api/products'
      const method = isEdit ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      router.push('/admin/products')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Opslaan mislukt')
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">{error}</div>
      )}

      {/* Basic info */}
      <div className="card p-6 space-y-5">
        <h2 className="font-serif text-xl text-earth-900">Productinformatie</h2>

        <div>
          <label className="block text-sm font-medium text-earth-700 mb-1.5">
            Naam <span className="text-cheese-600">*</span>
          </label>
          <input
            type="text"
            value={form.name}
            onChange={set('name')}
            placeholder="Bijv. Oude Gouda 48+"
            required
            className="input-field"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-earth-700 mb-1.5">Korte omschrijving</label>
          <input
            type="text"
            value={form.short_description}
            onChange={set('short_description')}
            placeholder="Één zin die de kaas beschrijft (verschijnt in het overzicht)"
            maxLength={500}
            className="input-field"
          />
          <p className="text-xs text-earth-400 mt-1">{form.short_description.length}/500 tekens</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-earth-700 mb-1.5">Volledige beschrijving</label>
          <textarea
            value={form.description}
            onChange={set('description')}
            rows={5}
            placeholder="Beschrijf de kaas in detail: rijpingsduur, smaakprofiel, aanbevelingen…"
            className="input-field resize-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-earth-700 mb-1.5">
              Prijs (€) <span className="text-cheese-600">*</span>
            </label>
            <input
              type="number"
              value={form.price}
              onChange={set('price')}
              step="0.01"
              min="0"
              placeholder="8.50"
              required
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-earth-700 mb-1.5">Soort kaas</label>
            <select value={form.cheese_type} onChange={set('cheese_type')} className="input-field">
              <option value="">Selecteer type</option>
              {CHEESE_TYPES.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Images */}
      <div className="card p-6 space-y-4">
        <h2 className="font-serif text-xl text-earth-900">Afbeeldingen</h2>

        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
          {images.map((img, i) => (
            <div key={i} className="relative aspect-square rounded-xl overflow-hidden bg-cream-100 group">
              <Image src={img} alt={`Afbeelding ${i + 1}`} fill className="object-cover" />
              <button
                type="button"
                onClick={() => removeImage(i)}
                className="absolute top-1.5 right-1.5 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X size={12} />
              </button>
              {i === 0 && (
                <div className="absolute bottom-1.5 left-1.5 text-xs bg-earth-900/70 text-white px-1.5 py-0.5 rounded">
                  Hoofd
                </div>
              )}
            </div>
          ))}

          {/* Upload button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="aspect-square rounded-xl border-2 border-dashed border-earth-200 hover:border-cheese-400 flex flex-col items-center justify-center gap-1 text-earth-400 hover:text-cheese-600 transition-colors"
          >
            {uploading ? (
              <Loader2 size={20} className="animate-spin" />
            ) : (
              <>
                <Upload size={20} />
                <span className="text-xs">Upload</span>
              </>
            )}
          </button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleUpload}
        />
        <p className="text-xs text-earth-400">JPG, PNG of WebP · Max 5MB per afbeelding · Eerste afbeelding is de hoofdafbeelding</p>
      </div>

      {/* Weight options */}
      <div className="card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-xl text-earth-900">Gewicht/maat opties</h2>
          <button type="button" onClick={addWeightOption} className="btn-ghost text-sm">
            <Plus size={16} /> Optie toevoegen
          </button>
        </div>
        <p className="text-sm text-earth-500">Optioneel: voeg gewichtsopties toe zoals 250g, 500g, 1kg.</p>

        {weightOptions.length === 0 && (
          <p className="text-sm text-earth-400 italic">Geen opties — klanten bestellen het product zonder keuze.</p>
        )}

        <div className="space-y-2">
          {weightOptions.map((opt, i) => (
            <div key={i} className="flex items-center gap-3">
              <GripVertical size={16} className="text-earth-300 shrink-0" />
              <input
                type="text"
                value={opt.label}
                onChange={e => updateWeightOption(i, 'label', e.target.value)}
                placeholder="Label (bijv. 250g)"
                className="input-field text-sm py-2 flex-1"
              />
              <input
                type="number"
                value={opt.price || ''}
                onChange={e => updateWeightOption(i, 'price', e.target.value)}
                placeholder="Prijs (0 = standaard)"
                step="0.01"
                min="0"
                className="input-field text-sm py-2 w-36"
              />
              <button
                type="button"
                onClick={() => removeWeightOption(i)}
                className="p-1.5 text-earth-400 hover:text-red-500 transition-colors"
              >
                <X size={16} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Inventory & settings */}
      <div className="card p-6 space-y-5">
        <h2 className="font-serif text-xl text-earth-900">Voorraad &amp; instellingen</h2>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-earth-700 mb-1.5">Voorraad aantal</label>
            <input
              type="number"
              value={form.stock_quantity}
              onChange={set('stock_quantity')}
              min="0"
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-earth-700 mb-1.5">Volgorde (lager = eerder)</label>
            <input
              type="number"
              value={form.sort_order}
              onChange={set('sort_order')}
              min="0"
              className="input-field"
            />
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={form.in_stock}
              onChange={setCheck('in_stock')}
              className="w-4 h-4 rounded accent-cheese-600"
            />
            <span className="text-sm font-medium text-earth-700">Op voorraad (zichtbaar voor klanten)</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={form.featured}
              onChange={setCheck('featured')}
              className="w-4 h-4 rounded accent-cheese-600"
            />
            <span className="text-sm font-medium text-earth-700">Uitgelicht op homepage</span>
          </label>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex items-center gap-3 pb-8">
        <button type="submit" disabled={saving} className="btn-primary px-8">
          {saving ? <><Loader2 size={18} className="animate-spin" /> Opslaan…</> : isEdit ? 'Wijzigingen opslaan' : 'Product aanmaken'}
        </button>
        <button
          type="button"
          onClick={() => router.push('/admin/products')}
          className="btn-secondary"
        >
          Annuleren
        </button>
      </div>
    </form>
  )
}
