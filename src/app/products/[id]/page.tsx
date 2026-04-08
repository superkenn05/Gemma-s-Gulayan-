import { redirect } from 'next/navigation';

/**
 * This route satisfies the Next.js 15 static export requirement for dynamic segments.
 * All actual product details logic has been moved to /products/details?id=...
 */
export const dynamicParams = false;

export function generateStaticParams() {
  // We provide the default mock IDs as strings to satisfy the "output: export" requirement.
  // The keys in these objects MUST match the dynamic segment name [id].
  return [
    { id: '1' },
    { id: '2' },
    { id: '3' },
    { id: '4' },
    { id: '5' }
  ];
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ProductRedirectPage({ params }: PageProps) {
  // In Next.js 15, dynamic route parameters are now Promises and must be awaited.
  const resolvedParams = await params;
  const id = resolvedParams.id;
  
  // Client-side redirect to the query-parameter based details page.
  // This allows the app to handle dynamic IDs from Firestore without needing
  // to know them all at build time.
  redirect(`/products/details?id=${id}`);
}
