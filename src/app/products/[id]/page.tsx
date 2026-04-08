import { redirect } from 'next/navigation';

/**
 * Next.js 15 Static Export Configuration for Dynamic Redirector
 * 
 * In 'output: export' mode, dynamic segments [id] must be pre-defined.
 * We provide the IDs from our mock data as strings to satisfy the build engine.
 */
export const dynamic = 'force-static';
export const dynamicParams = false;

export async function generateStaticParams() {
  // These IDs must match the 'id' field in src/lib/mock-data.ts exactly as strings.
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

/**
 * Redirector Page
 * Standardized for Next.js 15: params is a Promise that must be awaited.
 */
export default async function ProductRedirectPage(props: PageProps) {
  const params = await props.params;
  const id = params.id;
  
  // Clean redirect to the query-parameter based details page
  redirect(`/products/details?id=${id}`);
}
