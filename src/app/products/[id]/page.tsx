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
 * 
 * In Next.js 15 with Turbopack and static export, this function must return 
 * an array of objects where the keys match the dynamic segment names exactly.
 */
export async function generateStaticParams() {
  return PRODUCTS.map((product) => ({
    id: product.id,
  }));
}

/**
 * The Product Page component. 
 * In Next.js 15, 'params' is a Promise that must be awaited before accessing its properties.
 */
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  
  return <ProductDetailsClient id={id} />;
}
