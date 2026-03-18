import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import ProductForm from '@/components/admin/ProductForm'

export default function NewProductPage() {
  return (
    <div>
      <Link href="/admin/products" className="inline-flex items-center gap-1 text-sm text-earth-500 hover:text-cheese-600 mb-6 transition-colors pt-14 md:pt-0 block">
        <ChevronLeft size={16} /> Back to products
      </Link>
      <div className="mb-8">
        <h1 className="font-serif text-3xl text-earth-900">New product</h1>
        <p className="text-earth-500 mt-1">Add a new cheese to your range.</p>
      </div>
      <ProductForm />
    </div>
  )
}
