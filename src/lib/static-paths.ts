/**
 * Centralized static path configurations for build-time generation.
 * This satisfies Next.js 15 'output: export' requirements.
 */

// Centralized list of initial harvest IDs for pre-rendering
export const STATIC_PRODUCT_IDS = ['1', '2', '3', '4', '5'];

export const ROUTES = {
  home: '/',
  products: '/products',
  /**
   * Preferred route for static exports.
   * Using query parameters (?id=...) allows the app to fetch ANY product ID 
   * from Firestore without requiring a rebuild or generateStaticParams for new items.
   */
  productDetails: (id: string) => `/products/details?id=${id}`,
  cart: '/cart',
  profile: '/profile',
  orders: '/profile/orders',
  wishlist: '/profile/wishlist',
  addresses: '/profile/addresses',
  notifications: '/notifications',
  inventory: '/admin/inventory',
};
