
import { ProductDetailsClient } from '@/components/products/product-details-client';
import { PRODUCTS } from '@/lib/mock-data';

// Enable static generation for product pages
export async function generateStaticParams() {
  return PRODUCTS.map((product) => ({
    id: product.id,
  }));
}

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ProductDetailsClient id={id} />;
}
