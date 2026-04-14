import { redirect } from 'next/navigation';
import { ROUTES, STATIC_PRODUCT_IDS } from '@/lib/static-paths';

/**
 * Next.js 15 Static Export Configuration
 * 
 * In 'output: export' mode, dynamic segments [id] MUST have generateStaticParams.
 * We set dynamicParams to false to ensure the build only attempts to generate 
 * the IDs we specify here.
 */
export const dynamic = 'force-static';
export const dynamicParams = false;

export async function generateStaticParams() {
  // We return the specific IDs from our centralized static-paths file
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
 * Satisfies the requirement for a page at /products/[id] while immediately 
 * redirecting to the stable query-parameter based details page.
 */
export default async function Page({ params }: PageProps) {
  const { id } = await params;
  
  // Permanent redirect to the query-param based route which handles dynamic fetching
  redirect(ROUTES.productDetails(id));
}
