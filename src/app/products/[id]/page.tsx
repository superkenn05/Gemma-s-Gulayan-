import { ProductDetailsClient } from '@/components/products/product-details-client';
import { PRODUCTS } from '@/lib/mock-data';

/**
 * Next.js 15 Static Export Configuration
 * 
 * When using 'output: export', dynamic routes must be strictly defined at build time.
 * We use dynamicParams = false to prevent fallback rendering.
 */
export const dynamicParams = false;
export const dynamic = 'force-static';

/**
 * generateStaticParams maps all possible [id] values from our mock data
 * to static paths. The key 'id' matches the dynamic segment '[id]'.
 */
export async function generateStaticParams() {
  return PRODUCTS.map((product) => ({
    id: String(product.id),
  }));
}

/**
 * Product Details Page (Server Component)
 * In Next.js 15, 'params' is a Promise that must be awaited.
 */
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  const id = resolvedParams.id;
  
  return <ProductDetailsClient id={id} />;
}
