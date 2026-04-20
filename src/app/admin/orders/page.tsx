import { notFound } from "next/navigation";
import { query } from "@/lib/db";
import { Product } from "@/types";
import { Metadata } from "next";
import ProductDetailClient from "@/components/shop/ProductDetailClient";

export const dynamic = "force-dynamic";

async function getProduct(slug: string): Promise<Product | null> {
  const rows = await query<Product>(`SELECT * FROM products WHERE slug = $1`, [
    slug,
  ]);
  if (!rows[0]) return null;
  const p = rows[0];
  return {
    ...p,
    price: parseFloat(p.price as unknown as string),
    images: Array.isArray(p.images) ? p.images : [],
    weight_options: Array.isArray(p.weight_options) ? p.weight_options : [],
  };
}

async function getRelated(product: Product): Promise<Product[]> {
  const rows = await query<Product>(
    `SELECT * FROM products WHERE cheese_type = $1 AND id != $2 AND in_stock = true LIMIT 3`,
    [product.cheese_type, product.id],
  );
  return rows.map((p) => ({
    ...p,
    price: parseFloat(p.price as unknown as string),
    images: Array.isArray(p.images) ? p.images : [],
    weight_options: Array.isArray(p.weight_options) ? p.weight_options : [],
  }));
}

interface Props {
  params: Promise<{ slug: string }>; // ← Promise now
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params; // ← await it
  const product = await getProduct(slug);
  if (!product) return { title: "Product niet gevonden" };
  return {
    title: product.name,
    description: product.short_description || product.description || undefined,
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params; // ← await it
  const product = await getProduct(slug);
  if (!product) notFound();

  const related = await getRelated(product);

  return <ProductDetailClient product={product} related={related} />;
}
