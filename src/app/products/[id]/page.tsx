import { redirect } from 'next/navigation';
import { STATIC_PRODUCT_IDS, ROUTES } from '@/lib/static-paths';

/**
 * Next.js 15 Static Export Configuration
 * 
 * In 'output: export' mode, dynamic segments [id] MUST have generateStaticParams.
 * We provide the IDs from our mock data to satisfy the build system.
 */
export const dynamic = 'force-static';
export const dynamicParams = false;

export async function generateStaticParams() {
  return STATIC_PRODUCT_IDS.map((id) => ({
    id: id,
  }));
}

interface PageProps {
  params: Promise<{ id: string }>;
}

/**
 * Redirector Page
 * Redirects legacy dynamic segments to the stable query-parameter based details page.
 */
export default async function ProductRedirectPage(props: PageProps) {
  const params = await props.params;
  const id = params.id;
  
  redirect(ROUTES.productDetails(id));
}
