
"use client";

import { useRouter } from 'next/navigation';
import { ChevronLeft, Package, AlertTriangle, ArrowUpDown, Search, Plus, Loader2, TrendingDown, TrendingUp, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useFirestore, useCollection, useMemoFirebase, updateDocumentNonBlocking } from '@/firebase';
import { collection, query, orderBy, doc } from 'firebase/firestore';
import { Product } from '@/types';
import { useState, useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

export default function InventoryPage() {
  const router = useRouter();
  const db = useFirestore();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');

  const productsQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, 'products'), orderBy('name', 'asc'));
  }, [db]);

  const { data: products, isLoading } = useCollection<Product>(productsQuery);

  const filteredProducts = useMemo(() => {
    if (!products) return [];
    return products.filter(p => 
      p.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [products, searchTerm]);

  const stats = useMemo(() => {
    if (!products) return { total: 0, lowStock: 0, outOfStock: 0, popular: 0 };
    return {
      total: products.length,
      lowStock: products.filter(p => (p.currentStockQuantity || 0) <= (p.lowStockThreshold || 5) && (p.currentStockQuantity || 0) > 0).length,
      outOfStock: products.filter(p => (p.currentStockQuantity || 0) <= 0).length,
      popular: products.filter(p => p.isPopular).length
    };
  }, [products]);

  const togglePopularStatus = (productId: string, currentStatus: boolean) => {
    if (!db) return;
    const docRef = doc(db, 'products', productId);
    updateDocumentNonBlocking(docRef, { isPopular: !currentStatus });
    
    toast({
      title: !currentStatus ? "Marked as Popular" : "Removed from Popular",
      description: `Product will ${!currentStatus ? 'now' : 'no longer'} be featured in the Popular Now section.`,
    });
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur p-4 border-b">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ChevronLeft className="w-6 h-6" />
          </Button>
          <h1 className="text-xl font-black font-headline tracking-tight">Inventory Console</h1>
        </div>
      </header>

      <main className="p-4 space-y-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white p-4 rounded-3xl border shadow-sm space-y-1">
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Total Items</p>
            <p className="text-2xl font-black">{stats.total}</p>
          </div>
          <div className="bg-accent/10 p-4 rounded-3xl border border-accent/20 shadow-sm space-y-1">
            <p className="text-[10px] font-black text-accent uppercase tracking-wider">Popular Items</p>
            <p className="text-2xl font-black text-accent">{stats.popular}</p>
          </div>
          <div className="bg-orange-50 p-4 rounded-3xl border border-orange-100 shadow-sm space-y-1">
            <p className="text-[10px] font-black text-orange-600 uppercase tracking-wider">Low Stock</p>
            <p className="text-2xl font-black text-orange-600">{stats.lowStock}</p>
          </div>
          <div className="bg-red-50 p-4 rounded-3xl border border-red-100 shadow-sm space-y-1">
            <p className="text-[10px] font-black text-red-600 uppercase tracking-wider">Out of Stock</p>
            <p className="text-2xl font-black text-red-600">{stats.outOfStock}</p>
          </div>
        </div>

        {/* Search & Actions */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search harvest inventory..." 
              className="pl-9 h-12 rounded-2xl border-border/50 bg-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button className="h-12 w-12 rounded-2xl bg-primary shadow-lg shadow-primary/20">
            <Plus className="w-6 h-6" />
          </Button>
        </div>

        {/* Inventory List */}
        <div className="space-y-3">
          {isLoading ? (
            <div className="py-20 text-center space-y-4">
              <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto" />
              <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Auditing Stock...</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="py-20 text-center space-y-4 bg-white rounded-3xl border border-dashed">
              <Package className="w-12 h-12 text-muted-foreground/20 mx-auto" />
              <p className="text-sm text-muted-foreground font-bold">No products found</p>
            </div>
          ) : (
            filteredProducts.map((product) => {
              const stock = product.currentStockQuantity || 0;
              const threshold = product.lowStockThreshold || 5;
              const status = stock <= 0 ? 'out' : stock <= threshold ? 'low' : 'good';
              
              return (
                <div key={product.id} className="bg-white rounded-3xl p-3 border shadow-sm flex items-center space-x-4 relative">
                  <div className="relative w-16 h-16 rounded-2xl overflow-hidden bg-muted shrink-0">
                    <Image src={product.imageUrl} alt={product.name} fill className="object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h3 className="font-bold text-sm truncate">{product.name}</h3>
                      {product.isPopular && <TrendingUp className="w-3 h-3 text-accent" />}
                    </div>
                    <p className="text-[10px] text-muted-foreground font-medium uppercase">{product.categoryId}</p>
                    
                    <div className="flex items-center space-x-2 mt-1">
                      <span className={cn(
                        "text-xs font-black",
                        status === 'out' ? "text-red-600" : status === 'low' ? "text-orange-600" : "text-primary"
                      )}>
                        {stock} {product.unitOfMeasure}
                      </span>
                      {status !== 'good' && (
                        <Badge 
                          variant={status === 'out' ? 'destructive' : 'outline'} 
                          className={cn(
                            "text-[8px] font-black uppercase tracking-widest h-4",
                            status === 'low' && "border-orange-500 text-orange-600"
                          )}
                        >
                          {status === 'out' ? 'Sold Out' : 'Alert'}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end space-y-1">
                    <div className="flex gap-1">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className={cn(
                          "h-8 w-8 rounded-xl",
                          product.isPopular ? "bg-accent/10 text-accent" : "bg-muted/50 text-muted-foreground"
                        )}
                        onClick={() => togglePopularStatus(product.id, !!product.isPopular)}
                      >
                        <TrendingUp className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl bg-muted/50">
                        <TrendingDown className="w-4 h-4 text-primary" />
                      </Button>
                    </div>
                    <p className="text-[10px] font-black text-muted-foreground">₱{Number(product.pricePerUnit).toFixed(2)}</p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </main>
    </div>
  );
}
