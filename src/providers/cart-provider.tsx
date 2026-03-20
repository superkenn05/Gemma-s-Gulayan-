
"use client";

import React, { createContext, useState, useEffect, useMemo, ReactNode } from 'react';
import { Product, CartItem } from '@/types';
import { useUser } from '@/firebase';

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, delta: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
}

export const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const { user, isUserLoading } = useUser();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // Create an account-specific key for localStorage
  const cartKey = useMemo(() => {
    if (isUserLoading || !user) return null;
    return `gemmas_cart_${user.uid}`;
  }, [user, isUserLoading]);

  // Load the specific cart for the current authenticated user
  useEffect(() => {
    if (!cartKey) {
      setCart([]);
      setIsInitialized(true);
      return;
    }

    const savedCart = localStorage.getItem(cartKey);
    if (savedCart) {
      try {
        const parsed = JSON.parse(savedCart);
        if (Array.isArray(parsed)) {
          setCart(parsed);
        } else {
          setCart([]);
        }
      } catch (e) {
        console.error("Error parsing saved cart", e);
        setCart([]);
      }
    } else {
      setCart([]);
    }
    setIsInitialized(true);
  }, [cartKey]);

  // Persist cart changes to localStorage only if a user is logged in
  useEffect(() => {
    if (cartKey && isInitialized) {
      localStorage.setItem(cartKey, JSON.stringify(cart));
    }
  }, [cart, cartKey, isInitialized]);

  const addToCart = (product: Product, quantity: number = 1) => {
    if (!user) return;
    
    setCart((prevCart) => {
      const existingIndex = prevCart.findIndex(item => item.id === product.id);
      if (existingIndex > -1) {
        const newCart = [...prevCart];
        newCart[existingIndex] = {
          ...newCart[existingIndex],
          quantity: newCart[existingIndex].quantity + quantity
        };
        return newCart;
      } else {
        return [...prevCart, { ...product, quantity }];
      }
    });
  };

  const removeFromCart = (productId: string) => {
    setCart((prevCart) => prevCart.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart((prevCart) => {
      return prevCart.map(item => {
        if (item.id === productId) {
          const newQty = Math.max(1, item.quantity + delta);
          return { ...item, quantity: newQty };
        }
        return item;
      });
    });
  };

  const clearCart = () => {
    setCart([]);
  };

  const totalItems = useMemo(() => cart.reduce((sum, item) => sum + item.quantity, 0), [cart]);
  const totalPrice = useMemo(() => cart.reduce((sum, item) => sum + ((Number(item.pricePerUnit) || 0) * item.quantity), 0), [cart]);

  const value = {
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    totalItems,
    totalPrice
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}
