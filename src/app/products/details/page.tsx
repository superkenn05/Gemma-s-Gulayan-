
"use client";

import { useSearchParams } from 'next/navigation';
import { ProductDetailsClient } from '@/components/products/product-details-client';
import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import { BottomNav } from '@/components/layout/bottom-nav';

function DetailsContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get('id');

  if (!id) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center space-y-4">
        <h1 className="text-xl font-black">No product selected</h1>
        <p className="text-muted-foreground">Please browse our catalog to find fresh produce.</p>
      </div>
    );
  }

  return <ProductDetailsClient id={id} />;
}

export default function ProductDetailsPage() {
  return (
    <div className="min-h-screen bg-white">
      <Suspense fallback={
        <div className="min-h-screen flex items-center justify-center bg-white">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
        </div>
      }>
        <DetailsContent />
      </Suspense>
      <BottomNav />
    </div>
  );
}
