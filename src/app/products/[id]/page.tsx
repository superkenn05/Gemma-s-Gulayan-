import { ProductDetailsClient } from '@/components/products/product-details-client';
import { PRODUCTS } from '@/lib/mock-data';

/**
 * Static Export Configuration for Next.js 15
 * 
 * In a static export (output: 'export'), all dynamic routes must be 
 * strictly defined at build time. We use dynamicParams = false to 
 * ensure any unknown ID results in a 404, and 'force-static' to 
 * guarantee the page is pre-rendered.
 */
export const dynamicParams = false;
export const dynamic = 'force-static';

/**
 * generateStaticParams provides the list of all valid IDs to the build engine.
 * The key 'id' must match the folder name [id] exactly.
 */
export async function generateStaticParams() {
  return PRODUCTS.map((product) => ({
    id: product.id,
  }));
}

/**
 * The Product Page component.
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
