"use client";

import Image from 'next/image';
import Link from 'next/link';
import { Star, Plus, ShoppingBag, Heart, Check, AlertCircle } from 'lucide-react';
import { Product } from '@/types';
import { Button } from '@/components/ui/button';
import { useCart } from '@/hooks/use-cart';
import { usePriorityList } from '@/hooks/use-wishlist';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  const { togglePriority, isInPriorityList } = usePriorityList();
  const [isAdded, setIsAdded] = useState(false);

  const isPriority = isInPriorityList(product.id);
  const isOutOfStock = (product.currentStockQuantity || 0) <= 0;
  const isLowStock = !isOutOfStock && (product.currentStockQuantity || 0) <= (product.lowStockThreshold || 5);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock) return;
    
    addToCart(product);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1500);
  };

  const safePrice = Number(product.pricePerUnit) || 0;
  const displayPrice = safePrice.toFixed(2);
  
  // Use query parameters for details to support static export (output: 'export')
  // This bypasses the need for generateStaticParams to know every Firestore ID at build time.
  const detailsUrl = `/products/details?id=${product.id}`;

  return (
    <div className={cn(
      "bg-white rounded-3xl p-3 shadow-md shadow-black/5 flex flex-col space-y-3 relative group h-full border border-transparent transition-all",
      isOutOfStock ? "opacity-75 grayscale-[0.5]" : "hover:border-primary/20"
    )}>
      <Link href={detailsUrl} className="block relative aspect-square w-full overflow-hidden rounded-2xl bg-[#F8FBF8]">
        {product.imageUrl ? (
          <Image 
            src={product.imageUrl} 
            alt={product.name || 'Product'}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
            data-ai-hint="fresh produce"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ShoppingBag className="w-8 h-8 text-muted-foreground/30" />
          </div>
        )}
        
        <div className="absolute inset-0 z-20 pointer-events-none p-2 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div className="flex flex-col gap-1">
              <div className="bg-white/90 backdrop-blur px-2 py-0.5 rounded-full flex items-center space-x-1 shadow-sm w-fit">
                <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                <span className="text-[10px] font-black">{product.rating || 0}</span>
              </div>
            </div>
            
            <button 
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                togglePriority(product.id);
              }}
              className={cn(
                "p-1.5 rounded-full transition-all active:scale-90 shadow-sm pointer-events-auto",
                isPriority ? "bg-red-50 text-red-500" : "bg-white/90 backdrop-blur text-muted-foreground hover:text-red-500"
              )}
            >
              <Heart className={cn("w-3.5 h-3.5", isPriority && "fill-current")} />
            </button>
          </div>

          <div className="flex flex-col gap-1 items-start">
            {isOutOfStock ? (
              <Badge variant="destructive" className="font-black px-3 py-1 text-[10px] uppercase tracking-widest shadow-lg">Out of Stock</Badge>
            ) : isLowStock && (
              <Badge className="bg-orange-500 hover:bg-orange-600 text-white border-none font-bold text-[8px] px-2 py-0.5">Low Stock</Badge>
            )}
          </div>
        </div>
      </Link>
      
      <div className="flex flex-col flex-1 px-1">
        <Link href={detailsUrl}>
          <h3 className="text-sm font-black text-foreground line-clamp-1 leading-tight mb-0.5">{product.name || 'Unnamed Product'}</h3>
        </Link>
        <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-tight mb-2">Per {product.unitOfMeasure || 'unit'}</p>
        
        <div className="mt-auto flex items-center justify-between gap-2">
          <p className="text-base font-black text-primary">₱{displayPrice}</p>
          <Button 
            type="button"
            size="icon" 
            disabled={isOutOfStock}
            className={cn(
              "w-9 h-9 rounded-xl shadow-lg shadow-primary/10 transition-all duration-300",
              isAdded 
                ? "bg-green-500 text-white scale-110 rotate-[360deg]" 
                : isOutOfStock 
                  ? "bg-muted text-muted-foreground cursor-not-allowed"
                  : "bg-primary hover:bg-primary/90 text-primary-foreground"
            )}
            onClick={handleAddToCart}
          >
            {isAdded ? (
              <Check className="w-5 h-5 animate-in zoom-in duration-300" />
            ) : isOutOfStock ? (
              <AlertCircle className="w-5 h-5" />
            ) : (
              <Plus className="w-5 h-5" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
