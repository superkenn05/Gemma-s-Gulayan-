import { redirect } from 'next/navigation';
import { STATIC_PRODUCT_IDS, ROUTES } from '@/lib/static-paths';

/**
 * Next.js 15 Static Export Configuration
 * 
 * In 'output: export' mode, dynamic segments [id] MUST have generateStaticParams.
 * We provide the IDs from our mock data to satisfy the build system.
 * dynamicParams = false ensures only the IDs returned by generateStaticParams are valid at build time.
 */
export const dynamic = 'force-static';
export const dynamicParams = false;

export async function generateStaticParams() {
  // Return an array of objects where each object contains the dynamic parameter 'id'
  return STATIC_PRODUCT_IDS.map((id) => ({
    id: id.toString(),
  }));
}

interface PageProps {
  params: Promise<{ id: string }>;
}

/**
 * Redirector Page
 * Redirects legacy dynamic segments to the stable query-parameter based details page.
 * This satisfies the build requirement while keeping the app flexible for new Firestore products.
 */
export default async function ProductRedirectPage(props: PageProps) {
  const params = await props.params;
  const id = params.id;
  
  // Permanent redirect to the query-param based route
  redirect(ROUTES.productDetails(id));
}
