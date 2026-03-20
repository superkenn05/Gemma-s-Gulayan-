
"use client";

import { useSearchParams } from 'next/navigation';
import { Header } from '@/components/layout/header';
import { BottomNav } from '@/components/layout/bottom-nav';
import { ProductCard } from '@/components/products/product-card';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { usePriorityList } from '@/hooks/use-wishlist';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import { Product, Category } from '@/types';
import { Loader2, ShoppingBag } from 'lucide-react';

export default function ProductsPage() {
  const searchParams = useSearchParams();
  const activeCategory = searchParams.get('category') || 'all';
  const queryParam = searchParams.get('q') || '';
  const { isInPriorityList } = usePriorityList();
  const db = useFirestore();

  // Fetch categories for the filter bar
  const categoriesQuery = useMemoFirebase(() => {
    if (!db) return null;
    return collection(db, 'categories');
  }, [db]);
  const { data: categories } = useCollection<Category>(categoriesQuery);

  // Fetch products based on category
  const productsQuery = useMemoFirebase(() => {
    if (!db) return null;
    if (activeCategory === 'all') return collection(db, 'products');
    return query(collection(db, 'products'), where('categoryId', '==', activeCategory));
  }, [db, activeCategory]);

  const { data: products, isLoading } = useCollection<Product>(productsQuery);

  // Client-side filtering for search query and sorting
  let filteredProducts = products || [];

  if (queryParam) {
    const searchLower = queryParam.toLowerCase();
    filteredProducts = filteredProducts.filter(p => 
      p.name.toLowerCase().includes(searchLower) || 
      p.description.toLowerCase().includes(searchLower)
    );
  }

  // Sort: Priority items first
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    const aIsPriority = isInPriorityList(a.id);
    const bIsPriority = isInPriorityList(b.id);
    
    if (aIsPriority && !bIsPriority) return -1;
    if (!aIsPriority && bIsPriority) return 1;
    return 0;
  });

  return (
    <div className="min-h-screen pb-20 bg-background">
      <Header />
      
      <main className="p-4 space-y-6">
        {/* Category Filter Horizontal Scroll */}
        <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-hide">
          <Link
            href={queryParam ? `/products?q=${encodeURIComponent(queryParam)}` : "/products"}
            className={cn(
              "px-6 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-colors",
              activeCategory === 'all' ? "bg-primary text-white" : "bg-white text-muted-foreground border border-border/50 shadow-sm"
            )}
          >
            All Items
          </Link>
          {categories?.map(cat => (
            <Link
              key={cat.id}
              href={`/products?category=${cat.id}${queryParam ? `&q=${encodeURIComponent(queryParam)}` : ''}`}
              className={cn(
                "px-6 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-colors",
                activeCategory === cat.id ? "bg-primary text-white" : "bg-white text-muted-foreground border border-border/50 shadow-sm"
              )}
            >
              {cat.name}
            </Link>
          ))}
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-xl font-black font-headline">
              {activeCategory === 'all' ? 'All Products' : categories?.find(c => c.id === activeCategory)?.name || 'Products'}
            </h2>
            {queryParam && (
              <p className="text-xs text-muted-foreground">Results for &quot;{queryParam}&quot;</p>
            )}
          </div>
          <span className="text-sm font-medium text-muted-foreground">{sortedProducts.length} items found</span>
        </div>

        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center space-y-4">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground font-bold">Refreshing inventory...</p>
          </div>
        ) : sortedProducts.length === 0 ? (
          <div className="py-20 text-center space-y-4">
            <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto">
              <ShoppingBag className="w-10 h-10 text-muted-foreground/30" />
            </div>
            <div className="space-y-1">
              <p className="text-muted-foreground font-bold text-lg">No products found</p>
              <p className="text-sm text-muted-foreground/60">Try searching for something else or clearing filters.</p>
            </div>
            <Link href="/products" className="inline-block mt-4 text-primary font-bold underline">View all items</Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {sortedProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
