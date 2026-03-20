
"use client";

import { Leaf, Apple, Nut, Wheat, Sprout, Carrot, ShoppingBag } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import { Category } from '@/types';

const iconMap: Record<string, any> = {
  leaf: Leaf,
  apple: Apple,
  nut: Nut,
  wheat: Wheat,
  sprout: Sprout,
  carrot: Carrot,
  Leaf: Leaf,
  Apple: Apple,
  Nut: Nut,
  Wheat: Wheat,
  Sprout: Sprout,
  Carrot: Carrot,
};

export function Categories() {
  const db = useFirestore();
  
  const categoriesQuery = useMemoFirebase(() => {
    if (!db) return null;
    return collection(db, 'categories');
  }, [db]);

  const { data: categories, isLoading } = useCollection<Category>(categoriesQuery);

  if (isLoading) {
    return (
      <section className="px-4">
        <div className="flex space-x-5 overflow-x-auto pb-6 scrollbar-hide">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex flex-col items-center space-y-3 min-w-[70px] animate-pulse">
              <div className="w-16 h-16 rounded-[1.5rem] bg-muted"></div>
              <div className="w-10 h-2 bg-muted rounded"></div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (!categories || categories.length === 0) {
    return null;
  }

  return (
    <section className="px-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-black font-headline tracking-tight">Categories</h2>
      </div>
      <div className="flex space-x-5 overflow-x-auto pb-6 scrollbar-hide">
        {categories.map((cat) => {
          const Icon = iconMap[cat.icon] || Leaf;
          return (
            <Link 
              key={cat.id} 
              href={`/products?category=${cat.id}`}
              className="flex flex-col items-center space-y-3 min-w-[70px] group"
            >
              <div className="w-16 h-16 rounded-[1.5rem] bg-white shadow-md shadow-primary/5 flex items-center justify-center transition-all group-hover:bg-primary group-hover:shadow-primary/20 active:scale-95 group-hover:-translate-y-1">
                <Icon className="w-7 h-7 text-primary group-hover:text-white transition-colors" />
              </div>
              <span className="text-[11px] font-black text-center text-muted-foreground group-hover:text-primary transition-colors uppercase tracking-tight">{cat.name}</span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
