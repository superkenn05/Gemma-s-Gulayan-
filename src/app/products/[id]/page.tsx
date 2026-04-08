import { redirect } from 'next/navigation';

/**
 * This route satisfies the Next.js 15 static export requirement for dynamic segments.
 * All actual product details logic has been moved to /products/details?id=...
 */
export const dynamicParams = false;

/**
 * generateStaticParams is required for dynamic routes when using output: 'export'.
 * We provide a set of IDs from our mock data to satisfy the build process.
 */
export function generateStaticParams() {
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
  
  // Server-side redirect to the query-parameter based details page.
  // This allows the app to handle any ID (including new ones from Firestore)
  // because the destination page (/products/details) is a static route.
  redirect(`/products/details?id=${id}`);
}
