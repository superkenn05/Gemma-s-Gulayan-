
"use client";

import Image from 'next/image';
import { Header } from '@/components/layout/header';
import { BottomNav } from '@/components/layout/bottom-nav';
import { Categories } from '@/components/home/categories';
import { ProductCard } from '@/components/products/product-card';
import Link from 'next/link';
import { ArrowRight, ShoppingBag, Loader2 } from 'lucide-react';
import { useFirestore, useCollection, useMemoFirebase, useDoc } from '@/firebase';
import { collection, query, where, limit, doc } from 'firebase/firestore';
import { Product } from '@/types';

export default function Home() {
  const db = useFirestore();
  
  // Fetch store settings for banner from storeConfig/settings
  const settingsRef = useMemoFirebase(() => {
    if (!db) return null;
    return doc(db, 'storeConfig', 'settings');
  }, [db]);
  
  const { data: settings, isLoading: isSettingsLoading } = useDoc<any>(settingsRef);
  
  // Dynamically use bannerUrl from settings if available, otherwise use provided link as default
  const defaultBanner = "https://res.cloudinary.com/dzytzdamb/image/upload/v1773855923/mpa7cacmnksmjqxbgmvu.jpg";
  const promoImage = settings?.bannerUrl || defaultBanner;

  // Fetch popular products
  const popularQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, 'products'), where('isPopular', '==', true), limit(6));
  }, [db]);

  const { data: popularProducts, isLoading: isPopularLoading } = useCollection<Product>(popularQuery);

  // Fetch recent/daily fresh products
  const dailyQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, 'products'), limit(4));
  }, [db]);

  const { data: dailyProducts, isLoading: isDailyLoading } = useCollection<Product>(dailyQuery);

  return (
    <div className="min-h-screen pb-24 bg-background font-body">
      <Header />
      
      <main className="space-y-8 pt-4">
        {/* Promo Banner Section - Dynamically fetched from database with restored text overlay */}
        <section className="px-4">
          <div className="relative w-full aspect-[21/9] rounded-[2.5rem] overflow-hidden shadow-xl shadow-primary/5 group bg-muted">
            {isSettingsLoading ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary/40" />
              </div>
            ) : promoImage ? (
              <>
                <Image 
                  src={promoImage} 
                  alt="Promotion" 
                  fill 
                  className="object-cover transition-transform duration-1000 group-hover:scale-110"
                  data-ai-hint="fresh harvest"
                  unoptimized
                />
                {/* Restored Text Overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/20 to-transparent flex flex-col justify-center px-8">
                  <p className="text-white/80 font-black text-[10px] uppercase tracking-[0.2em] mb-1">Today's Special</p>
                  <h2 className="text-white text-3xl font-black font-headline leading-tight mb-4">
                    Save 40% <br /> <span className="text-accent">On Greens</span>
                  </h2>
                  <div className="bg-white/20 backdrop-blur-md border border-white/30 rounded-full px-4 py-1.5 w-fit">
                    <p className="text-white text-[10px] font-black uppercase tracking-widest">Code: <span className="text-accent">FRESH2024</span></p>
                  </div>
                </div>
              </>
            ) : (
              <div className="absolute inset-0 bg-primary/10 flex items-center justify-center">
                <div className="text-center space-y-2">
                  <ShoppingBag className="w-10 h-10 text-primary/20 mx-auto" />
                  <p className="text-[10px] font-black text-primary/40 uppercase tracking-widest">Awaiting Harvest Banner</p>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Categories Section */}
        <Categories />

        {/* Popular Now - Single Row Scrollable */}
        <section className="px-4">
          <div className="flex items-center justify-between mb-5">
            <div className="space-y-0.5">
              <h2 className="text-xl font-black font-headline tracking-tight text-foreground">Popular Now</h2>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Most loved by locals</p>
            </div>
            <Link href="/products" className="flex items-center text-primary text-xs font-black uppercase tracking-tighter bg-primary/5 px-3 py-1.5 rounded-full hover:bg-primary/10 transition-colors">
              See All <ArrowRight className="w-3 h-3 ml-1" />
            </Link>
          </div>
          
          <div className="flex gap-5 overflow-x-auto pb-4 scrollbar-hide">
            {isPopularLoading ? (
              [1, 2, 3].map(i => (
                <div key={i} className="min-w-[calc(50%-10px)] aspect-[4/5] bg-muted rounded-3xl animate-pulse shrink-0" />
              ))
            ) : !popularProducts || popularProducts.length === 0 ? (
              <div className="w-full py-10 text-center bg-white rounded-3xl border border-dashed border-border">
                <ShoppingBag className="w-10 h-10 text-muted-foreground/30 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground font-bold">No popular items found</p>
              </div>
            ) : (
              popularProducts.map(product => (
                <div key={product.id} className="min-w-[calc(50%-10px)] shrink-0">
                  <ProductCard product={product} />
                </div>
              ))
            )}
          </div>
        </section>

        {/* Daily Fresh - Grid */}
        <section className="px-4 pb-4">
          <div className="flex items-center justify-between mb-5">
            <div className="space-y-0.5">
              <h2 className="text-xl font-black font-headline tracking-tight text-foreground">Daily Fresh</h2>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Harvested this morning</p>
            </div>
            <Link href="/products" className="flex items-center text-primary text-xs font-black uppercase tracking-tighter hover:underline">
              View All
            </Link>
          </div>

          {isDailyLoading ? (
            <div className="grid grid-cols-2 gap-5">
              {[1, 2, 3, 4].map(i => <div key={i} className="aspect-[4/5] bg-muted rounded-3xl animate-pulse" />)}
            </div>
          ) : !dailyProducts || dailyProducts.length === 0 ? (
            <div className="py-10 text-center bg-white rounded-3xl border border-dashed border-border">
              <ShoppingBag className="w-10 h-10 text-muted-foreground/30 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground font-bold">No fresh items today</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-5">
              {dailyProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </section>
      </main>

      <BottomNav />
    </div>
  );
}
