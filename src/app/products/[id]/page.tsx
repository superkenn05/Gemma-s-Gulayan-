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
 * Next.js uses this at build time to pre-render all static paths.
 */
export function generateStaticParams() {
  // We return an array of objects where the key 'id' matches the [id] segment
  return PRODUCTS.map((product) => ({
    id: String(product.id),
  }));
}

/**
 * The Product Page component. 
 * In Next.js 15, 'params' is a Promise that must be awaited before accessing its properties.
 */
export default async function Page(props: {
  params: Promise<{ id: string }>;
}) {
  const params = await props.params;
  const id = params.id;
  
  return <ProductDetailsClient id={id} />;
}
