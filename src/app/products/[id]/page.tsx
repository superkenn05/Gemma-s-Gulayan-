
import { ProductDetailsClient } from '@/components/products/product-details-client';
import { PRODUCTS } from '@/lib/mock-data';

/**
 * For static exports (output: 'export'), all dynamic routes must be 
 * predefined at build time. dynamicParams = false ensures that only 
 * the IDs returned by generateStaticParams are valid routes.
 */
export const dynamicParams = false;

/**
 * generateStaticParams tells Next.js which paths to pre-render.
 * We use the IDs from our mock data to generate individual product pages.
 */
export function generateStaticParams() {
  return PRODUCTS.map((product) => ({
    id: product.id,
  }));
}

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  // In Next.js 15, params is a Promise that must be awaited.
  const { id } = await params;
  
  return <ProductDetailsClient id={id} />;
}
