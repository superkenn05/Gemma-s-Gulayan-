import { PRODUCTS } from '@/lib/mock-data';
import { redirect } from 'next/navigation';

/**
 * This route is kept only to prevent build errors with static export.
 * Navigation has been shifted to /products/details?id=... to support
 * dynamic Firestore IDs without pre-rendering overhead.
 */
export const dynamicParams = false;

export function generateStaticParams() {
  return PRODUCTS.map((product) => ({
    id: product.id.toString(),
  }));
}

export default async function Page(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const id = params.id;
  
  // Redirect to the new query-parameter based details page
  redirect(`/products/details?id=${id}`);
}
