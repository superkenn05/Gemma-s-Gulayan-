export interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  profileImageUrl?: string;
  defaultPaymentMethodId?: string;
  role?: 'Admin' | 'Superadmin' | 'Customer';
}

export interface Product {
  id: string;
  name: string;
  pricePerUnit: number;
  unitOfMeasure: string;
  rating?: number;
  reviews?: number;
  imageUrl: string;
  categoryId: string;
  description: string;
  nutritionalValues?: {
    calories: string;
    protein: string;
    carbs: string;
    fat: string;
  };
  currentStockQuantity: number;
  lowStockThreshold: number;
  isPopular?: boolean;
  createdAt?: any;
  updatedAt?: any;
}

export interface Review {
  id: string;
  userId: string;
  productId: string;
  userName: string;
  userPhotoUrl?: string;
  rating: number;
  comment: string;
  createdAt: any;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  description?: string;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface UserAddress {
  id: string;
  userId: string;
  label: string;
  fullAddress: string;
  isDefault?: boolean;
}

export interface OrderItem {
  productId: string;
  name: string;
  quantity: number;
  pricePerUnit: number;
}

export interface Order {
  id: string;
  userId: string;
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered';
  createdAt: any;
  items: OrderItem[];
  address?: string;
}

export interface WishlistItem {
  id: string;
  productId: string;
  addedAt: any;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'alert';
  isRead: boolean;
  createdAt: any;
}

export interface StockTransaction {
  id: string;
  productId: string;
  amount: number;
  type: 'in' | 'out' | 'adjustment';
  reason: string;
  createdAt: any;
  performedBy: string;
}
