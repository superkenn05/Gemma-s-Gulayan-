import { ProductDetailsClient } from '@/components/products/product-details-client';
import { PRODUCTS } from '@/lib/mock-data';

/**
 * Next.js 15 Static Export Configuration
 * 
 * When using 'output: export', all dynamic routes must be pre-rendered at build time.
 * dynamicParams = false ensures that Next.js only builds the paths defined in generateStaticParams.
 */
export const dynamicParams = false;
export const dynamic = 'force-static';

/**
 * generateStaticParams provides the list of all IDs to be pre-rendered.
 * The key 'id' must match the dynamic segment folder name '[id]' exactly.
 */
export async function generateStaticParams() {
  // Ensure we are returning the IDs from our mock data as strings
  return PRODUCTS.map((product) => ({
    id: String(product.id),
  }));
}

/**
 * Product Details Page (Server Component)
 * In Next.js 15, the 'params' prop is a Promise that must be awaited before accessing its properties.
 */
export default async function Page({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const resolvedParams = await params;
  const id = resolvedParams.id;
  
  return <ProductDetailsClient id={id} />;
}
