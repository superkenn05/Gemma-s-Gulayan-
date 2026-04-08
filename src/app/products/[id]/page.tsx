
import { PRODUCTS } from '@/lib/mock-data';
import { redirect } from 'next/navigation';

/**
 * This route is kept only to satisfy the build process.
 * All actual navigation has been moved to /products/details?id=...
 * which supports dynamic Firestore IDs in a static export.
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
  
  // Redirect to the query-parameter based details page
  redirect(`/products/details?id=${id}`);
}
