/**
 * Centralized static path configurations for build-time generation.
 * This satisfies Next.js 15 'output: export' requirements.
 */

// IDs of products that exist in our initial database/mock data
export const STATIC_PRODUCT_IDS = ['1', '2', '3', '4', '5'];

export const ROUTES = {
  home: '/',
  products: '/products',
  // Preferred route for static exports to avoid dynamic segment issues with non-pre-rendered Firestore IDs
  productDetails: (id: string) => `/products/details?id=${id}`,
  cart: '/cart',
  profile: '/profile',
  orders: '/profile/orders',
  wishlist: '/profile/wishlist',
  addresses: '/profile/addresses',
  notifications: '/notifications',
  inventory: '/admin/inventory',
};
