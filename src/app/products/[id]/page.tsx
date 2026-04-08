import { ProductDetailsClient } from '@/components/products/product-details-client';
import { PRODUCTS } from '@/lib/mock-data';

/**
 * When using 'output: export', all dynamic routes must be strictly predefined.
 * dynamicParams = false ensures that any ID not in our mock data returns a 404
 * rather than attempting dynamic server-side rendering, which is unsupported in static exports.
 */
export const dynamicParams = false;
export const dynamic = 'force-static';

/**
 * generateStaticParams maps our product IDs to the [id] dynamic segment.
 * In Next.js 15 with static export, this function must return an array of objects
 * where each object contains the parameters for the dynamic segments.
 */
export async function generateStaticParams() {
  return PRODUCTS.map((product) => ({
    id: String(product.id),
  }));
}

export default async function ProductPage(props: {
  params: Promise<{ id: string }>;
}) {
  /**
   * In Next.js 15, params is a Promise that must be awaited in Server Components.
   * This ensures the component remains compatible with the latest rendering patterns.
   */
  const resolvedParams = await props.params;
  const id = resolvedParams.id;
  
  return <ProductDetailsClient id={id} />;
}
