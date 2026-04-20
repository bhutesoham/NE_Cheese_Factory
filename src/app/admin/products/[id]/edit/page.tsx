import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { query } from "@/lib/db";
import { Product } from "@/types";
import ProductForm from "@/components/admin/ProductForm";

export const dynamic = "force-dynamic";

async function getProduct(id: string): Promise<Product | null> {
  const rows = await query(`SELECT * FROM products WHERE id = $1`, [id]);
  if (!rows[0]) return null;

  // Use 'any' here to bridge the gap between the database row and the Product type
  const p = rows[0] as any;

  return {
    ...p,
    price: parseFloat(p.price as string),
    images: Array.isArray(p.images) ? (p.images as string[]) : [],
    weight_options: Array.isArray(p.weight_options) ? p.weight_options : [],
  };
}

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditProductPage({ params }: Props) {
  // Next.js 15: Always await params
  const { id } = await params;
  const product = await getProduct(id);

  if (!product) notFound();

  return (
    <div>
      <Link
        href="/admin/products"
        className="inline-flex items-center gap-1 text-sm text-earth-500 hover:text-cheese-600 mb-6 transition-colors"
      >
        <ChevronLeft size={16} /> Terug naar producten
      </Link>
      <div className="mb-8">
        <h1 className="font-serif text-3xl text-earth-900">Bewerk product</h1>
        <p className="text-earth-500 mt-1">{product.name}</p>
      </div>
      <ProductForm product={product} isEdit />
    </div>
  );
}
