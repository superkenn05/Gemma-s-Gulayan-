import { redirect } from 'next/navigation';
import { ROUTES, STATIC_PRODUCT_IDS } from '@/lib/static-paths';

/**
 * Next.js 15 Static Export Configuration
 * 
 * In 'output: export' mode, dynamic segments [id] MUST have generateStaticParams.
 * We provide explicit IDs to satisfy the build system's validation.
 */
export const dynamic = 'force-static';
export const dynamicParams = false;

export async function generateStaticParams() {
  // We explicitly map the IDs to satisfy the required param structure
  return STATIC_PRODUCT_IDS.map((id) => ({
    id: id,
  }));
}

interface PageProps {
  params: Promise<{ id: string }>;
}

/**
 * Redirector Page
 * 
 * This page exists to handle legacy [id] links and satisfy the folder structure.
 * It redirects everything to the stable query-parameter based details page.
 */
export default async function Page({ params }: PageProps) {
  const { id } = await params;
  
  // Permanent redirect to the query-param based route
  redirect(ROUTES.productDetails(id));
}
