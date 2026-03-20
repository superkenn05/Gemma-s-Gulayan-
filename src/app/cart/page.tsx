
"use client";

import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { ChevronLeft, Trash2, Minus, Plus, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/hooks/use-cart';
import { BottomNav } from '@/components/layout/bottom-nav';

export default function CartPage() {
  const router = useRouter();
  const { cart, updateQuantity, removeFromCart, totalPrice, totalItems } = useCart();

  return (
    <div className="min-h-screen bg-background pb-48 md:pb-32">
      {/* Top Bar */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur p-4 flex items-center justify-between border-b border-border">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ChevronLeft className="w-6 h-6" />
          </Button>
          <h1 className="text-xl font-black font-headline text-foreground">My Cart</h1>
        </div>
        <span className="text-sm font-bold text-white bg-primary px-3 py-1 rounded-full shadow-sm shadow-primary/20 animate-in zoom-in duration-300">
          {totalItems} Items
        </span>
      </div>

      <main className="p-4 space-y-4">
        {cart.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
            <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center">
              <ShoppingBag className="w-12 h-12 text-muted-foreground" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Your cart is empty</h2>
              <p className="text-muted-foreground text-sm">Looks like you haven't added anything yet.</p>
            </div>
            <Button onClick={() => router.push('/')} className="rounded-xl px-8 h-12">Start Shopping</Button>
          </div>
        ) : (
          <>
            <div className="space-y-3">
              {cart.map((item) => {
                const itemPrice = Number(item.pricePerUnit) || 0;
                return (
                  <div key={item.id} className="bg-white rounded-2xl p-3 flex items-center space-x-4 shadow-sm border border-border/50">
                    <div className="relative w-20 h-20 bg-[#F8FBF8] rounded-xl overflow-hidden shrink-0">
                      <Image 
                        src={item.imageUrl} 
                        alt={item.name || 'Item'} 
                        fill 
                        className="object-cover" 
                        data-ai-hint="fresh food"
                      />
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-bold text-base leading-tight">{item.name || 'Unnamed Product'}</h3>
                          <p className="text-xs text-muted-foreground font-medium">₱{itemPrice.toFixed(2)} / {item.unitOfMeasure || 'unit'}</p>
                        </div>
                        <Button 
                          type="button"
                          variant="ghost" 
                          size="icon" 
                          className="text-destructive h-8 w-8 hover:bg-destructive/10"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            removeFromCart(item.id);
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="flex items-center justify-between pt-1">
                        <p className="font-black text-primary text-lg">₱{(itemPrice * item.quantity).toFixed(2)}</p>
                        <div className="flex items-center bg-muted/80 rounded-xl p-1 border border-border/50">
                          <Button 
                            type="button"
                            variant="secondary" 
                            size="icon" 
                            className="h-7 w-7 rounded-lg bg-white shadow-sm hover:bg-gray-50 active:scale-90 transition-all"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              updateQuantity(item.id, -1);
                            }}
                            disabled={item.quantity <= 1}
                          >
                            <Minus className="w-3.5 h-3.5 text-primary" />
                          </Button>
                          <span className="w-8 text-center text-sm font-black text-foreground">{item.quantity}</span>
                          <Button 
                            type="button"
                            variant="secondary" 
                            size="icon" 
                            className="h-7 w-7 rounded-lg bg-white shadow-sm hover:bg-gray-50 active:scale-90 transition-all"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              updateQuantity(item.id, 1);
                            }}
                          >
                            <Plus className="w-3.5 h-3.5 text-primary" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Price Summary */}
            <div className="bg-white rounded-3xl p-6 mt-6 space-y-4 shadow-sm border border-border/50">
              <h3 className="font-black font-headline text-lg text-foreground">Order Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground font-medium">Subtotal</span>
                  <span className="font-bold">₱{totalPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground font-medium">Delivery Fee</span>
                  <span className="font-bold text-primary">FREE</span>
                </div>
                <div className="pt-3 border-t border-dashed border-border flex justify-between items-center">
                  <span className="text-base font-bold">Total Amount</span>
                  <span className="text-2xl font-black text-primary">₱{totalPrice.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </>
        )}
      </main>

      {/* Fixed Checkout Bar */}
      {cart.length > 0 && (
        <div className="fixed bottom-[72px] md:bottom-0 left-0 right-0 p-6 bg-white/95 backdrop-blur-md border-t border-border z-40 shadow-[0_-4px_20px_-5px_rgba(0,0,0,0.1)]">
          <Button 
            className="w-full h-14 rounded-2xl text-lg font-bold shadow-lg shadow-primary/20 hover:scale-[1.01] transition-transform active:scale-95"
            onClick={() => router.push('/checkout')}
          >
            Checkout (₱{totalPrice.toFixed(2)})
          </Button>
        </div>
      )}

      <BottomNav />
    </div>
  );
}
