
"use client";

import { useRouter } from 'next/navigation';
import { ChevronLeft, Heart, ShoppingCart, Trash2, Star, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePriorityList } from '@/hooks/use-wishlist';
import Image from 'next/image';
import { useCart } from '@/hooks/use-cart';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import { Product } from '@/types';

export default function PriorityListPage() {
  const router = useRouter();
  const db = useFirestore();
  const { priorityItems, isLoading: isPriorityLoading, togglePriority } = usePriorityList();
  const { addToCart } = useCart();

  // Fetch all products to match with wishlist IDs
  const productsQuery = useMemoFirebase(() => {
    if (!db) return null;
    return collection(db, 'products');
  }, [db]);

  const { data: allProducts, isLoading: isProductsLoading } = useCollection<Product>(productsQuery);

  const isLoading = isPriorityLoading || isProductsLoading;

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur p-4 flex items-center space-x-4 border-b">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ChevronLeft className="w-6 h-6" />
        </Button>
        <h1 className="text-xl font-black font-headline tracking-tight">My Priority List</h1>
      </header>

      <main className="p-4">
        {isLoading ? (
          <div className="py-20 text-center space-y-4">
            <Loader2 className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-muted-foreground font-medium">Loading your list...</p>
          </div>
        ) : !priorityItems || priorityItems.length === 0 ? (
          <div className="py-20 text-center space-y-6">
            <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto">
              <Star className="w-10 h-10 text-muted-foreground" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Priority List is empty</h2>
              <p className="text-muted-foreground text-sm max-w-[200px] mx-auto">Save items you need most to see them here first!</p>
            </div>
            <Button onClick={() => router.push('/products')} className="rounded-xl px-8 h-12">Browse Harvest</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {priorityItems.map((item) => {
              const product = allProducts?.find(p => p.id === item.productId);
              if (!product) return null;
              return (
                <div key={item.id} className="bg-white rounded-2xl p-3 flex items-center space-x-4 shadow-sm border border-border/50">
                  <div className="relative w-20 h-20 bg-[#F8FBF8] rounded-xl overflow-hidden shrink-0">
                    <Image src={product.imageUrl} alt={product.name} fill className="object-contain p-2" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex justify-between items-start">
                      <h3 className="font-bold text-base leading-tight">{product.name}</h3>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-destructive hover:bg-destructive/10"
                        onClick={() => togglePriority(product.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground font-medium">₱{(Number(product.pricePerUnit) || 0).toFixed(2)} / {product.unitOfMeasure}</p>
                    <div className="flex items-center justify-between pt-1">
                      <p className="font-black text-primary text-lg">₱{(Number(product.pricePerUnit) || 0).toFixed(2)}</p>
                      <Button 
                        size="sm" 
                        className="h-9 rounded-xl text-xs font-bold shadow-sm"
                        onClick={() => addToCart(product)}
                      >
                        <ShoppingCart className="w-3.5 h-3.5 mr-1.5" />
                        Add to Cart
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
