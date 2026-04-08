import { ProductDetailsClient } from '@/components/products/product-details-client';
import { PRODUCTS } from '@/lib/mock-data';

/**
 * Next.js 15 Static Export Configuration
 * 
 * When using 'output: export', all dynamic routes must be pre-rendered.
 * dynamicParams = false ensures that only paths returned by generateStaticParams are valid.
 */
export const dynamicParams = false;
export const dynamic = 'force-static';

/**
 * generateStaticParams provides the list of all IDs to be pre-rendered.
 * The key 'id' must match the folder name '[id]' exactly.
 */
export function generateStaticParams() {
  return PRODUCTS.map((product) => ({
    id: product.id.toString(),
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
  const { id } = await params;
  
  return <ProductDetailsClient id={id} />;
}
