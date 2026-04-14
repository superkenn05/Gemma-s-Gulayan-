import { redirect } from 'next/navigation';
import { ROUTES, STATIC_PRODUCT_IDS } from '@/lib/static-paths';

/**
 * Next.js 15 Static Export Configuration
 * 
 * In 'output: export' mode, dynamic segments [id] MUST have generateStaticParams.
 * This file serves as a catch-all redirector for any legacy [id] style links.
 */
export const dynamic = 'force-static';
export const dynamicParams = false;

export async function generateStaticParams() {
  // We explicitly map the IDs to satisfy the required param structure for static export
  return STATIC_PRODUCT_IDS.map((id) => ({
    id: id.toString(),
  }));
}

interface PageProps {
  params: Promise<{ id: string }>;
}

/**
 * Redirector Page
 * 
 * It redirects dynamic segment URLs to the stable query-parameter based details page.
 * This pattern is preferred for Firebase apps on static hosts.
 */
export default async function Page({ params }: PageProps) {
  const { id } = await params;
  
  // Permanent redirect to the query-param based route
  redirect(ROUTES.productDetails(id));
}
