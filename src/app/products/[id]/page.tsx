import { ProductDetailsClient } from '@/components/products/product-details-client';
import { PRODUCTS } from '@/lib/mock-data';

/**
 * Next.js 15 Static Export Configuration
 * 
 * When using 'output: export', dynamic routes must be strictly defined at build time.
 * We use dynamicParams = false to prevent fallback rendering, and force-static
 * to ensure the page is included in the static build.
 */
export const dynamicParams = false;
export const dynamic = 'force-static';
export const revalidate = false;

/**
 * generateStaticParams maps all possible [id] values from our mock data
 * to static paths. The key must match the dynamic segment name exactly.
 */
export async function generateStaticParams() {
  return PRODUCTS.map((product) => ({
    id: product.id.toString(),
  }));
}

/**
 * Product Details Page (Server Component)
 * In Next.js 15, 'params' is a Promise that must be awaited.
 */
export default async function Page(props: {
  params: Promise<{ id: string }>;
}) {
  const params = await props.params;
  const id = params.id;
  
  return <ProductDetailsClient id={id} />;
}
