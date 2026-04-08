import { ProductDetailsClient } from '@/components/products/product-details-client';
import { PRODUCTS } from '@/lib/mock-data';

/**
 * When using 'output: export', all dynamic routes must be strictly predefined.
 * dynamicParams = false ensures that any ID not in our mock data returns a 404
 * rather than attempting dynamic server-side rendering, which is unsupported in static exports.
 */
export const dynamicParams = false;

/**
 * generateStaticParams maps our product IDs to the [id] dynamic segment.
 * Each object in the returned array must contain a key matching the segment name.
 */
export function generateStaticParams() {
  return PRODUCTS.map((product) => ({
    id: String(product.id),
  }));
}

export default async function ProductPage(props: {
  params: Promise<{ id: string }>;
}) {
  // In Next.js 15, params is a Promise that must be awaited in Server Components.
  const { id } = await props.params;
  
  return <ProductDetailsClient id={id} />;
}
