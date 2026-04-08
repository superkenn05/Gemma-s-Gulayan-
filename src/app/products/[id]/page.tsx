
import { redirect } from 'next/navigation';

/**
 * This route satisfies the Next.js 15 static export requirement for dynamic segments.
 * All actual product details logic has been moved to /products/details?id=...
 */
export const dynamicParams = false;

export function generateStaticParams() {
  // We provide the default mock IDs to satisfy the "output: export" requirement.
  // This allows the build to pass even if the project contains this dynamic folder.
  return [
    { id: '1' },
    { id: '2' },
    { id: '3' },
    { id: '4' },
    { id: '5' }
  ];
}

export default async function ProductRedirectPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  
  // Client-side redirect to the query-parameter based details page
  redirect(`/products/details?id=${id}`);
}
