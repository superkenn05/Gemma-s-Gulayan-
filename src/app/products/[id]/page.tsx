import { ProductDetailsClient } from '@/components/products/product-details-client';
import { PRODUCTS } from '@/lib/mock-data';

/**
 * For static exports (output: 'export'), all dynamic routes must be 
 * predefined at build time. 
 */
export const dynamicParams = false;
export const dynamic = 'force-static';

/**
 * generateStaticParams tells Next.js which paths to pre-render.
 * We use the IDs from our mock data to generate individual product pages.
 */
export async function generateStaticParams() {
  return PRODUCTS.map((product) => ({
    id: String(product.id),
  }));
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ProductPage({ params }: PageProps) {
  // In Next.js 15, params is a Promise that must be awaited.
  const resolvedParams = await params;
  const { id } = resolvedParams;
  
  return <ProductDetailsClient id={id} />;
}
