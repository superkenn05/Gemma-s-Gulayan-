import { redirect } from 'next/navigation';
import { PRODUCTS } from '@/lib/mock-data';

/**
 * Next.js 15 Static Export Configuration
 * 
 * In a static export (output: 'export'), dynamic segments like [id] 
 * must be explicitly defined at build time. We provide the mock product IDs 
 * to satisfy the build engine, then redirect users to the more flexible 
 * query-parameter based details page.
 */
export const dynamic = 'force-static';
export const dynamicParams = false;

/**
 * Returns the list of product IDs to be pre-rendered.
 * This satisfies the 'missing param' error during build/dev.
 */
export function generateStaticParams() {
  return PRODUCTS.map((product) => ({
    id: product.id,
  }));
}

interface PageProps {
  params: Promise<{ id: string }>;
}

/**
 * Redirector Page
 * Handles legacy or direct links to /products/[id] by sending them
 * to the query-param based details page.
 */
export default async function ProductRedirectPage({ params }: PageProps) {
  const resolvedParams = await params;
  const id = resolvedParams.id;
  
  // Use a relative redirect to the query-parameter based details page
  redirect(`/products/details?id=${id}`);
}
